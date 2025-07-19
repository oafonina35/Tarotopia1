// This file contains utility functions for tarot card data
// In a real application, this would be replaced by API calls

export interface TarotCardData {
  name: string;
  arcana: 'Major' | 'Minor';
  number?: number;
  suit?: string;
  meaning: string;
  symbolism: string;
  guidance: string;
  keywords: string[];
}

export const MAJOR_ARCANA: TarotCardData[] = [
  {
    name: "The Fool",
    arcana: "Major",
    number: 0,
    meaning: "The Fool represents new beginnings, spontaneity, and a free spirit. This card encourages you to take a leap of faith and embrace the unknown with optimism and wonder.",
    symbolism: "The white rose symbolizes purity of intention, while the small bag represents untapped potential. The cliff edge signifies taking risks and trusting in the journey ahead.",
    guidance: "Trust your instincts and be open to new experiences. This is a time for adventure and embracing change with an open heart and mind.",
    keywords: ["new beginnings", "spontaneity", "innocence", "adventure"]
  },
  // Additional cards would be added here in a real implementation
];

export const getRandomMajorArcana = (): TarotCardData => {
  const randomIndex = Math.floor(Math.random() * MAJOR_ARCANA.length);
  return MAJOR_ARCANA[randomIndex];
};

export const findCardByName = (name: string): TarotCardData | undefined => {
  return MAJOR_ARCANA.find(card => 
    card.name.toLowerCase() === name.toLowerCase()
  );
};

export const getCardKeywords = (cardName: string): string[] => {
  const card = findCardByName(cardName);
  return card?.keywords || [];
};

// Simulated image recognition function
// In a real app, this would use computer vision APIs
export const simulateCardRecognition = async (imageData: string): Promise<{
  cardName: string;
  confidence: number;
}> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate recognition with random Major Arcana card
  const recognizedCard = getRandomMajorArcana();
  const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
  
  return {
    cardName: recognizedCard.name,
    confidence
  };
};
