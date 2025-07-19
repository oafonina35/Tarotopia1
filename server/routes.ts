import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCardReadingSchema, insertTarotCardSchema } from "@shared/schema";
import { recognizeCardByText } from "./card-recognition";
import { recognizeCardBySimpleMatch } from "./simple-text-recognition";
import { trainImageForCard, findTrainedCard } from "./image-training";
import { enhancedCardRecognition } from "./simple-card-recognition";
import { recognizeWithTraining, trainCard } from "./manual-training-recognition";
import { getTrainingStats } from "./manual-training-recognition";
import { recognizeCardByText } from "./text-recognition";
import { advancedImageRecognition, RECOGNITION_OPTIONS } from "./advanced-recognition";
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
      
      // Get all cards from your custom deck
      const allCards = await storage.getAllTarotCards();
      
      if (allCards.length === 0) {
        return res.status(404).json({ error: "No cards available for recognition" });
      }

      // Use training-based recognition first (most reliable)
      const trainingResult = await recognizeWithTraining(imageData, allCards);
      
      let recognitionResult;
      let recognizedCard;
      
      if (trainingResult.confidence > 0.8) {
        // High confidence from training
        recognitionResult = trainingResult;
        recognizedCard = trainingResult.card;
      } else {
        // Use advanced image recognition as fallback
        const advancedResult = await advancedImageRecognition(imageData, allCards);
        recognitionResult = {
          card: advancedResult.card,
          confidence: Math.max(advancedResult.confidence, trainingResult.confidence),
          isLearned: advancedResult.isLearned,
          method: trainingResult.confidence > advancedResult.confidence ? 'pattern-based' : advancedResult.method
        };
        recognizedCard = trainingResult.confidence > advancedResult.confidence ? trainingResult.card : advancedResult.card;
      }
      
      if (!recognizedCard) {
        return res.status(500).json({ error: "Failed to process image" });
      }
      
      // Create a reading record
      const reading = await storage.createCardReading({
        cardId: recognizedCard.id,
        cardName: recognizedCard.name,
        imageData: imageData,
      });

      // Use confidence from enhanced recognition
      const confidence = recognitionResult.confidence;

      res.json({
        card: recognizedCard,
        reading: reading,
        confidence: recognitionResult.confidence,
        isLearned: recognitionResult.isLearned || false,
        method: recognitionResult.method || (recognitionResult.isLearned ? 'learned' : 'pattern-based')
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

  // Train image recognition with specific card
  app.post("/api/train-card", async (req, res) => {
    try {
      const { imageData, cardId } = req.body;
      
      if (!imageData || !cardId) {
        return res.status(400).json({ error: "Image data and card ID required" });
      }

      // Get the card details
      const allCards = await storage.getAllTarotCards();
      const targetCard = allCards.find(c => c.id === cardId);
      
      if (!targetCard) {
        return res.status(404).json({ error: "Card not found" });
      }

      // Train the new system
      trainCard(imageData, targetCard);
      
      // Note: Using only the new training system now
      
      res.json({ 
        success: true, 
        message: `Image trained for ${targetCard.name}`,
        cardName: targetCard.name
      });
    } catch (error) {
      console.error("Error training card:", error);
      res.status(500).json({ error: "Failed to train card" });
    }
  });

  // Get training statistics
  app.get("/api/training-stats", async (req, res) => {
    try {
      const stats = getTrainingStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting training stats:", error);
      res.status(500).json({ error: "Failed to get training stats" });
    }
  });

  // Test text recognition (debug endpoint)
  app.post("/api/debug-text-recognition", async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: "Image data required" });
      }

      const allCards = await storage.getAllTarotCards();
      const result = await recognizeCardByText(imageData, allCards);
      
      res.json({
        extractedText: result.extractedText,
        matchedCard: result.card?.name || 'No match found',
        confidence: result.confidence,
        method: result.method
      });
    } catch (error) {
      console.error("Error in text recognition debug:", error);
      res.status(500).json({ error: "Failed to process text recognition" });
    }
  });

  // Get recognition options and pricing
  app.get("/api/recognition-options", async (req, res) => {
    try {
      res.json(RECOGNITION_OPTIONS);
    } catch (error) {
      console.error("Error fetching recognition options:", error);
      res.status(500).json({ error: "Failed to fetch options" });
    }
  });

  // Get all cards for manual selection
  app.get("/api/cards", async (req, res) => {
    try {
      const cards = await storage.getAllTarotCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
