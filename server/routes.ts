import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCardReadingSchema, insertTarotCardSchema } from "@shared/schema";
import { z } from "zod";

const cardRecognitionSchema = z.object({
  imageData: z.string().min(1, "Image data is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tarot cards
  app.get("/api/cards", async (req, res) => {
    try {
      const cards = await storage.getAllTarotCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  // Get specific tarot card by ID
  app.get("/api/cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid card ID" });
      }
      
      const card = await storage.getTarotCard(id);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      
      res.json(card);
    } catch (error) {
      console.error("Error fetching card:", error);
      res.status(500).json({ error: "Failed to fetch card" });
    }
  });

  // Recognize card from image (simplified version - would integrate with actual image recognition)
  app.post("/api/recognize-card", async (req, res) => {
    try {
      const result = cardRecognitionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const { imageData } = result.data;
      
      // Simplified card recognition - in real implementation, this would use
      // computer vision/ML models to analyze the image
      // For now, we'll simulate recognition by returning a random Major Arcana card
      const allCards = await storage.getAllTarotCards();
      const majorArcanaCards = allCards.filter(card => card.arcana === "Major");
      
      if (majorArcanaCards.length === 0) {
        return res.status(404).json({ error: "No cards available for recognition" });
      }

      // Simulate recognition (in production, replace with actual image analysis)
      const randomIndex = Math.floor(Math.random() * majorArcanaCards.length);
      const recognizedCard = majorArcanaCards[randomIndex];
      
      // Create a reading record
      const reading = await storage.createCardReading({
        cardId: recognizedCard.id,
        cardName: recognizedCard.name,
        imageData: imageData,
      });

      res.json({
        card: recognizedCard,
        reading: reading,
        confidence: Math.random() * 0.3 + 0.7, // Simulate 70-100% confidence
      });
    } catch (error) {
      console.error("Error recognizing card:", error);
      res.status(500).json({ error: "Failed to recognize card" });
    }
  });

  // Get recent card readings
  app.get("/api/readings", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const readings = await storage.getRecentReadings(limit);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching readings:", error);
      res.status(500).json({ error: "Failed to fetch readings" });
    }
  });

  // Get specific reading by ID
  app.get("/api/readings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid reading ID" });
      }
      
      const reading = await storage.getCardReading(id);
      if (!reading) {
        return res.status(404).json({ error: "Reading not found" });
      }
      
      res.json(reading);
    } catch (error) {
      console.error("Error fetching reading:", error);
      res.status(500).json({ error: "Failed to fetch reading" });
    }
  });

  // Create new card reading
  app.post("/api/readings", async (req, res) => {
    try {
      const result = insertCardReadingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const reading = await storage.createCardReading(result.data);
      res.status(201).json(reading);
    } catch (error) {
      console.error("Error creating reading:", error);
      res.status(500).json({ error: "Failed to create reading" });
    }
  });

  // Create new tarot card
  app.post("/api/cards", async (req, res) => {
    try {
      const result = insertTarotCardSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const card = await storage.createTarotCard(result.data);
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating card:", error);
      res.status(500).json({ error: "Failed to create card" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
