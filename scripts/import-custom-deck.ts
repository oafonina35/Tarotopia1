import fs from 'fs';
import { db } from '../server/db';
import { tarotCards } from '../shared/schema';

async function parseAndImportCards() {
  const content = fs.readFileSync('attached_assets/Pasted-0-The-Fool-Let-Passion-Lead-the-Way-The-Fool-embodies-an-intoxicating-recklessness-a-wild-and-un-1752951848674_1752951848675.txt', 'utf8');
  
  const cards = [];
  let cardNumber = 0; // Global card counter for images (0-77)
  
  // Split by major sections and process each card
  const lines = content.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Look for card titles with patterns like "1. The Fool" or "Ace of Wands"
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
      
      // Extract keywords
      const keywords = [];
      const searchText = (name + ' ' + description + ' ' + subtitle).toLowerCase();
      if (searchText.includes('passion')) keywords.push('passion');
      if (searchText.includes('desire')) keywords.push('desire');
      if (searchText.includes('love')) keywords.push('love');
      if (searchText.includes('surrender')) keywords.push('surrender');
      if (searchText.includes('control')) keywords.push('control');
      if (searchText.includes('seduction')) keywords.push('seduction');
    
    // Determine arcana type
    let arcana = 'Major';
    let suit = null;
    
    if (name.includes('Ace of') || name.includes('of Wands') || name.includes('of Cups') || 
        name.includes('of Swords') || name.includes('of Pentacles') ||
        name.includes('Page of') || name.includes('Knight of') || 
        name.includes('Queen of') || name.includes('King of')) {
      arcana = 'Minor';
      
      if (name.includes('Wands')) suit = 'Wands';
      else if (name.includes('Cups')) suit = 'Cups';
      else if (name.includes('Swords')) suit = 'Swords';
      else if (name.includes('Pentacles')) suit = 'Pentacles';
    }
    
    // Extract the main description (everything after the first line until "Sensual Suggestions:")
    let description = '';
    let sensualSuggestions = '';
    let inSuggestions = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'Sensual Suggestions:') {
        inSuggestions = true;
        continue;
      }
      
      if (line.startsWith('__________') || line.match(/^\d+\./)) {
        break; // Stop at next card or separator
      }
      
      if (inSuggestions) {
        if (line) {
          sensualSuggestions += (sensualSuggestions ? '\n' : '') + line;
        }
      } else {
        if (line) {
          description += (description ? '\n' : '') + line;
        }
      }
    }
    
    // Extract keywords from the description
    const keywords = [];
    if (name.toLowerCase().includes('passion')) keywords.push('passion');
    if (name.toLowerCase().includes('desire')) keywords.push('desire');
    if (name.toLowerCase().includes('love')) keywords.push('love');
    if (description.toLowerCase().includes('surrender')) keywords.push('surrender');
    if (description.toLowerCase().includes('control')) keywords.push('control');
    if (description.toLowerCase().includes('seduction')) keywords.push('seduction');
    
    // Check if image exists for this card number
    const imageIndex = number - 1; // Images are 0-indexed
    const imagePath = `attached_assets/${imageIndex}.png`;
    let imageUrl = null;
    
    if (fs.existsSync(imagePath)) {
      imageUrl = `@assets/${imageIndex}.png`;
    }

    const card = {
      name: name,
      arcana: arcana,
      number: arcana === 'Major' ? number : null,
      suit: suit,
      meaning: description.slice(0, 500) + (description.length > 500 ? '...' : ''), // Truncate for meaning
      symbolism: subtitle || 'Sensual exploration and passionate connection',
      guidance: sensualSuggestions || description.slice(-200), // Use suggestions as guidance
      keywords: keywords.slice(0, 5), // Limit to 5 keywords
      imageUrl: imageUrl
    };
    
    cards.push(card);
    console.log(`Parsed: ${card.name} (${card.arcana}) - Image: ${imageUrl ? 'Yes' : 'No'}`);
  }
  
  console.log(`\nParsed ${cards.length} cards. Importing to database...`);
  
  // Clear existing cards first to replace with complete custom deck
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