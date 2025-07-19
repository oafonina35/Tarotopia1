import OpenAI from "openai";
import type { TarotCard } from "@shared/schema";

let openai: OpenAI | null = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function recognizeCardByText(imageData: string, allCards: TarotCard[]): Promise<TarotCard | null> {
  try {
    // Check if OpenAI is available
    if (!openai) {
      console.log("OpenAI API key not provided, OCR recognition unavailable");
      return null;
    }
    
    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Use OpenAI Vision to extract text from the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the exact card name from this tarot card image. Look for the title text on the card. Return only the card name, nothing else. If you can't clearly read the name, return 'UNKNOWN'."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 50,
    });

    const extractedText = response.choices[0].message.content?.trim();
    
    if (!extractedText || extractedText === 'UNKNOWN') {
      return null;
    }

    // Find matching card by name (case-insensitive, flexible matching)
    const matchedCard = findBestCardMatch(extractedText, allCards);
    
    return matchedCard;
  } catch (error) {
    console.error("Error in OCR card recognition:", error);
    return null;
  }
}

function findBestCardMatch(extractedName: string, allCards: TarotCard[]): TarotCard | null {
  const normalizedExtracted = normalizeCardName(extractedName);
  
  // Try exact match first
  for (const card of allCards) {
    if (normalizeCardName(card.name) === normalizedExtracted) {
      return card;
    }
  }
  
  // Try partial matches
  for (const card of allCards) {
    const normalizedCardName = normalizeCardName(card.name);
    if (normalizedCardName.includes(normalizedExtracted) || normalizedExtracted.includes(normalizedCardName)) {
      return card;
    }
  }
  
  // Try fuzzy matching for common variations
  for (const card of allCards) {
    if (isCloseMatch(normalizedExtracted, normalizeCardName(card.name))) {
      return card;
    }
  }
  
  return null;
}

function normalizeCardName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function isCloseMatch(str1: string, str2: string): boolean {
  // Simple fuzzy matching - check if most words match
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  let matches = 0;
  for (const word1 of words1) {
    if (word1.length > 2) { // Only check meaningful words
      for (const word2 of words2) {
        if (word2.includes(word1) || word1.includes(word2)) {
          matches++;
          break;
        }
      }
    }
  }
  
  // Consider it a match if at least half the meaningful words match
  const meaningfulWords = words1.filter(w => w.length > 2).length;
  return meaningfulWords > 0 && matches >= Math.ceil(meaningfulWords / 2);
}