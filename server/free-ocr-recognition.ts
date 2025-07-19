import type { TarotCard } from "@shared/schema";

export interface FreeOCRResult {
  card: TarotCard | null;
  confidence: number;
  extractedText: string;
  method: 'free-ocr' | 'tesseract' | 'web-ocr';
}

// Free OCR using Tesseract.js (runs in browser/Node.js)
export async function recognizeWithTesseract(imageData: string, allCards: TarotCard[]): Promise<FreeOCRResult> {
  try {
    // For now, return a placeholder - we'll implement this if user wants it
    console.log('Tesseract OCR not yet implemented - would need tesseract.js package');
    
    return {
      card: null,
      confidence: 0,
      extractedText: 'Tesseract not implemented',
      method: 'tesseract'
    };
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    return {
      card: null,
      confidence: 0,
      extractedText: 'Error',
      method: 'tesseract'
    };
  }
}

// Free OCR.space API (500 requests/day, no registration needed)
export async function recognizeWithFreeOCR(imageData: string, allCards: TarotCard[]): Promise<FreeOCRResult> {
  try {
    console.log('🔍 Using OCR.space free API for text recognition...');
    
    // Convert base64 to buffer for OCR.space
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Use direct base64 upload to OCR.space API
    const requestBody = {
      base64Image: `data:image/png;base64,${base64Data}`,
      apikey: 'helloworld', // Free API key - no registration needed
      language: 'eng',
      isOverlayRequired: false,
      detectOrientation: true,
      scale: true,
      OCREngine: 2 // Use newer engine
    };
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    console.log('🎯 OCR.space API response:', JSON.stringify(result, null, 2));
    
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const extractedText = result.ParsedResults[0].ParsedText || '';
      console.log('🎯 OCR.space extracted text:', extractedText);
      
      if (extractedText.trim() && extractedText !== 'No text found') {
        const matchedCard = findBestCardMatch(extractedText, allCards);
        
        if (matchedCard) {
          console.log(`✅ OCR.space matched: ${matchedCard.card.name} (confidence: ${matchedCard.confidence})`);
          return {
            card: matchedCard.card,
            confidence: matchedCard.confidence,
            extractedText,
            method: 'free-ocr'
          };
        }
      }
    }
    
    return {
      card: null,
      confidence: 0,
      extractedText: result.ParsedResults?.[0]?.ParsedText || 'No text found',
      method: 'free-ocr'
    };
  } catch (error) {
    console.error('OCR.space error:', error);
    return {
      card: null,
      confidence: 0,
      extractedText: 'OCR API Error',
      method: 'free-ocr'
    };
  }
}

// Helper function to find best card match from extracted text
function findBestCardMatch(extractedText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const cleanText = extractedText.toLowerCase().trim();
  
  // Direct name matches
  for (const card of allCards) {
    if (cleanText.includes(card.name.toLowerCase())) {
      return { card, confidence: 0.9 };
    }
  }
  
  // Partial matches
  for (const card of allCards) {
    const cardWords = card.name.toLowerCase().split(' ');
    const matchedWords = cardWords.filter(word => cleanText.includes(word));
    
    if (matchedWords.length > 0) {
      const confidence = matchedWords.length / cardWords.length * 0.7;
      if (confidence > 0.5) {
        return { card, confidence };
      }
    }
  }
  
  return null;
}