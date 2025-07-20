import type { TarotCard } from "@shared/schema";

/**
 * Improved Text Recognition with Better Card Name Matching
 */
export function improvedCardMatching(extractedText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  if (!extractedText || extractedText.trim().length < 2) {
    return null;
  }

  const cleanText = extractedText.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  console.log('🔍 Improved matching on cleaned text:', cleanText);
  
  // Strategy 1: Direct card name matches with variations
  const directMatch = findDirectMatches(cleanText, allCards);
  if (directMatch) {
    console.log(`✅ Direct match found: ${directMatch.card.name} (${directMatch.confidence})`);
    return directMatch;
  }

  // Strategy 2: Number + Suit pattern recognition
  const numberSuitMatch = findNumberSuitMatches(cleanText, allCards);
  if (numberSuitMatch) {
    console.log(`✅ Number+Suit match: ${numberSuitMatch.card.name} (${numberSuitMatch.confidence})`);
    return numberSuitMatch;
  }

  // Strategy 3: Major Arcana by number or Roman numerals
  const majorArcanaMatch = findMajorArcanaMatches(cleanText, allCards);
  if (majorArcanaMatch) {
    console.log(`✅ Major Arcana match: ${majorArcanaMatch.card.name} (${majorArcanaMatch.confidence})`);
    return majorArcanaMatch;
  }

  // Strategy 4: Partial word matching with enhanced scoring
  const partialMatch = findPartialMatches(cleanText, allCards);
  if (partialMatch && partialMatch.confidence > 0.5) {
    console.log(`✅ Partial match: ${partialMatch.card.name} (${partialMatch.confidence})`);
    return partialMatch;
  }

  console.log('❌ No improved matching found');
  return null;
}

function findDirectMatches(cleanText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const words = cleanText.split(/\s+/).filter(w => w.length > 1);
  
  for (const card of allCards) {
    const cardName = card.name.toLowerCase();
    
    // Exact match
    if (cleanText.includes(cardName)) {
      return { card, confidence: 0.95 };
    }
    
    // Check if all significant words from card name are present
    const cardWords = cardName.replace(/the\s+/g, '').split(/\s+/).filter(w => w.length > 2);
    if (cardWords.length > 0) {
      const matchedWords = cardWords.filter(cardWord => 
        words.some(textWord => 
          textWord.includes(cardWord) || 
          cardWord.includes(textWord) ||
          levenshteinDistance(textWord, cardWord) <= 1
        )
      );
      
      if (matchedWords.length === cardWords.length) {
        return { card, confidence: 0.9 };
      } else if (matchedWords.length >= Math.ceil(cardWords.length * 0.7)) {
        return { card, confidence: 0.8 };
      }
    }
  }
  
  return null;
}

function findNumberSuitMatches(cleanText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  // Enhanced pattern for Minor Arcana
  const patterns = [
    // Standard formats: "2 of cups", "ace of wands", etc.
    /(\d+|ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)\s+(?:of\s+)?(wands?|cups?|swords?|pentacles?|coins?|disks?)/i,
    // Reversed format: "cups 2", "wands ace"
    /(wands?|cups?|swords?|pentacles?|coins?|disks?)\s+(\d+|ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)/i,
    // Number and suit without "of": "2 cups", "ace wands"
    /(\d+|ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)\s+(wands?|cups?|swords?|pentacles?|coins?|disks?)/i
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let number = match[1]?.toLowerCase();
      let suit = match[2]?.toLowerCase();
      
      // Handle reversed format
      if (pattern.source.includes('wands?|cups?|swords?|pentacles?|coins?|disks?)\\s+(')) {
        [suit, number] = [match[1]?.toLowerCase(), match[2]?.toLowerCase()];
      }
      
      // Normalize number
      const numberMap: Record<string, string> = {
        'ace': 'ace', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
      };
      const normalizedNumber = numberMap[number] || number;
      
      // Normalize suit
      const suitMap: Record<string, string> = {
        'wands': 'wands', 'wand': 'wands',
        'cups': 'cups', 'cup': 'cups',
        'swords': 'swords', 'sword': 'swords',
        'pentacles': 'pentacles', 'pentacle': 'pentacles',
        'coins': 'pentacles', 'coin': 'pentacles',
        'disks': 'pentacles', 'disk': 'pentacles'
      };
      const normalizedSuit = suitMap[suit];
      
      if (normalizedNumber && normalizedSuit) {
        for (const card of allCards) {
          const cardName = card.name.toLowerCase();
          if (cardName.includes(normalizedNumber) && cardName.includes(normalizedSuit)) {
            return { card, confidence: 0.9 };
          }
        }
      }
    }
  }
  
  return null;
}

