import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { poojaTypesTable } from "./poojaTypes";

export const timeSlotsTable = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  poojaTypeId: integer("pooja_type_id").notNull().references(() => poojaTypesTable.id),
  date: date("date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  availableSeats: integer("available_seats").notNull(),
  totalSeats: integer("total_seats").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlotsTable).omit({ id: true, createdAt: true });
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlotsTable.$inferSelect;
