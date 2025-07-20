import OpenAI from "openai";
import type { TarotCard } from "@shared/schema";

interface OpenAIResult {
  card: TarotCard;
  confidence: number;
  method: string;
  extractedText?: string;
  reasoning?: string;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * OpenAI Vision-powered tarot card recognition
 * Uses GPT-4o to directly identify cards from images
 */
export async function openaiVisionRecognition(imageData: string, allCards: TarotCard[]): Promise<OpenAIResult | null> {
  try {
    console.log('🤖 Using OpenAI GPT-4o Vision for card recognition...');
    
    // Create a list of all possible card names for the AI to choose from
    const cardNames = allCards.map(card => card.name).join(', ');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert tarot card reader and visual recognition specialist. Your task is to identify tarot cards from images with high accuracy.

Available cards in this deck: ${cardNames}

Analyze the image and identify the tarot card. Look for:
1. Card name text (if visible)
2. Visual symbols and imagery
3. Number or court card indicators
4. Suit symbols (wands, cups, swords, pentacles)
5. Major Arcana symbolism

Respond with JSON in this exact format:
{
  "cardName": "exact card name from the list",
  "confidence": 0.85,
  "reasoning": "explanation of how you identified the card",
  "extractedText": "any text you can see on the card"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please identify this tarot card. Be specific and match exactly to one of the cards in the available deck list."
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    if (result.cardName) {
      console.log('🤖 OpenAI identified card:', result.cardName);
      console.log('🤖 OpenAI reasoning:', result.reasoning);
      
      // Find the matching card from our deck
      const matchedCard = findMatchingCard(result.cardName, allCards);
      if (matchedCard) {
        return {
          card: matchedCard,
          confidence: Math.min(0.95, result.confidence || 0.8),
          method: 'openai-vision',
          extractedText: result.extractedText,
          reasoning: result.reasoning
        };
      }
    }
    
    return null;
  } catch (error) {
    console.log('OpenAI Vision error:', error);
    return null;
  }
}

function findMatchingCard(aiCardName: string, allCards: TarotCard[]): TarotCard | null {
  const normalizedAIName = aiCardName.toLowerCase().trim();
  
  // Strategy 1: Exact match
  for (const card of allCards) {
    if (card.name.toLowerCase() === normalizedAIName) {
      return card;
    }
  }
  
  // Strategy 2: Contains match
  for (const card of allCards) {
    if (normalizedAIName.includes(card.name.toLowerCase()) || 
        card.name.toLowerCase().includes(normalizedAIName)) {
      return card;
    }
  }
  
  // Strategy 3: Word-by-word matching
  const aiWords = normalizedAIName.split(/\s+/);
  let bestMatch: { card: TarotCard; score: number } | null = null;
  
  for (const card of allCards) {
    const cardWords = card.name.toLowerCase().split(/\s+/);
    let matchScore = 0;
    
    for (const aiWord of aiWords) {
      for (const cardWord of cardWords) {
        if (aiWord === cardWord) {
          matchScore += 2;
        } else if (aiWord.includes(cardWord) || cardWord.includes(aiWord)) {
          matchScore += 1;
        }
      }
    }
    
    const normalizedScore = matchScore / Math.max(aiWords.length, cardWords.length);
    if (normalizedScore > 0.5 && (!bestMatch || normalizedScore > bestMatch.score)) {
      bestMatch = { card, score: normalizedScore };
    }
  }
  
  return bestMatch?.card || null;
}

/**
 * Enhanced OpenAI recognition that provides detailed card analysis
 */
export async function openaiDetailedAnalysis(imageData: string, allCards: TarotCard[]): Promise<{
  card: TarotCard | null;
  analysis: string;
  colors: string[];
  symbols: string[];
  confidence: number;
}> {
  try {
    const cardNames = allCards.map(card => card.name).join(', ');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert tarot reader analyzing card images. Provide detailed analysis including visual elements.

Available cards: ${cardNames}

Analyze the image and provide comprehensive details in JSON format:
{
  "cardName": "exact match from available cards or null",
  "confidence": 0.85,
  "analysis": "detailed description of the card's imagery and symbolism",
  "dominantColors": ["color1", "color2", "color3"],
  "symbols": ["symbol1", "symbol2", "symbol3"],
  "textVisible": "any text you can read on the card"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this tarot card image in detail. Identify the card if possible and describe all visual elements you observe."
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    let matchedCard = null;
    if (result.cardName) {
      matchedCard = findMatchingCard(result.cardName, allCards);
    }
    
    return {
      card: matchedCard,
      analysis: result.analysis || '',
      colors: result.dominantColors || [],
      symbols: result.symbols || [],
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.log('OpenAI detailed analysis error:', error);
    return {
      card: null,
      analysis: '',
      colors: [],
      symbols: [],
      confidence: 0
    };
  }
}