import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const templesTable = pgTable("temples", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  deity: text("deity"),
  rating: real("rating"),
  totalBookings: integer("total_bookings").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTempleSchema = createInsertSchema(templesTable).omit({ id: true, createdAt: true });
export type InsertTemple = z.infer<typeof insertTempleSchema>;
export type Temple = typeof templesTable.$inferSelect;
