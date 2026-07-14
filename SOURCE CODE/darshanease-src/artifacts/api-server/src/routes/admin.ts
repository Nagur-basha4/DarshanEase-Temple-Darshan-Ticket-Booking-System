import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, bookingsTable, templesTable, timeSlotsTable, poojaTypesTable } from "@workspace/db";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router: IRouter = Router();

// ── Bookings ─────────────────────────────────────────────────────────────────

// GET /api/admin/bookings?status=confirmed&page=1
router.get("/admin/bookings", requireAdmin, async (req, res): Promise<void> => {
  const status = req.query["status"] as string | undefined;
  const page = Math.max(1, Number(req.query["page"] ?? 1));
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(bookingsTable).$dynamic();
  if (status) query = query.where(eq(bookingsTable.status, status));
  query = query.orderBy(desc(bookingsTable.createdAt)).limit(limit).offset(offset);

  const bookings = await query;

  // Enrich with slot + pooja + temple
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

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(bookingsTable);

  res.json(JSON.parse(JSON.stringify({ bookings: enriched, total: count, page, limit })));
});

// PATCH /api/admin/bookings/:id/status
router.patch("/admin/bookings/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  const { status } = req.body ?? {};

  if (!["confirmed", "cancelled", "completed"].includes(status)) {
    res.status(400).json({ error: "Invalid status." });
    return;
  }

  const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Booking not found." });
    return;
  }

  // Restore seats if cancelling a confirmed booking
  if (status === "cancelled" && existing.status === "confirmed") {
    const [slot] = await db.select().from(timeSlotsTable).where(eq(timeSlotsTable.id, existing.slotId));
    await db.transaction(async (tx) => {
      await tx.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, id));
      if (slot) {
        await tx.update(timeSlotsTable)
          .set({ availableSeats: slot.availableSeats + existing.numPersons })
          .where(eq(timeSlotsTable.id, existing.slotId));
      }
    });
  } else {
    await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, id));
  }

  const [updated] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  res.json(JSON.parse(JSON.stringify(updated)));
});

// ── Temples ───────────────────────────────────────────────────────────────────

// GET /api/admin/temples
router.get("/admin/temples", requireAdmin, async (_req, res): Promise<void> => {
  const temples = await db.select().from(templesTable).orderBy(desc(templesTable.totalBookings));
  res.json(JSON.parse(JSON.stringify(temples)));
});

// PATCH /api/admin/temples/:id
router.patch("/admin/temples/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  const { name, location, city, state, description, imageUrl, deity } = req.body ?? {};

  const [existing] = await db.select().from(templesTable).where(eq(templesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Temple not found." });
    return;
  }

  const [updated] = await db
    .update(templesTable)
    .set({
      ...(name && { name }),
      ...(location && { location }),
      ...(city && { city }),
      ...(state && { state }),
      ...(description && { description }),
      ...(imageUrl && { imageUrl }),
      ...(deity !== undefined && { deity }),
    })
    .where(eq(templesTable.id, id))
    .returning();

  res.json(JSON.parse(JSON.stringify(updated)));
});

export default router;
