import type { TarotCard } from "@shared/schema";
import { createCanvas, loadImage } from 'canvas';

interface ColorScheme {
  dominant: string;
  secondary: string;
  accent: string;
  brightness: number;
}

interface VisualRecognitionResult {
  card: TarotCard;
  confidence: number;
  method: string;
  extractedText?: string;
  colorScheme?: ColorScheme;
}

/**
 * Advanced Visual Recognition using Color Analysis and Pattern Matching
 */
export async function visualCardRecognition(imageData: string, allCards: TarotCard[]): Promise<VisualRecognitionResult | null> {
  try {
    console.log('🎨 Starting visual color-based recognition...');
    
    // Extract color scheme from image
    const colorScheme = await extractColorScheme(imageData);
    console.log('🎨 Extracted color scheme:', colorScheme);
    
    // Try OpenAI Vision API for text recognition
    const visionResult = await tryOpenAIVision(imageData, allCards);
    if (visionResult && visionResult.confidence > 0.7) {
      return {
        ...visionResult,
        colorScheme
      };
    }
    
    // Color-based card matching
    const colorMatch = matchCardByColors(colorScheme, allCards);
    if (colorMatch) {
      console.log(`🎨 Color-based match: ${colorMatch.card.name} (${colorMatch.confidence})`);
      return {
        card: colorMatch.card,
        confidence: colorMatch.confidence,
        method: 'color-analysis',
        extractedText: 'Visual color analysis',
        colorScheme
      };
    }
    
    return null;
  } catch (error) {
    console.log('Visual recognition error:', error);
    return null;
  }
}

async function extractColorScheme(imageData: string): Promise<ColorScheme> {
  try {
    // Convert base64 to image
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Load image with canvas
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0);
    
    // Sample colors from key areas of the card
    const imageData_ctx = ctx.getImageData(0, 0, img.width, img.height);
    const colors = extractDominantColors(imageData_ctx.data, img.width, img.height);
    
    return {
      dominant: colors.dominant,
      secondary: colors.secondary,
      accent: colors.accent,
      brightness: colors.brightness
    };
  } catch (error) {
    console.log('Color extraction error:', error);
    // Return default color scheme
    return {
      dominant: '#000000',
      secondary: '#666666',
      accent: '#ffffff',
      brightness: 0.5
    };
  }
}

function extractDominantColors(data: Uint8ClampedArray, width: number, height: number): ColorScheme {
  const colorCounts: { [key: string]: number } = {};
  let totalBrightness = 0;
  let pixelCount = 0;
  
  // Sample every 10th pixel for performance
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Skip very dark or very light pixels (likely background)
    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 225) continue;
    
    totalBrightness += brightness;
    pixelCount++;
    
    // Quantize colors to reduce noise
    const quantR = Math.floor(r / 32) * 32;
    const quantG = Math.floor(g / 32) * 32;
    const quantB = Math.floor(b / 32) * 32;
    
    const colorKey = `${quantR},${quantG},${quantB}`;
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }
  
  // Sort colors by frequency
  const sortedColors = Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  const rgbToHex = (r: number, g: number, b: number) => 
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  
  const dominant = sortedColors[0] ? 
    rgbToHex(...sortedColors[0][0].split(',').map(Number)) : '#8B4513';
  const secondary = sortedColors[1] ? 
    rgbToHex(...sortedColors[1][0].split(',').map(Number)) : '#D2691E';
  const accent = sortedColors[2] ? 
    rgbToHex(...sortedColors[2][0].split(',').map(Number)) : '#F4A460';
  
  return {
    dominant,
    secondary,
    accent,
    brightness: pixelCount > 0 ? totalBrightness / pixelCount / 255 : 0.5
  };
}

