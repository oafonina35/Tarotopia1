import type { TarotCard } from "@shared/schema";
import { db } from "./db";
import { trainingData as trainingDataTable } from "@shared/schema";
import { eq } from "drizzle-orm";

// In-memory cache for performance (loaded from database)
const imageTrainingData = new Map<string, number>();

// Load training data from database
let trainingDataLoaded = false;

async function loadTrainingData() {
  if (!trainingDataLoaded) {
    try {
      const dbTrainingData = await db.select().from(trainingDataTable);
      imageTrainingData.clear();
      
      for (const record of dbTrainingData) {
        imageTrainingData.set(record.imageHash, record.cardId);
      }
      
      trainingDataLoaded = true;
      console.log(`✅ Training data loaded from database: ${imageTrainingData.size} trained images`);
    } catch (error) {
      console.error('Error loading training data from database:', error);
      trainingDataLoaded = true; // Mark as loaded even if failed
      console.log('⚠️ Training data system initialized without database persistence');
    }
  }
}

export interface RecognitionResult {
  card: TarotCard;
  confidence: number;
  isLearned: boolean;
}

export async function trainCard(imageData: string, correctCard: TarotCard): Promise<void> {
  await loadTrainingData();
  const imageHash = createImageHash(imageData);
  
  // Update in-memory cache
  imageTrainingData.set(imageHash, correctCard.id);
  
  // Save to database for persistence
  try {
    await db.insert(trainingDataTable)
      .values({ imageHash, cardId: correctCard.id })
      .onConflictDoUpdate({
        target: trainingDataTable.imageHash,
        set: { cardId: correctCard.id }
      });
    
    console.log(`✅ TRAINED & SAVED: Image hash ${imageHash} → ${correctCard.name} (ID: ${correctCard.id})`);
  } catch (error) {
    console.error('Error saving training data to database:', error);
    console.log(`⚠️ TRAINED (memory only): Image hash ${imageHash} → ${correctCard.name} (ID: ${correctCard.id})`);
  }
  
  console.log(`✓ Total trained images: ${imageTrainingData.size}`);
}

