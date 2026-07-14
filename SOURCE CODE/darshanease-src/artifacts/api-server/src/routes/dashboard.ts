import { Router, type IRouter } from "express";
import { eq, sql, gte, and } from "drizzle-orm";
import { db, bookingsTable, templesTable, timeSlotsTable, poojaTypesTable } from "@workspace/db";
import { GetDashboardResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalTemplesResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(templesTable);

  const [todayBookingsResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(bookingsTable)
    .where(
      and(
        gte(bookingsTable.createdAt, todayStart),
        eq(bookingsTable.status, "confirmed")
      )
    );

  const upcomingBookings = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(bookingsTable)
    .leftJoin(timeSlotsTable, eq(bookingsTable.slotId, timeSlotsTable.id))
    .where(
      and(
        gte(timeSlotsTable.date, today),
        eq(bookingsTable.status, "confirmed")
      )
    );

  const [revenueResult] = await db
    .select({ total: sql<number>`cast(coalesce(sum(total_amount), 0) as float)` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "confirmed"));

  const popularTemples = await db
    .select()
    .from(templesTable)
    .orderBy(sql`total_bookings desc`)
    .limit(5);

  // Recent bookings with details
  const recentBookingsRaw = await db
    .select()
    .from(bookingsTable)
    .orderBy(sql`bookings.created_at desc`)
    .limit(10);

  const recentBookings = await Promise.all(
    recentBookingsRaw.map(async (b) => {
      const [slot] = await db.select().from(timeSlotsTable).where(eq(timeSlotsTable.id, b.slotId));
      if (!slot) return { ...b, slot: null, poojaType: null, temple: null };
      const [poojaType] = await db.select().from(poojaTypesTable).where(eq(poojaTypesTable.id, slot.poojaTypeId));
      if (!poojaType) return { ...b, slot, poojaType: null, temple: null };
      const [temple] = await db.select().from(templesTable).where(eq(templesTable.id, poojaType.templeId));
      return { ...b, slot, poojaType, temple: temple ?? null };
    })
  );

  const stats = {
    totalTemples: totalTemplesResult?.count ?? 0,
    totalBookingsToday: todayBookingsResult?.count ?? 0,
    upcomingBookings: upcomingBookings[0]?.count ?? 0,
    totalRevenue: revenueResult?.total ?? 0,
    popularTemples,
    recentBookings,
  };

  // Drizzle returns createdAt as Date objects; JSON round-trip converts them to ISO strings
  res.json(GetDashboardResponse.parse(JSON.parse(JSON.stringify(stats))));
});

export default router;
