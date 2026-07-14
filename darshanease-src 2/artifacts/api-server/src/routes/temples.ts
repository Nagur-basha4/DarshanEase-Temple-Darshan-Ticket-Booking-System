import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, templesTable, poojaTypesTable } from "@workspace/db";
import {
  ListTemplesQueryParams,
  GetTempleParams,
  GetTempleResponse,
  ListTemplesResponse,
  ListTemplePoojaTypesParams,
  ListTemplePoojaTypesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/temples", async (req, res): Promise<void> => {
  const query = ListTemplesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(templesTable).$dynamic();

  if (query.data.city) {
    dbQuery = dbQuery.where(eq(templesTable.city, query.data.city));
  } else if (query.data.state) {
    dbQuery = dbQuery.where(eq(templesTable.state, query.data.state));
  }

  const temples = await dbQuery.orderBy(templesTable.name);
  res.json(ListTemplesResponse.parse(temples));
});

router.get("/temples/:id", async (req, res): Promise<void> => {
  const params = GetTempleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [temple] = await db
    .select()
    .from(templesTable)
    .where(eq(templesTable.id, params.data.id));

  if (!temple) {
    res.status(404).json({ error: "Temple not found" });
    return;
  }

  res.json(GetTempleResponse.parse(temple));
});

router.get("/temples/:id/pooja-types", async (req, res): Promise<void> => {
  const params = ListTemplePoojaTypesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const poojas = await db
    .select()
    .from(poojaTypesTable)
    .where(eq(poojaTypesTable.templeId, params.data.id))
    .orderBy(poojaTypesTable.name);

  res.json(ListTemplePoojaTypesResponse.parse(poojas));
});

router.get("/cities", async (_req, res): Promise<void> => {
  const cities = await db
    .select({
      city: templesTable.city,
      state: templesTable.state,
      templeCount: sql<number>`cast(count(*) as int)`,
    })
    .from(templesTable)
    .groupBy(templesTable.city, templesTable.state)
    .orderBy(templesTable.city);

  res.json(cities);
});

export default router;