function matchCardByColors(colorScheme: ColorScheme, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  // Define color associations for different card types
  const colorAssociations = {
    // Major Arcana color patterns
    'Major': {
      'The Fool': { colors: ['#87CEEB', '#FFD700', '#FFFFFF'], brightness: 0.7 },
      'The Magician': { colors: ['#8B0000', '#FFD700', '#FFFFFF'], brightness: 0.6 },
      'The High Priestess': { colors: ['#4B0082', '#C0C0C0', '#000080'], brightness: 0.4 },
      'The Empress': { colors: ['#228B22', '#FFD700', '#FF69B4'], brightness: 0.6 },
      'The Emperor': { colors: ['#8B0000', '#FFD700', '#FF4500'], brightness: 0.5 },
      'The Hierophant': { colors: ['#8B4513', '#FFD700', '#FFFFFF'], brightness: 0.5 },
      'The Lovers': { colors: ['#FF69B4', '#FFD700', '#87CEEB'], brightness: 0.7 },
      'The Chariot': { colors: ['#4682B4', '#FFD700', '#FFFFFF'], brightness: 0.6 },
      'Strength': { colors: ['#FFD700', '#8B0000', '#FFFFFF'], brightness: 0.6 },
      'The Hermit': { colors: ['#696969', '#FFD700', '#8B4513'], brightness: 0.4 },
      'Wheel of Fortune': { colors: ['#FFD700', '#8B0000', '#4B0082'], brightness: 0.6 },
      'Justice': { colors: ['#4682B4', '#FFD700', '#FFFFFF'], brightness: 0.6 },
      'The Hanged Man': { colors: ['#8B4513', '#228B22', '#87CEEB'], brightness: 0.5 },
      'Death': { colors: ['#000000', '#FFFFFF', '#8B0000'], brightness: 0.3 },
      'Temperance': { colors: ['#87CEEB', '#FFD700', '#FFFFFF'], brightness: 0.7 },
      'The Devil': { colors: ['#8B0000', '#000000', '#FFD700'], brightness: 0.3 },
      'The Tower': { colors: ['#696969', '#8B0000', '#FFD700'], brightness: 0.4 },
      'The Star': { colors: ['#87CEEB', '#FFD700', '#FFFFFF'], brightness: 0.8 },
      'The Moon': { colors: ['#191970', '#C0C0C0', '#87CEEB'], brightness: 0.4 },
      'The Sun': { colors: ['#FFD700', '#FF6347', '#FFFFFF'], brightness: 0.9 },
      'Judgement': { colors: ['#87CEEB', '#FFD700', '#FFFFFF'], brightness: 0.7 },
      'The World': { colors: ['#228B22', '#FFD700', '#4B0082'], brightness: 0.6 }
    },
    
    // Minor Arcana suit colors
    'Wands': { colors: ['#8B4513', '#FF6347', '#FFD700'], brightness: 0.6 },
    'Cups': { colors: ['#4682B4', '#87CEEB', '#C0C0C0'], brightness: 0.6 },
    'Swords': { colors: ['#C0C0C0', '#4682B4', '#696969'], brightness: 0.5 },
    'Pentacles': { colors: ['#FFD700', '#228B22', '#8B4513'], brightness: 0.6 }
  };
  
  let bestMatch: { card: TarotCard; confidence: number } | null = null;
  
  for (const card of allCards) {
    let confidence = 0;
    
    // Check Major Arcana specific patterns
    if (card.arcana === 'Major' && colorAssociations.Major[card.name as keyof typeof colorAssociations.Major]) {
      const cardColors = colorAssociations.Major[card.name as keyof typeof colorAssociations.Major];
      confidence = calculateColorSimilarity(colorScheme, cardColors.colors, cardColors.brightness);
    }
    // Check Minor Arcana suit patterns
    else if (card.arcana === 'Minor') {
      const suitName = extractSuitFromName(card.name);
      if (suitName && colorAssociations[suitName as keyof typeof colorAssociations]) {
        const suitColors = colorAssociations[suitName as keyof typeof colorAssociations];
        confidence = calculateColorSimilarity(colorScheme, suitColors.colors, suitColors.brightness);
        
        // Boost confidence for numbered cards if colors match well
        if (confidence > 0.6 && /\d/.test(card.name)) {
          confidence += 0.1;
        }
      }
    }
    
    if (confidence > 0.5 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { card, confidence: Math.min(confidence, 0.8) }; // Cap at 0.8 for color-only matching
    }
  }
  
  return bestMatch;
}

