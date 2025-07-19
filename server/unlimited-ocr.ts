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
    
    // Initialize Tesseract worker
    const worker = await createWorker('eng');
    
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
  
  // Direct name matches (high confidence)
  for (const card of allCards) {
    const cardName = card.name.toLowerCase();
    if (cleanText.includes(cardName)) {
      return { card, confidence: 0.95 };
    }
  }
  
  // Number + suit matches for minor arcana
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
  
  // Partial word matches (medium confidence)
  const textWords = cleanText.split(/\s+/).filter(word => word.length > 2);
  let bestMatch: { card: TarotCard; confidence: number } | null = null;
  
  for (const card of allCards) {
    const cardWords = card.name.toLowerCase().split(/\s+/);
    const matchedWords = cardWords.filter(cardWord => 
      textWords.some(textWord => 
        textWord.includes(cardWord) || cardWord.includes(textWord)
      )
    );
    
    if (matchedWords.length > 0) {
      const confidence = (matchedWords.length / cardWords.length) * 0.8;
      if (confidence > 0.4 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { card, confidence };
      }
    }
  }
  
  return bestMatch;
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