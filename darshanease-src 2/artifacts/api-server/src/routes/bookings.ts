import { Router, type IRouter } from "express";
import { and, eq, gte, or, sql } from "drizzle-orm";
import { db, bookingsTable, timeSlotsTable, poojaTypesTable, templesTable } from "@workspace/db";
import {
  CreateBookingBody,
  GetBookingParams,
  CancelBookingParams,
  ListBookingsQueryParams,
  ListBookingsResponse,
  GetBookingResponse,
  CreateBookingResponse,
  CancelBookingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "DE-";
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

async function getBookingWithDetails(id: number) {
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id));

  if (!booking) return null;

  const [slot] = await db
    .select()
    .from(timeSlotsTable)
    .where(eq(timeSlotsTable.id, booking.slotId));

  if (!slot) return null;

  const [poojaType] = await db
    .select()
    .from(poojaTypesTable)
    .where(eq(poojaTypesTable.id, slot.poojaTypeId));

  if (!poojaType) return null;

  const [temple] = await db
    .select()
    .from(templesTable)
    .where(eq(templesTable.id, poojaType.templeId));

  return { ...booking, slot, poojaType, temple: temple ?? null };
}

router.get("/bookings", async (req, res): Promise<void> => {
  const query = ListBookingsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.email) conditions.push(eq(bookingsTable.email, query.data.email));
  if (query.data.phone) conditions.push(eq(bookingsTable.phone, query.data.phone));

  const bookings = conditions.length > 0
    ? await db.select().from(bookingsTable).where(or(...conditions)).orderBy(bookingsTable.createdAt)
    : await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);

  // Enrich with details
  const enriched = await Promise.all(
    bookings.map(async (b) => {
      const [slot] = await db.select().from(timeSlotsTable).where(eq(timeSlotsTable.id, b.slotId));
      if (!slot) return { ...b, slot: null, poojaType: null, temple: null };
      const [poojaType] = await db.select().from(poojaTypesTable).where(eq(poojaTypesTable.id, slot.poojaTypeId));
      if (!poojaType) return { ...b, slot, poojaType: null, temple: null };
      const [temple] = await db.select().from(templesTable).where(eq(templesTable.id, poojaType.templeId));
      return { ...b, slot, poojaType, temple: temple ?? null };
    })
  );

  res.json(ListBookingsResponse.parse(JSON.parse(JSON.stringify(enriched))));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { slotId, devoteeName, phone, email, numPersons, specialRequests } = parsed.data;

  // Check slot availability
  const [slot] = await db
    .select()
    .from(timeSlotsTable)
    .where(eq(timeSlotsTable.id, slotId));

  if (!slot) {
    res.status(400).json({ error: "Time slot not found" });
    return;
  }

  if (slot.availableSeats < numPersons) {
    res.status(400).json({ error: `Only ${slot.availableSeats} seats available` });
    return;
  }

  // Get pooja type for price
  const [poojaType] = await db
    .select()
    .from(poojaTypesTable)
    .where(eq(poojaTypesTable.id, slot.poojaTypeId));

  if (!poojaType) {
    res.status(400).json({ error: "Pooja type not found" });
    return;
  }

  const totalAmount = poojaType.pricePerPerson * numPersons;
  const bookingRef = generateBookingRef();

  // Create booking and reduce available seats atomically
  const [booking] = await db.transaction(async (tx) => {
    await tx
      .update(timeSlotsTable)
      .set({ availableSeats: slot.availableSeats - numPersons })
      .where(eq(timeSlotsTable.id, slotId));

    await tx
      .update(templesTable)
      .set({ totalBookings: sql`total_bookings + 1` })
      .where(eq(templesTable.id, poojaType.templeId));

    return tx
      .insert(bookingsTable)
      .values({
        slotId,
        devoteeName,
        phone,
        email,
        numPersons,
        totalAmount,
        status: "confirmed",
        bookingRef,
        specialRequests: specialRequests ?? null,
      })
      .returning();
  });

  const fullBooking = await getBookingWithDetails(booking.id);
  res.status(201).json(CreateBookingResponse.parse(JSON.parse(JSON.stringify(fullBooking))));
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const booking = await getBookingWithDetails(params.data.id);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(GetBookingResponse.parse(JSON.parse(JSON.stringify(booking))));
});

router.patch("/bookings/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (existing.status === "cancelled") {
    res.status(400).json({ error: "Booking is already cancelled" });
    return;
  }

  // Restore seats
  const [slot] = await db
    .select()
    .from(timeSlotsTable)
    .where(eq(timeSlotsTable.id, existing.slotId));

  await db.transaction(async (tx) => {
    await tx
      .update(bookingsTable)
      .set({ status: "cancelled" })
      .where(eq(bookingsTable.id, params.data.id));

    if (slot) {
      await tx
        .update(timeSlotsTable)
        .set({ availableSeats: slot.availableSeats + existing.numPersons })
        .where(eq(timeSlotsTable.id, existing.slotId));
    }
  });

  const updated = await getBookingWithDetails(params.data.id);
  res.json(CancelBookingResponse.parse(JSON.parse(JSON.stringify(updated))));
});

export default router;
