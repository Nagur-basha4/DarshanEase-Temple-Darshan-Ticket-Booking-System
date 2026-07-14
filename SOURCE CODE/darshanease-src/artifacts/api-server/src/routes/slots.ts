import { Router, type IRouter } from "express";
import { and, eq, gte } from "drizzle-orm";
import { db, timeSlotsTable } from "@workspace/db";
import {
  ListSlotsQueryParams,
  ListSlotsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/slots", async (req, res): Promise<void> => {
  const query = ListSlotsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const dateFilter = query.data.date || today;

  const slots = await db
    .select()
    .from(timeSlotsTable)
    .where(
      and(
        eq(timeSlotsTable.poojaTypeId, query.data.poojaTypeId),
        query.data.date
          ? eq(timeSlotsTable.date, query.data.date)
          : gte(timeSlotsTable.date, today)
      )
    )
    .orderBy(timeSlotsTable.date, timeSlotsTable.startTime);

  res.json(ListSlotsResponse.parse(slots));
});

export default router;
