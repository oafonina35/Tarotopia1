import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tarotCards = pgTable("tarot_cards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arcana: text("arcana").notNull(), // "Major" or "Minor"
  number: integer("number"), // Card number in the suit/arcana
  suit: text("suit"), // For Minor Arcana: "Cups", "Wands", "Swords", "Pentacles"
  meaning: text("meaning").notNull(),
  symbolism: text("symbolism").notNull(),
  guidance: text("guidance").notNull(),
  imageUrl: text("image_url"),
  keywords: text("keywords").array(),
});

export const cardReadings = pgTable("card_readings", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").references(() => tarotCards.id),
  cardName: text("card_name").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  imageData: text("image_data"), // Base64 encoded image
});

export const trainingData = pgTable("training_data", {
  id: serial("id").primaryKey(),
  imageHash: text("image_hash").notNull().unique(),
  cardId: integer("card_id").notNull().references(() => tarotCards.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTarotCardSchema = createInsertSchema(tarotCards).omit({
  id: true,
});

export const insertCardReadingSchema = createInsertSchema(cardReadings).omit({
  id: true,
  timestamp: true,
});

export const insertTrainingDataSchema = createInsertSchema(trainingData).omit({
  id: true,
  createdAt: true,
});

export type InsertTarotCard = z.infer<typeof insertTarotCardSchema>;
export type TarotCard = typeof tarotCards.$inferSelect;
export type InsertCardReading = z.infer<typeof insertCardReadingSchema>;
export type CardReading = typeof cardReadings.$inferSelect;
export type InsertTrainingData = z.infer<typeof insertTrainingDataSchema>;
export type TrainingData = typeof trainingData.$inferSelect;

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
