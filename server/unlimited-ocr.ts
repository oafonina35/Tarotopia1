import type { TarotCard } from "@shared/schema";

export interface UnlimitedOCRResult {
  card: TarotCard | null;
  confidence: number;
  extractedText: string;
  method: 'tesseract' | 'browser-ocr' | 'offline-ocr';
}

// Tesseract.js - Unlimited, runs locally in Node.js
export async function recognizeWithTesseract(imageData: string, allCards: TarotCard[]): Promise<UnlimitedOCRResult> {
  try {
    console.log('🔍 Using Tesseract.js for unlimited OCR...');
    
    // Dynamic import of tesseract.js
    const { createWorker } = await import('tesseract.js');
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Initialize Tesseract worker with optimized settings
    const worker = await createWorker('eng');
    
    // Configure for better card text recognition
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .-',
      tessedit_pageseg_mode: '6', // Uniform block of text
      preserve_interword_spaces: '1'
    });
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    await worker.terminate();
    
    console.log('🎯 Tesseract extracted text:', text);
    
    if (text.trim()) {
      const matchedCard = findBestCardMatch(text, allCards);
      
      if (matchedCard) {
        console.log(`✅ Tesseract matched: ${matchedCard.card.name} (confidence: ${matchedCard.confidence})`);
        return {
          card: matchedCard.card,
          confidence: matchedCard.confidence,
          extractedText: text,
          method: 'tesseract'
        };
      }
    }
    
    return {
      card: null,
      confidence: 0,
      extractedText: text || 'No text found',
      method: 'tesseract'
    };
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    return {
      card: null,
      confidence: 0,
      extractedText: 'Tesseract Error',
      method: 'tesseract'
    };
  }
}

// Browser-based OCR using Web APIs (completely client-side)
export async function getBrowserOCRInstructions(): Promise<string> {
  return `
    Browser OCR Options (Unlimited & Offline):
    
    1. Tesseract.js in Browser:
       - Runs completely in browser
       - No server calls, unlimited use
       - 2-4MB download, then offline forever
    
    2. Web Text Detection API:
       - Native browser text recognition
       - Works offline after initial load
       - Supported in Chrome/Edge
    
    3. Client-side Implementation:
       - Move OCR to frontend
       - No API limits or costs
       - Works without internet after load
  `;
}

// Helper function to find best card match from extracted text
function findBestCardMatch(extractedText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const cleanText = extractedText.toLowerCase().trim();
  
  // Enhanced pattern matching for numbered format (like "9. THE HERMIT")
  const numberedPattern = cleanText.match(/(\d+)\.\s*(?:the\s+)?([a-z\s]+)/i);
  if (numberedPattern) {
    const cardNumber = parseInt(numberedPattern[1]);
    const cardName = numberedPattern[2].trim();
    
    // Find by Major Arcana number
    const majorCard = allCards.find(card => 
      card.arcana === 'Major' && card.number === cardNumber
    );
    if (majorCard) {
      // Verify name similarity
      const nameWords = cardName.split(/\s+/);
      const cardWords = majorCard.name.toLowerCase().replace('the ', '').split(/\s+/);
      const matchedWords = nameWords.filter(word => 
        cardWords.some(cardWord => cardWord.includes(word) || word.includes(cardWord))
      );
      if (matchedWords.length > 0) {
        return { card: majorCard, confidence: 0.98 };
      }
    }
  }
  
  // Roman numeral patterns (XXI. THE WORLD, etc.)
  const romanPattern = cleanText.match(/(xxi|xx|xix|xviii|xvii|xvi|xv|xiv|xiii|xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\.\s*(?:the\s+)?([a-z\s]+)/i);
  if (romanPattern) {
    const romanToNumber = {
      'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10,
      'xi': 11, 'xii': 12, 'xiii': 13, 'xiv': 14, 'xv': 15, 'xvi': 16, 'xvii': 17, 'xviii': 18, 'xix': 19, 'xx': 20, 'xxi': 21
    };
    const cardNumber = romanToNumber[romanPattern[1].toLowerCase()];
    if (cardNumber !== undefined) {
      const majorCard = allCards.find(card => 
        card.arcana === 'Major' && card.number === cardNumber
      );
      if (majorCard) {
        return { card: majorCard, confidence: 0.97 };
      }
    }
  }
  
  // Direct name matches (high confidence)
  for (const card of allCards) {
    const cardName = card.name.toLowerCase();
    if (cleanText.includes(cardName)) {
      return { card, confidence: 0.95 };
    }
  }
  
  // Enhanced number + suit matches for minor arcana
  const numberMatch = cleanText.match(/(\d+|ace|king|queen|knight|jack|page)/i);
  const suitMatch = cleanText.match(/(wands?|cups?|swords?|pentacles?|coins?|disks?)/i);
  
  if (numberMatch && suitMatch) {
    const number = numberMatch[1].toLowerCase();
    const suit = suitMatch[1].toLowerCase();
    
    for (const card of allCards) {
      const cardName = card.name.toLowerCase();
      if (cardName.includes(number) && 
          (cardName.includes(suit) || 
           (suit.includes('pentacle') && cardName.includes('coin')) ||
           (suit.includes('coin') && cardName.includes('pentacle')))) {
        return { card, confidence: 0.9 };
      }
    }
  }
  
  // Enhanced partial word matches with better scoring
  const textWords = cleanText.split(/\s+/).filter(word => word.length > 2);
  let bestMatch: { card: TarotCard; confidence: number } | null = null;
  
  for (const card of allCards) {
    const cardWords = card.name.toLowerCase().split(/\s+/);
    let matchScore = 0;
    let totalWords = cardWords.length;
    
    for (const cardWord of cardWords) {
      for (const textWord of textWords) {
        if (cardWord === textWord) {
          matchScore += 1.0; // Exact match
        } else if (cardWord.includes(textWord) || textWord.includes(cardWord)) {
          matchScore += 0.7; // Partial match
        } else if (cardWord.length > 3 && textWord.length > 3) {
          // Check similarity for longer words
          const similarity = calculateStringSimilarity(cardWord, textWord);
          if (similarity > 0.7) {
            matchScore += similarity * 0.6;
          }
        }
      }
    }
    
    if (matchScore > 0) {
      const confidence = Math.min((matchScore / totalWords) * 0.85, 0.85);
      if (confidence > 0.4 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { card, confidence };
      }
    }
  }
  
  return bestMatch;
}

// Simple string similarity calculation
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Calculate Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Self-hosted OCR options
export function getSelfHostedOCROptions(): string {
  return `
    Self-Hosted Unlimited OCR Solutions:
    
    1. Tesseract.js (Node.js/Browser):
       ✅ Already implemented above
       ✅ Unlimited use, no API calls
       ✅ Works offline
    
    2. PaddleOCR (Python):
       - Ultra-accurate Chinese OCR engine
       - Supports 80+ languages
       - GPU acceleration available
       - Install: pip install paddlepaddle paddleocr
    
    3. EasyOCR (Python):
       - 80+ languages supported
       - Good accuracy, easy setup
       - Install: pip install easyocr
    
    4. TrOCR (Transformers):
       - Microsoft's transformer-based OCR
       - State-of-the-art accuracy
       - Runs locally with Hugging Face
    
    5. Surya OCR (2024):
       - Modern, accurate OCR
       - Layout detection included
       - Self-hosted, no limits
    
    All options run on your own hardware with zero API costs.
  `;
}