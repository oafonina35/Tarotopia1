import { createCanvas, loadImage } from 'canvas';
import type { TarotCard } from "@shared/schema";

/**
 * Simple text recognition for tarot cards that extracts text from the bottom portion
 * where card names are typically displayed
 */
export async function recognizeCardByTextExtraction(imageData: string, allCards: TarotCard[]): Promise<TarotCard | null> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create canvas and load image
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    
    const img = await loadImage(buffer);
    ctx.drawImage(img, 0, 0, 400, 600);
    
    // Extract text region (bottom 15% of card where names typically appear)
    const textRegionHeight = Math.floor(600 * 0.15);
    const textImageData = ctx.getImageData(0, 600 - textRegionHeight, 400, textRegionHeight);
    
    // Convert to grayscale and enhance contrast for better text detection
    const enhancedData = enhanceTextRegion(textImageData);
    
    // Extract potential text patterns
    const textPatterns = extractTextPatterns(enhancedData, 400, textRegionHeight);
    
    // Match against card names
    const matchedCard = matchTextToCards(textPatterns, allCards);
    
    if (matchedCard) {
      console.log(`Text recognition matched: ${matchedCard.name}`);
      return matchedCard;
    }
    
    return null;
  } catch (error) {
    console.error('Text extraction error:', error);
    return null;
  }
}

function enhanceTextRegion(imageData: ImageData): Uint8ClampedArray {
  const data = new Uint8ClampedArray(imageData.data.length);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    
    // Convert to grayscale
    const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    
    // Enhance contrast (simple threshold)
    const enhanced = gray > 128 ? 255 : 0;
    
    data[i] = enhanced;
    data[i + 1] = enhanced;
    data[i + 2] = enhanced;
    data[i + 3] = imageData.data[i + 3];
  }
  
  return data;
}

function extractTextPatterns(data: Uint8ClampedArray, width: number, height: number): string[] {
  const patterns: string[] = [];
  
  // Look for horizontal text patterns (white text on dark background or vice versa)
  for (let y = 0; y < height; y++) {
    let linePattern = '';
    let consecutiveWhite = 0;
    let consecutiveBlack = 0;
    
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      const isWhite = data[pixelIndex] > 128;
      
      if (isWhite) {
        consecutiveWhite++;
        consecutiveBlack = 0;
        if (consecutiveWhite > 3) linePattern += 'W';
      } else {
        consecutiveBlack++;
        consecutiveWhite = 0;
        if (consecutiveBlack > 3) linePattern += 'B';
      }
    }
    
    if (linePattern.length > 10) {
      patterns.push(linePattern);
    }
  }
  
  return patterns;
}

function matchTextToCards(patterns: string[], allCards: TarotCard[]): TarotCard | null {
  // Create simplified pattern signatures for each card name
  const cardSignatures = allCards.map(card => ({
    card,
    signature: createTextSignature(card.name)
  }));
  
  // Create signatures from extracted patterns
  const extractedSignatures = patterns.map(pattern => createPatternSignature(pattern));
  
  // Find best match
  let bestMatch: { card: TarotCard; score: number } | null = null;
  
  for (const { card, signature } of cardSignatures) {
    for (const extractedSig of extractedSignatures) {
      const score = compareSignatures(signature, extractedSig);
      if (score > 0.3 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { card, score };
      }
    }
  }
  
  return bestMatch?.card || null;
}

function createTextSignature(text: string): string {
  // Create a pattern based on word lengths and character types
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  let signature = '';
  
  for (const word of words) {
    if (word.length > 0) {
      signature += word.length.toString();
      // Add first and last character info
      signature += word[0];
      if (word.length > 1) signature += word[word.length - 1];
      signature += '-';
    }
  }
  
  return signature;
}

function createPatternSignature(pattern: string): string {
  // Convert visual pattern to a signature
  const segments = pattern.match(/(W+|B+)/g) || [];
  let signature = '';
  
  for (const segment of segments) {
    const length = segment.length;
    const type = segment[0];
    
    if (length > 5) { // Only significant segments
      signature += length.toString() + type + '-';
    }
  }
  
  return signature;
}

function compareSignatures(textSig: string, patternSig: string): number {
  // Simple similarity comparison
  const textParts = textSig.split('-').filter(p => p.length > 0);
  const patternParts = patternSig.split('-').filter(p => p.length > 0);
  
  if (textParts.length === 0 || patternParts.length === 0) return 0;
  
  let matches = 0;
  const totalComparisons = Math.max(textParts.length, patternParts.length);
  
  for (let i = 0; i < Math.min(textParts.length, patternParts.length); i++) {
    // Look for length pattern matches
    const textLength = parseInt(textParts[i]);
    const patternLength = parseInt(patternParts[i]);
    
    if (!isNaN(textLength) && !isNaN(patternLength)) {
      if (Math.abs(textLength - patternLength) <= 1) {
        matches++;
      }
    }
  }
  
  return matches / totalComparisons;
}