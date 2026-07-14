import { pgTable, text, serial, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { templesTable } from "./temples";

export const poojaTypesTable = pgTable("pooja_types", {
  id: serial("id").primaryKey(),
  templeId: integer("temple_id").notNull().references(() => templesTable.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  pricePerPerson: real("price_per_person").notNull(),
  maxPersons: integer("max_persons").notNull().default(6),
  isSpecial: boolean("is_special").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPoojaTypeSchema = createInsertSchema(poojaTypesTable).omit({ id: true, createdAt: true });
export type InsertPoojaType = z.infer<typeof insertPoojaTypeSchema>;
export type PoojaType = typeof poojaTypesTable.$inferSelect;
