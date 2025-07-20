import type { TarotCard } from "@shared/schema";
import { createWorker } from 'tesseract.js';

interface TesseractResult {
  card: TarotCard;
  confidence: number;
  method: string;
  extractedText?: string;
}

/**
 * Offline OCR using Tesseract.js - completely free and unlimited
 */
export async function tesseractRecognition(imageData: string, allCards: TarotCard[]): Promise<TesseractResult | null> {
  let worker: any = null;
  
  try {
    console.log('🔤 Using Tesseract.js for offline text recognition...');
    
    // Create Tesseract worker
    worker = await createWorker('eng');
    
    // Configure for better accuracy
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ',
      tessedit_pageseg_mode: '6', // Assume uniform block of text
    });
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(buffer);
    
    await worker.terminate();
    worker = null;
    
    if (text && text.trim().length > 1) {
      console.log('🔤 Tesseract extracted text:', text.trim());
      
      // Enhanced text matching
      const matchResult = enhancedTextMatching(text.trim(), allCards);
      if (matchResult) {
        return {
          card: matchResult.card,
          confidence: matchResult.confidence,
          method: 'tesseract',
          extractedText: text.trim()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.log('Tesseract OCR error:', error);
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        // Ignore termination errors
      }
    }
    return null;
  }
}

function enhancedTextMatching(text: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const words = cleanText.split(/\s+/).filter(w => w.length > 1);
  
  console.log('🔍 Enhanced matching words:', words);
  
  // Strategy 1: Exact card name matches
  for (const card of allCards) {
    const cardName = card.name.toLowerCase();
    if (cleanText.includes(cardName)) {
      return { card, confidence: 0.95 };
    }
  }
  
  // Strategy 2: Number + suit combinations
  const numberSuitMatch = findNumberSuitPattern(words, allCards);
  if (numberSuitMatch) return numberSuitMatch;
  
  // Strategy 3: Major Arcana patterns
  const majorArcanaMatch = findMajorArcanaPattern(words, allCards);
  if (majorArcanaMatch) return majorArcanaMatch;
  
  // Strategy 4: Court card patterns
  const courtCardMatch = findCourtCardPattern(words, allCards);
  if (courtCardMatch) return courtCardMatch;
  
  // Strategy 5: Partial word matching with fuzzy logic
  const partialMatch = findPartialMatch(words, allCards);
  if (partialMatch) return partialMatch;
  
  return null;
}

function findNumberSuitPattern(words: string[], allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const numbers = ['ace', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const suits = ['wands', 'cups', 'swords', 'pentacles', 'wand', 'cup', 'sword', 'pentacle', 'coins', 'coin'];
  
  let foundNumber = '';
  let foundSuit = '';
  
  for (const word of words) {
    if (numbers.includes(word)) foundNumber = word;
    if (suits.includes(word)) foundSuit = word;
  }
  
  if (foundNumber && foundSuit) {
    // Normalize numbers
    const numberMap: Record<string, string> = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
    };
    const normalizedNumber = numberMap[foundNumber] || foundNumber;
    
    // Normalize suits
    const suitMap: Record<string, string> = {
      'wand': 'wands', 'cup': 'cups', 'sword': 'swords', 'pentacle': 'pentacles',
      'coins': 'pentacles', 'coin': 'pentacles'
    };
    const normalizedSuit = suitMap[foundSuit] || foundSuit;
    
    for (const card of allCards) {
      const cardName = card.name.toLowerCase();
      if (cardName.includes(normalizedNumber) && cardName.includes(normalizedSuit)) {
        return { card, confidence: 0.9 };
      }
    }
  }
  
  return null;
}

function findMajorArcanaPattern(words: string[], allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const majorKeywords = [
    'fool', 'magician', 'priestess', 'empress', 'emperor', 'hierophant',
    'lovers', 'chariot', 'strength', 'hermit', 'wheel', 'fortune', 'justice',
    'hanged', 'man', 'death', 'temperance', 'devil', 'tower', 'star',
    'moon', 'sun', 'judgement', 'judgment', 'world'
  ];
  
  for (const word of words) {
    for (const keyword of majorKeywords) {
      if (word.includes(keyword) || keyword.includes(word)) {
        for (const card of allCards) {
          if (card.arcana === 'Major' && card.name.toLowerCase().includes(keyword)) {
            return { card, confidence: 0.85 };
          }
        }
      }
    }
  }
  
  return null;
}

function findCourtCardPattern(words: string[], allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const courtTitles = ['page', 'knight', 'queen', 'king'];
  const suits = ['wands', 'cups', 'swords', 'pentacles'];
  
  let foundTitle = '';
  let foundSuit = '';
  
  for (const word of words) {
    if (courtTitles.includes(word)) foundTitle = word;
    if (suits.includes(word)) foundSuit = word;
  }
  
  if (foundTitle && foundSuit) {
    for (const card of allCards) {
      const cardName = card.name.toLowerCase();
      if (cardName.includes(foundTitle) && cardName.includes(foundSuit)) {
        return { card, confidence: 0.88 };
      }
    }
  }
  
  return null;
}

function findPartialMatch(words: string[], allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  let bestMatch: { card: TarotCard; confidence: number } | null = null;
  
  for (const card of allCards) {
    const cardWords = card.name.toLowerCase().split(/\s+/);
    let matchCount = 0;
    let totalLength = 0;
    
    for (const cardWord of cardWords) {
      totalLength += cardWord.length;
      for (const word of words) {
        // Fuzzy matching - allow partial matches
        if (word.includes(cardWord) || cardWord.includes(word)) {
          matchCount += cardWord.length;
        }
        // Levenshtein distance for close matches
        else if (levenshteinDistance(word, cardWord) <= 2 && cardWord.length > 3) {
          matchCount += cardWord.length * 0.7;
        }
      }
    }
    
    if (matchCount > 0) {
      const confidence = Math.min(0.8, (matchCount / totalLength) * 0.9);
      if (confidence > 0.4 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { card, confidence };
      }
    }
  }
  
  return bestMatch;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}