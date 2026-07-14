import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { timeSlotsTable } from "./timeSlots";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").notNull().references(() => timeSlotsTable.id),
  devoteeName: text("devotee_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  numPersons: integer("num_persons").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("confirmed"),
  bookingRef: text("booking_ref").notNull(),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