export async function recognizeWithTraining(imageData: string, allCards: TarotCard[]): Promise<RecognitionResult> {
  await loadTrainingData();
  const imageHash = createImageHash(imageData);
  const legacyHash = createLegacyImageHash(imageData);
  
  console.log(`🔍 Looking for image hash: ${imageHash} (legacy: ${legacyHash})`);
  console.log(`🔍 Training data size: ${imageTrainingData.size}`);
  
  // First check exact match with new hash format
  let learnedCardId = imageTrainingData.get(imageHash);
  
  // Check legacy hash format for backwards compatibility
  if (!learnedCardId) {
    learnedCardId = imageTrainingData.get(legacyHash);
  }
  
  if (learnedCardId) {
    const learnedCard = allCards.find(c => c.id === learnedCardId);
    if (learnedCard) {
      console.log(`✅ EXACT MATCH: ${learnedCard.name} (confidence: 95%)`);
      return {
        card: learnedCard,
        confidence: 0.95,
        isLearned: true
      };
    }
  }
  
  console.log(`❌ No exact match found, trying fuzzy matching`);
  
  // If not learned, use similarity to find closest trained image
  const similarCard = findSimilarTrainedImage(imageHash, allCards);
  if (similarCard) {
    console.log(`✅ FUZZY MATCH: Found similar trained image for ${similarCard.name}`);
    return {
      card: similarCard,
      confidence: 0.85, // High confidence for fuzzy matches
      isLearned: true    // Treat fuzzy matches as learned
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
  // Remove data URL prefix and normalize
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Create multiple hash points for better matching
  const dataLength = base64Data.length;
  const segments = 5; // Create 5 hash segments
  let combinedHash = '';
  
  for (let segment = 0; segment < segments; segment++) {
    const startPos = Math.floor((dataLength / segments) * segment);
    const endPos = Math.floor((dataLength / segments) * (segment + 1));
    const segmentData = base64Data.substring(startPos, endPos);
    
    let segmentHash = 0;
    for (let i = 0; i < Math.min(segmentData.length, 20); i++) { // Sample first 20 chars of each segment
      const char = segmentData.charCodeAt(i);
      segmentHash = ((segmentHash << 3) - segmentHash) + char;
      segmentHash = segmentHash & segmentHash;
    }
    
    combinedHash += Math.abs(segmentHash).toString(16).substring(0, 4);
  }
  
  // Use broader size categories (more forgiving for compression differences)
  const sizeCategory = Math.floor(dataLength / 5000); // Group by 5KB chunks
  return `${combinedHash}-${sizeCategory}`;
}

// Legacy hash function for backwards compatibility
function createLegacyImageHash(imageData: string): string {
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Create hash from key characteristics (old method)
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
  const [targetHashValue, targetSizeCategory] = targetHash.split('-');
  const targetSize = parseInt(targetSizeCategory);
  let bestMatch: { cardId: number; similarity: number } | null = null;
  
  console.log(`🔍 Looking for similar images to hash: ${targetHash}`);
  console.log(`🔍 All training data:`, Array.from(imageTrainingData.entries()).slice(0, 5));
  
  for (const [trainedHash, cardId] of imageTrainingData.entries()) {
    // Handle different hash formats
    const trainedParts = trainedHash.split('-');
    const targetParts = targetHash.split('-');
    
    if (trainedParts.length !== targetParts.length) {
      // Different hash formats, try basic similarity
      console.log(`  🔄 Different hash formats: ${trainedHash} vs ${targetHash}`);
      
      // If one is legacy format (2 parts) and one is new (2 parts), compare differently
      if (trainedParts.length === 2 && targetParts.length === 2) {
        const trainedMainHash = trainedParts[0];
        const targetMainHash = targetParts[0];
        
        // Compare hash values
        const targetHashNum = parseInt(targetMainHash, 16);
        const trainedHashNum = parseInt(trainedMainHash, 16);
        
        if (!isNaN(targetHashNum) && !isNaN(trainedHashNum)) {
          const hashDiff = Math.abs(targetHashNum - trainedHashNum);
          const maxHash = Math.max(targetHashNum, trainedHashNum);
          const similarity = maxHash > 0 ? Math.max(0, 1 - (hashDiff / maxHash)) : 0;
          
          console.log(`  📊 Cross-format similarity with ${trainedHash}: ${similarity.toFixed(3)}`);
          
          if (similarity > 0.3 && (!bestMatch || similarity > bestMatch.similarity)) {
            bestMatch = { cardId, similarity };
            console.log(`  ✨ Cross-format match: Card ${cardId} with similarity ${similarity.toFixed(3)}`);
          }
        }
      }
      continue;
    }
    
    // Same format comparison
    const [trainedHashValue, trainedSizeCategory] = trainedParts;
    const trainedSize = parseInt(trainedSizeCategory);
    
    // Size similarity (allow 1-2 size categories difference)
    const sizeDiff = Math.abs(targetSize - trainedSize);
    const sizeMatch = sizeDiff <= 2; // Allow up to 2 size categories difference
    
    // Multi-segment hash similarity for better matching
    const targetSegments = targetHashValue.match(/.{1,4}/g) || [];
    const trainedSegments = trainedHashValue.match(/.{1,4}/g) || [];
    
    let segmentMatches = 0;
    let totalSegments = Math.max(targetSegments.length, trainedSegments.length);
    
    for (let i = 0; i < Math.min(targetSegments.length, trainedSegments.length); i++) {
      const targetSegNum = parseInt(targetSegments[i], 16);
      const trainedSegNum = parseInt(trainedSegments[i], 16);
      
      if (!isNaN(targetSegNum) && !isNaN(trainedSegNum)) {
        const segmentDiff = Math.abs(targetSegNum - trainedSegNum);
        const maxSegment = Math.max(targetSegNum, trainedSegNum);
        const segmentSimilarity = maxSegment > 0 ? (1 - (segmentDiff / maxSegment)) : 1;
        
        if (segmentSimilarity > 0.7) { // Segment matches if 70% similar
          segmentMatches++;
        }
      }
    }
    
    const hashSimilarity = totalSegments > 0 ? (segmentMatches / totalSegments) : 0;
    
    // Combined similarity score - more lenient
    let similarity = 0;
    if (sizeMatch || sizeDiff <= 3) { // Allow up to 3 size categories difference
      similarity = hashSimilarity * 0.8 + (1 - Math.min(sizeDiff, 5) / 5) * 0.2;
    }
    
    console.log(`  📊 Multi-segment comparing with ${trainedHash}: size match=${sizeMatch} (diff=${sizeDiff}), hash sim=${hashSimilarity.toFixed(3)}, total sim=${similarity.toFixed(3)}`);
    
    if (similarity > 0.5 && (!bestMatch || similarity > bestMatch.similarity)) { // Lower threshold
      bestMatch = { cardId, similarity };
      console.log(`  ✨ New best match: Card ${cardId} with similarity ${similarity.toFixed(3)}`);
    }
  }
  
  if (bestMatch && bestMatch.similarity > 0.6) {
    const card = allCards.find(c => c.id === bestMatch.cardId);
    console.log(`✅ FUZZY MATCH FOUND: ${card?.name} (similarity: ${bestMatch.similarity.toFixed(3)})`);
    return card || null;
  }
  
  console.log(`❌ No fuzzy match found (best similarity: ${bestMatch?.similarity.toFixed(3) || 'none'})`);
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

export async function getTrainingStats(): Promise<{ totalTrainedImages: number; trainedCards: string[] }> {
  try {
    await loadTrainingData();
    const trainedCardIds = Array.from(new Set(imageTrainingData.values()));
    console.log(`📊 Training stats requested: ${imageTrainingData.size} images, cards: [${trainedCardIds.join(', ')}]`);
    return {
      totalTrainedImages: imageTrainingData.size,
      trainedCards: trainedCardIds.map(id => `Card ID: ${id}`).slice(0, 10) // Show first 10
    };
  } catch (error) {
    console.error('Error getting training stats:', error);
    return {
      totalTrainedImages: 0,
      trainedCards: []
    };
  }
}

export function getAllTrainingData(): Map<string, number> {
  loadTrainingData();
  return imageTrainingData;
}