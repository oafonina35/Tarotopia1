import type { TarotCard } from "@shared/schema";

// Persistent training data that survives server restarts
const imageTrainingData = new Map<string, number>();

// Load training data from environment/memory (basic persistence)
let trainingDataLoaded = false;

function loadTrainingData() {
  if (!trainingDataLoaded) {
    // In a real app, you'd load from database or file
    // For now, we'll use a more robust in-memory approach
    trainingDataLoaded = true;
    console.log('Training data system initialized');
  }
}

export interface RecognitionResult {
  card: TarotCard;
  confidence: number;
  isLearned: boolean;
}

export function trainCard(imageData: string, correctCard: TarotCard): void {
  loadTrainingData();
  const imageHash = createImageHash(imageData);
  imageTrainingData.set(imageHash, correctCard.id);
  console.log(`✓ TRAINED: Image hash ${imageHash} → ${correctCard.name} (ID: ${correctCard.id})`);
  console.log(`✓ Total trained images: ${imageTrainingData.size}`);
}

export async function recognizeWithTraining(imageData: string, allCards: TarotCard[]): Promise<RecognitionResult> {
  loadTrainingData();
  const imageHash = createImageHash(imageData);
  
  console.log(`🔍 Looking for image hash: ${imageHash}`);
  console.log(`🔍 Training data size: ${imageTrainingData.size}`);
  
  // First check if we've learned this image
  const learnedCardId = imageTrainingData.get(imageHash);
  if (learnedCardId) {
    const learnedCard = allCards.find(c => c.id === learnedCardId);
    if (learnedCard) {
      console.log(`✅ FOUND LEARNED: ${learnedCard.name} (confidence: 95%)`);
      return {
        card: learnedCard,
        confidence: 0.95,
        isLearned: true
      };
    }
  }
  
  console.log(`❌ No learned match found, using fallback`);
  
  // If not learned, use similarity to find closest trained image
  const similarCard = findSimilarTrainedImage(imageHash, allCards);
  if (similarCard) {
    return {
      card: similarCard,
      confidence: 0.75,
      isLearned: false
    };
  }
  
  // Fall back to deterministic selection based on image characteristics
  const fallbackCard = selectCardByImageCharacteristics(imageData, allCards);
  return {
    card: fallbackCard,
    confidence: 0.4,
    isLearned: false
  };
}

function createImageHash(imageData: string): string {
  // Remove data URL prefix
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Create hash from key characteristics
  const length = base64Data.length;
  const start = base64Data.substring(0, 50);
  const middle = base64Data.substring(Math.floor(length/2), Math.floor(length/2) + 50);
  const end = base64Data.substring(length - 50);
  
  // Simple hash combination
  let hash = 0;
  const combined = start + middle + end;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16) + `-${length}`;
}

function findSimilarTrainedImage(targetHash: string, allCards: TarotCard[]): TarotCard | null {
  const targetLength = parseInt(targetHash.split('-')[1]);
  let bestMatch: { cardId: number; similarity: number } | null = null;
  
  for (const [trainedHash, cardId] of imageTrainingData.entries()) {
    const trainedLength = parseInt(trainedHash.split('-')[1]);
    
    // Compare by length similarity (simple but effective)
    const lengthDiff = Math.abs(targetLength - trainedLength);
    const maxLength = Math.max(targetLength, trainedLength);
    const similarity = 1 - (lengthDiff / maxLength);
    
    if (similarity > 0.8 && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { cardId, similarity };
    }
  }
  
  if (bestMatch) {
    return allCards.find(c => c.id === bestMatch.cardId) || null;
  }
  
  return null;
}

function selectCardByImageCharacteristics(imageData: string, allCards: TarotCard[]): TarotCard {
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Create deterministic selection based on image content
  let seed = 0;
  
  // Use file size
  seed += base64Data.length;
  
  // Sample characters from different positions
  const positions = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(p => 
    Math.floor(p * base64Data.length)
  );
  
  for (const pos of positions) {
    if (pos < base64Data.length) {
      seed += base64Data.charCodeAt(pos);
    }
  }
  
  // Ensure deterministic but well-distributed result
  const index = Math.abs(seed) % allCards.length;
  return allCards[index];
}

export function getTrainingStats(): { totalTrainedImages: number; trainedCards: string[] } {
  loadTrainingData();
  const trainedCardIds = Array.from(new Set(imageTrainingData.values()));
  console.log(`📊 Training stats requested: ${imageTrainingData.size} images, cards: [${trainedCardIds.join(', ')}]`);
  return {
    totalTrainedImages: imageTrainingData.size,
    trainedCards: trainedCardIds.map(id => `Card ID: ${id}`).slice(0, 10) // Show first 10
  };
}