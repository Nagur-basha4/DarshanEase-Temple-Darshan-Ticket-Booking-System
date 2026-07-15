import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, poojaTypesTable } from "@workspace/db";
import {
  GetPoojaTypeParams,
  GetPoojaTypeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pooja-types/:id", async (req, res): Promise<void> => {
  const params = GetPoojaTypeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [poojaType] = await db
    .select()
    .from(poojaTypesTable)
    .where(eq(poojaTypesTable.id, params.data.id));

  if (!poojaType) {
    res.status(404).json({ error: "Pooja type not found" });
    return;
  }

  res.json(GetPoojaTypeResponse.parse(poojaType));
});

export default router;