function calculateColorSimilarity(imageColors: ColorScheme, cardColors: string[], expectedBrightness: number): number {
  let colorScore = 0;
  const imageColorValues = [imageColors.dominant, imageColors.secondary, imageColors.accent];
  
  // Compare each image color with card colors
  for (const imageColor of imageColorValues) {
    for (const cardColor of cardColors) {
      const similarity = colorDistance(imageColor, cardColor);
      colorScore += similarity;
    }
  }
  
  // Normalize color score
  colorScore = colorScore / (imageColorValues.length * cardColors.length);
  
  // Brightness similarity
  const brightnessScore = 1 - Math.abs(imageColors.brightness - expectedBrightness);
  
  // Combine scores
  return (colorScore * 0.7 + brightnessScore * 0.3);
}

function colorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const rDiff = Math.abs(rgb1.r - rgb2.r);
  const gDiff = Math.abs(rgb1.g - rgb2.g);
  const bDiff = Math.abs(rgb1.b - rgb2.b);
  
  const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  const maxDistance = Math.sqrt(255 * 255 * 3);
  
  return 1 - (distance / maxDistance);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function extractSuitFromName(cardName: string): string | null {
  const lowerName = cardName.toLowerCase();
  if (lowerName.includes('wand')) return 'Wands';
  if (lowerName.includes('cup')) return 'Cups';
  if (lowerName.includes('sword')) return 'Swords';
  if (lowerName.includes('pentacle')) return 'Pentacles';
  return null;
}

async function tryOpenAIVision(imageData: string, allCards: TarotCard[]): Promise<VisualRecognitionResult | null> {
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('🤖 Trying OpenAI Vision for card identification...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this tarot card image and identify the card name. Focus on any text, numbers, or symbols visible. Reply with just the card name if you can identify it clearly, or describe what you see."
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      max_tokens: 200
    });
    
    const description = response.choices[0]?.message?.content || '';
    console.log('🤖 OpenAI Vision response:', description);
    
    if (description) {
      // Try to match the description with card names
      const matchedCard = findCardByDescription(description, allCards);
      if (matchedCard) {
        return {
          card: matchedCard.card,
          confidence: matchedCard.confidence,
          method: 'openai-vision',
          extractedText: description
        };
      }
    }
    
    return null;
  } catch (error) {
    console.log('OpenAI Vision error:', error);
    return null;
  }
}

function findCardByDescription(description: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const lowerDesc = description.toLowerCase();
  
  // Direct name matching
  for (const card of allCards) {
    const cardName = card.name.toLowerCase();
    if (lowerDesc.includes(cardName)) {
      return { card, confidence: 0.9 };
    }
  }
  
  // Pattern matching for numbers and suits
  const numberMatch = lowerDesc.match(/(\d+|ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)/);
  const suitMatch = lowerDesc.match(/(wands?|cups?|swords?|pentacles?|coins?)/);
  
  if (numberMatch && suitMatch) {
    const number = numberMatch[1];
    const suit = suitMatch[1];
    
    for (const card of allCards) {
      const cardName = card.name.toLowerCase();
      if (cardName.includes(number) && cardName.includes(suit)) {
        return { card, confidence: 0.8 };
      }
    }
  }
  
  // Major Arcana keyword matching
  const majorKeywords = [
    'fool', 'magician', 'priestess', 'empress', 'emperor', 'hierophant',
    'lovers', 'chariot', 'strength', 'hermit', 'wheel', 'justice',
    'hanged', 'death', 'temperance', 'devil', 'tower', 'star',
    'moon', 'sun', 'judgement', 'world'
  ];
  
  for (const keyword of majorKeywords) {
    if (lowerDesc.includes(keyword)) {
      const card = allCards.find(c => c.name.toLowerCase().includes(keyword));
      if (card) {
        return { card, confidence: 0.75 };
      }
    }
  }
  
  return null;
}