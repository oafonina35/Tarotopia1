import { users, tarotCards, cardReadings, type User, type InsertUser, type TarotCard, type InsertTarotCard, type CardReading, type InsertCardReading } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tarot card methods
  getTarotCard(id: number): Promise<TarotCard | undefined>;
  getTarotCardByName(name: string): Promise<TarotCard | undefined>;
  getAllTarotCards(): Promise<TarotCard[]>;
  createTarotCard(card: InsertTarotCard): Promise<TarotCard>;
  
  // Card reading methods
  getCardReading(id: number): Promise<CardReading | undefined>;
  getRecentReadings(limit?: number): Promise<CardReading[]>;
  createCardReading(reading: InsertCardReading): Promise<CardReading>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTarotCard(id: number): Promise<TarotCard | undefined> {
    const [card] = await db.select().from(tarotCards).where(eq(tarotCards.id, id));
    return card || undefined;
  }

  async getTarotCardByName(name: string): Promise<TarotCard | undefined> {
    const [card] = await db.select().from(tarotCards).where(eq(tarotCards.name, name));
    return card || undefined;
  }

  async getAllTarotCards(): Promise<TarotCard[]> {
    return await db.select().from(tarotCards);
  }

  async createTarotCard(insertCard: InsertTarotCard): Promise<TarotCard> {
    const [card] = await db
      .insert(tarotCards)
      .values(insertCard)
      .returning();
    return card;
  }

  async getCardReading(id: number): Promise<CardReading | undefined> {
    const [reading] = await db.select().from(cardReadings).where(eq(cardReadings.id, id));
    return reading || undefined;
  }

  async getRecentReadings(limit: number = 10): Promise<CardReading[]> {
    return await db
      .select()
      .from(cardReadings)
      .orderBy(desc(cardReadings.timestamp))
      .limit(limit);
  }

  async createCardReading(insertReading: InsertCardReading): Promise<CardReading> {
    const [reading] = await db
      .insert(cardReadings)
      .values(insertReading)
      .returning();
    return reading;
  }
}

export const storage = new DatabaseStorage();