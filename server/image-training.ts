import type { TarotCard } from "@shared/schema";

// Simple in-memory storage for image-card associations
// In a real app, this would be stored in a database
const imageCardAssociations = new Map<string, number>();

export function trainImageForCard(imageData: string, cardId: number): void {
  const imageSignature = generateImageSignature(imageData);
  imageCardAssociations.set(imageSignature, cardId);
  console.log(`Trained image signature ${imageSignature} for card ID ${cardId}`);
}

export function findTrainedCard(imageData: string, allCards: TarotCard[]): TarotCard | null {
  const imageSignature = generateImageSignature(imageData);
  const cardId = imageCardAssociations.get(imageSignature);
  
  if (cardId) {
    const card = allCards.find(c => c.id === cardId);
    if (card) {
      console.log(`Found trained card: ${card.name}`);
      return card;
    }
  }
  
  return null;
}

function generateImageSignature(imageData: string): string {
  // Create a more sophisticated signature based on image characteristics
  const length = imageData.length;
  
  // Sample key points in the image data
  const samplePoints = [
    Math.floor(length * 0.1),
    Math.floor(length * 0.25),
    Math.floor(length * 0.5),
    Math.floor(length * 0.75),
    Math.floor(length * 0.9)
  ];
  
  let signature = '';
  for (const point of samplePoints) {
    if (point < imageData.length) {
      signature += imageData.charCodeAt(point).toString(16);
    }
  }
  
  // Include length as part of signature
  signature += `-${length}`;
  
  return signature;
}

export function getTrainingStats(): { totalTrained: number } {
  return { totalTrained: imageCardAssociations.size };
}