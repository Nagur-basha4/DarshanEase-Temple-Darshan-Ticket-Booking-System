import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import { logger } from "./logger.js";

export async function seedAdmin() {
  const [existing] = await db.select().from(adminsTable).where(eq(adminsTable.username, "admin"));
  if (existing) return;

  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(adminsTable).values({ username: "admin", passwordHash });
  logger.info("Default admin account created (username: admin, password: admin123)");
}
