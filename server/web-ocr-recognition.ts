import type { TarotCard } from "@shared/schema";

interface WebOCRResult {
  card: TarotCard;
  confidence: number;
  method: string;
  extractedText?: string;
}

/**
 * Web-based OCR using free OCR.space API
 * Completely free alternative to Google Vision
 */
export async function webOCRRecognition(imageData: string, allCards: TarotCard[]): Promise<WebOCRResult | null> {
  try {
    console.log('🌐 Using free OCR.space API for text recognition...');
    
    // Use the free OCR.space API
    const extractedText = await callOCRSpaceAPI(imageData);
    
    if (extractedText && extractedText.length > 2) {
      console.log('🌐 OCR.space extracted text:', extractedText);
      
      // Enhanced text matching
      const matchResult = enhancedTextMatching(extractedText, allCards);
      if (matchResult) {
        return {
          card: matchResult.card,
          confidence: matchResult.confidence,
          method: 'web-ocr',
          extractedText
        };
      }
    }
    
    return null;
  } catch (error) {
    console.log('Web OCR error:', error);
    return null;
  }
}

async function callOCRSpaceAPI(imageData: string): Promise<string> {
  try {
    // Convert base64 to form data for OCR.space
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Data}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');
    formData.append('scale', 'true');
    formData.append('isTable', 'false');
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'helloworld', // Free API key
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const parsedText = result.ParsedResults[0].ParsedText || '';
      return parsedText.trim();
    }
    
    return '';
  } catch (error) {
    console.log('OCR.space API call failed:', error);
    return '';
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
  
  // Strategy 5: Partial word matching
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
    
    for (const cardWord of cardWords) {
      for (const word of words) {
        if (word.includes(cardWord) || cardWord.includes(word)) {
          matchCount++;
        }
      }
    }
    
    if (matchCount > 0) {
      const confidence = (matchCount / cardWords.length) * 0.7; // Max 0.7 for partial matches
      if (confidence > 0.3 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { card, confidence };
      }
    }
  }
  
  return bestMatch;
}