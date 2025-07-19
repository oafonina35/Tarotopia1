import fs from 'fs';
import { db } from '../server/db.ts';
import { tarotCards } from '../shared/schema.ts';
import path from 'path';

async function parseAndImportCards() {
  const content = fs.readFileSync('attached_assets/Pasted-0-The-Fool-Let-Passion-Lead-the-Way-The-Fool-embodies-an-intoxicating-recklessness-a-wild-and-un-1752951848674_1752951848675.txt', 'utf8');
  
  const cards = [];
  
  // Split by card numbers and parse each section
  const sections = content.split(/(?=\d+\.)/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;
    
    // Extract card name and subtitle from first line
    const firstLine = lines[0];
    const match = firstLine.match(/^(\d+)\.\s*(.+?)(?:\s*–\s*(.+))?$/);
    
    if (!match) continue;
    
    const number = parseInt(match[1]);
    const name = match[2].trim();
    const subtitle = match[3] || '';
    
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
    console.log(`Parsed: ${card.name} (${card.arcana})`);
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