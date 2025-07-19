import type { TarotCard } from "@shared/schema";

// Enhanced card matching with multiple algorithms for maximum accuracy
export function findBestCardMatch(extractedText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const cleanText = extractedText.toLowerCase().trim();
  
  // Algorithm 1: Enhanced numbered format matching (like "9. THE HERMIT")
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
  
  // Algorithm 2: Roman numeral patterns (XXI. THE WORLD, etc.)
  const romanPattern = cleanText.match(/(xxi|xx|xix|xviii|xvii|xvi|xv|xiv|xiii|xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\.\s*(?:the\s+)?([a-z\s]+)/i);
  if (romanPattern) {
    const romanToNumber: Record<string, number> = {
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
  
  // Algorithm 3: Direct name matches (high confidence)
  for (const card of allCards) {
    const cardName = card.name.toLowerCase();
    if (cleanText.includes(cardName)) {
      return { card, confidence: 0.95 };
    }
  }
  
  // Algorithm 4: Enhanced number + suit matches for minor arcana
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
  
  // Algorithm 5: Enhanced partial word matches with fuzzy matching
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

// Calculate Levenshtein distance for fuzzy string matching
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