function findMajorArcanaMatches(cleanText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  // Roman numeral patterns
  const romanNumerals: Record<string, number> = {
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10,
    'xi': 11, 'xii': 12, 'xiii': 13, 'xiv': 14, 'xv': 15, 'xvi': 16, 'xvii': 17, 'xviii': 18, 'xix': 19, 'xx': 20, 'xxi': 21
  };
  
  // Check for Roman numerals
  for (const [roman, number] of Object.entries(romanNumerals)) {
    if (cleanText.includes(roman)) {
      const majorCard = allCards.find(card => 
        card.arcana === 'Major' && card.number === number
      );
      if (majorCard) {
        return { card: majorCard, confidence: 0.85 };
      }
    }
  }
  
  // Check for Arabic numerals (0-21)
  const numberMatch = cleanText.match(/\b(\d+)\b/);
  if (numberMatch) {
    const number = parseInt(numberMatch[1]);
    if (number >= 0 && number <= 21) {
      const majorCard = allCards.find(card => 
        card.arcana === 'Major' && card.number === number
      );
      if (majorCard) {
        return { card: majorCard, confidence: 0.8 };
      }
    }
  }
  
  // Major Arcana name patterns with common OCR errors
  const majorArcanaPatterns: Record<string, string[]> = {
    'fool': ['fool', 'fooi', 'foul', '0'],
    'magician': ['magician', 'mage', 'magus', 'magidan'],
    'high priestess': ['priestess', 'high priestess', 'pnestess'],
    'empress': ['empress', 'emperess'],
    'emperor': ['emperor', 'emperur'],
    'hierophant': ['hierophant', 'pope', 'hierophnt'],
    'lovers': ['lovers', 'lover', 'ioves'],
    'chariot': ['chariot', 'chanot', 'char1ot'],
    'strength': ['strength', 'strenglh', 'str'],
    'hermit': ['hermit', 'herm1t', 'hermil'],
    'wheel': ['wheel', 'fortune', 'wheeI'],
    'justice': ['justice', 'jusiice'],
    'hanged': ['hanged', 'hanged man', 'hang'],
    'death': ['death', 'dealh'],
    'temperance': ['temperance', 'temperence'],
    'devil': ['devil', 'devi1'],
    'tower': ['tower', 'towel'],
    'star': ['star', 'stal'],
    'moon': ['moon', 'moo'],
    'sun': ['sun', 'sul'],
    'judgement': ['judgement', 'judgment', 'judgmenl'],
    'world': ['world', 'worid', 'wor1d']
  };
  
  for (const [cardKey, patterns] of Object.entries(majorArcanaPatterns)) {
    for (const pattern of patterns) {
      if (cleanText.includes(pattern)) {
        const majorCard = allCards.find(card => 
          card.arcana === 'Major' && card.name.toLowerCase().includes(cardKey)
        );
        if (majorCard) {
          return { card: majorCard, confidence: 0.75 };
        }
      }
    }
  }
  
  return null;
}

function findPartialMatches(cleanText: string, allCards: TarotCard[]): { card: TarotCard; confidence: number } | null {
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  let bestMatch: { card: TarotCard; confidence: number } | null = null;
  
  for (const card of allCards) {
    const cardWords = card.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let matchScore = 0;
    let totalPossibleScore = cardWords.length;
    
    for (const cardWord of cardWords) {
      let bestWordScore = 0;
      
      for (const textWord of words) {
        let wordScore = 0;
        
        // Exact match
        if (cardWord === textWord) {
          wordScore = 1.0;
        }
        // One contains the other
        else if (cardWord.includes(textWord) || textWord.includes(cardWord)) {
          wordScore = 0.8;
        }
        // Similar length and low edit distance
        else if (Math.abs(cardWord.length - textWord.length) <= 2) {
          const distance = levenshteinDistance(cardWord, textWord);
          const maxLen = Math.max(cardWord.length, textWord.length);
          const similarity = 1 - (distance / maxLen);
          if (similarity > 0.6) {
            wordScore = similarity * 0.7;
          }
        }
        
        bestWordScore = Math.max(bestWordScore, wordScore);
      }
      
      matchScore += bestWordScore;
    }
    
    if (totalPossibleScore > 0) {
      const confidence = (matchScore / totalPossibleScore) * 0.8; // Cap at 0.8 for partial matches
      
      if (confidence > 0.4 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { card, confidence };
      }
    }
  }
  
  return bestMatch;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}