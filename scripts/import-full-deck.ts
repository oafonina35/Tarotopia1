import fs from 'fs';
import { db } from '../server/db';
import { tarotCards } from '../shared/schema';

async function parseAndImportCards() {
  const content = fs.readFileSync('attached_assets/Pasted-0-The-Fool-Let-Passion-Lead-the-Way-The-Fool-embodies-an-intoxicating-recklessness-a-wild-and-un-1752951848674_1752951848675.txt', 'utf8');
  
  const cards = [];
  let cardNumber = 0; // Global card counter for images (0-77)
  
  // Split content into lines for processing
  const lines = content.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Look for card titles with patterns
    const majorCardMatch = line.match(/^(\d+)\.\s*(.+?)(?:\s*–\s*(.+))?$/);
    const minorCardMatch = line.match(/^(Ace|2|3|4|5|6|7|8|9|10|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)\s*–\s*(.+)$/);
    
    if (majorCardMatch || minorCardMatch) {
      let name, subtitle, arcana, suit, number;
      
      if (majorCardMatch) {
        // Major Arcana card
        number = parseInt(majorCardMatch[1]);
        name = majorCardMatch[2].trim();
        subtitle = majorCardMatch[3] || '';
        arcana = 'Major';
        suit = null;
      } else if (minorCardMatch) {
        // Minor Arcana card
        const rank = minorCardMatch[1];
        suit = minorCardMatch[2];
        subtitle = minorCardMatch[3];
        name = `${rank} of ${suit}`;
        arcana = 'Minor';
        
        // Convert rank to number for ordering
        if (rank === 'Ace') number = 1;
        else if (['Page', 'Knight', 'Queen', 'King'].includes(rank)) {
          number = ['Page', 'Knight', 'Queen', 'King'].indexOf(rank) + 11;
        } else {
          number = parseInt(rank);
        }
      }
      
      // Collect description text
      let description = '';
      let sensualSuggestions = '';
      let inSuggestions = false;
      i++; // Move to next line after title
      
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        
        // Stop if we hit the next card
        if (currentLine.match(/^(\d+)\.\s*(.+?)(?:\s*–\s*(.+))?$/) || 
            currentLine.match(/^(Ace|2|3|4|5|6|7|8|9|10|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)\s*–\s*(.+)$/)) {
          break;
        }
        
        if (currentLine === 'Sensual Suggestions:') {
          inSuggestions = true;
          i++;
          continue;
        }
        
        if (currentLine.startsWith('__________')) {
          i++;
          continue;
        }
        
        if (currentLine) {
          if (inSuggestions) {
            sensualSuggestions += (sensualSuggestions ? '\n' : '') + currentLine;
          } else {
            description += (description ? '\n' : '') + currentLine;
          }
        }
        
        i++;
      }
      
      // Extract keywords from content
      const keywords = [];
      const searchText = (name + ' ' + description + ' ' + subtitle).toLowerCase();
      if (searchText.includes('passion')) keywords.push('passion');
      if (searchText.includes('desire')) keywords.push('desire');
      if (searchText.includes('love')) keywords.push('love');
      if (searchText.includes('surrender')) keywords.push('surrender');
      if (searchText.includes('control')) keywords.push('control');
      if (searchText.includes('seduction')) keywords.push('seduction');
      if (searchText.includes('pleasure')) keywords.push('pleasure');
      if (searchText.includes('intimacy')) keywords.push('intimacy');
      
      // Check if image exists for this card number (using global cardNumber)
      // Images are named like "0_1752951880791.png", "1_1752951880791.png", etc.
      const files = fs.readdirSync('attached_assets/');
      const imageFile = files.find(file => file.startsWith(`${cardNumber}_`) && file.endsWith('.png'));
      let imageUrl = null;
      
      if (imageFile) {
        imageUrl = `@assets/${imageFile}`;
      }

      const card = {
        name: name,
        arcana: arcana,
        number: arcana === 'Major' ? number : null,
        suit: suit,
        meaning: description,
        symbolism: subtitle || 'Sensual exploration and passionate connection',
        guidance: sensualSuggestions || description.slice(-200),
        keywords: keywords.slice(0, 5),
        imageUrl: imageUrl
      };
      
      cards.push(card);
      console.log(`Card ${cardNumber}: ${card.name} (${card.arcana}) - Image: ${imageUrl ? 'Yes' : 'No'}`);
      cardNumber++;
    } else {
      i++;
    }
  }
  
  console.log(`\nParsed ${cards.length} cards. Importing to database...`);
  
  // Clear existing cards first
  await db.delete(tarotCards);
  console.log('Cleared existing cards.');
  
  // Insert new cards
  for (const card of cards) {
    try {
      await db.insert(tarotCards).values(card);
      console.log(`✓ Imported: ${card.name}`);
    } catch (error) {
      console.error(`✗ Failed to import ${card.name}:`, error.message);
    }
  }
  
  console.log(`\nImport complete! ${cards.length} cards processed.`);
}

parseAndImportCards().catch(console.error);