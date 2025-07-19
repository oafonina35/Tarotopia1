import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const majorArcanaCards = [
  {
    name: "The Fool",
    arcana: "Major",
    number: 0,
    meaning: "The Fool represents new beginnings, spontaneity, and a free spirit. This card encourages you to take a leap of faith and embrace the unknown with optimism and wonder.",
    symbolism: "The white rose symbolizes purity of intention, while the small bag represents untapped potential. The cliff edge signifies taking risks and trusting in the journey ahead.",
    guidance: "Trust your instincts and be open to new experiences. This is a time for adventure and embracing change with an open heart and mind.",
    keywords: ["new beginnings", "spontaneity", "innocence", "adventure"]
  },
  {
    name: "The Magician",
    arcana: "Major",
    number: 1,
    meaning: "The Magician represents manifestation, resourcefulness, and having the power to influence your reality. You have all the tools you need to succeed.",
    symbolism: "The infinity symbol represents unlimited potential, while the tools on the table (wand, cup, sword, pentacle) represent the four elements and suits of tarot.",
    guidance: "Focus your intentions and use your skills wisely. You have the power to create the reality you desire through concentrated effort and will.",
    keywords: ["manifestation", "power", "skill", "concentration"]
  },
  {
    name: "The High Priestess",
    arcana: "Major",
    number: 2,
    meaning: "The High Priestess represents intuition, sacred knowledge, and the subconscious mind. She encourages you to trust your inner wisdom and look beyond the obvious.",
    symbolism: "The veil behind her represents the thin boundary between conscious and subconscious realms. The moon at her feet symbolizes intuition and the feminine divine.",
    guidance: "Listen to your inner voice and pay attention to your dreams and intuition. The answers you seek lie within your subconscious mind.",
    keywords: ["intuition", "mystery", "subconscious", "inner wisdom"]
  },
  {
    name: "The Empress",
    arcana: "Major", 
    number: 3,
    meaning: "The Empress represents femininity, beauty, nature, nurturing, and abundance. She signifies creativity, fertility, and the power of the feminine divine.",
    symbolism: "The wheat field represents abundance and fertility, while her crown of stars connects her to the divine. The cushions suggest comfort and luxury.",
    guidance: "Connect with your feminine side and embrace creativity. This is a time of growth, abundance, and nurturing both yourself and others.",
    keywords: ["femininity", "abundance", "creativity", "nurturing"]
  },
  {
    name: "The Emperor",
    arcana: "Major",
    number: 4,
    meaning: "The Emperor represents authority, structure, control, and fatherly figures. He signifies leadership, stability, and the power of the masculine divine.",
    symbolism: "The throne made of stone represents stability and permanence, while the ram heads symbolize Mars and masculine energy. The orb and scepter represent worldly power.",
    guidance: "Take charge of your situation with confidence and create structure in your life. Use logic and reason to build a solid foundation for success.",
    keywords: ["authority", "structure", "leadership", "stability"]
  },
  {
    name: "The Hierophant",
    arcana: "Major",
    number: 5,
    meaning: "The Hierophant represents tradition, conformity, morality, and ethics. He is a bridge between heaven and earth, representing spiritual wisdom and religious beliefs.",
    symbolism: "The triple crown represents the three worlds he connects, while the crossed keys symbolize access to mysteries. The two pillars represent knowledge and law.",
    guidance: "Seek guidance from established institutions or mentors. Sometimes following tradition and conventional wisdom is the right path forward.",
    keywords: ["tradition", "spirituality", "conformity", "education"]
  },
  {
    name: "The Lovers",
    arcana: "Major",
    number: 6,
    meaning: "The Lovers represents love, harmony, relationships, and values alignment. This card often indicates important choices about relationships and personal values.",
    symbolism: "The angel above represents divine blessing and guidance, while the man and woman represent the conscious and subconscious minds coming together in harmony.",
    guidance: "Make choices based on your values and what brings harmony to your relationships. This may involve important decisions about love and partnerships.",
    keywords: ["love", "relationships", "choices", "harmony"]
  },
  {
    name: "The Chariot",
    arcana: "Major",
    number: 7,
    meaning: "The Chariot represents control, will power, success, and determination. It signifies overcoming obstacles through focus and determination.",
    symbolism: "The two sphinxes represent opposing forces that must be controlled, while the canopy of stars represents divine guidance and protection.",
    guidance: "Stay focused on your goals and maintain control over opposing forces in your life. Victory comes through discipline and determined action.",
    keywords: ["control", "willpower", "success", "determination"]
  },
  {
    name: "Strength",
    arcana: "Major",
    number: 8,
    meaning: "Strength represents inner strength, bravery, compassion, and focus. It's about conquering fear and anger through love and gentleness rather than force.",
    symbolism: "The woman gently closing the lion's mouth represents conquering the beast within through love and patience rather than force.",
    guidance: "Use gentle strength and compassion to overcome challenges. Your inner fortitude and kind heart will triumph over any obstacles.",
    keywords: ["inner strength", "compassion", "patience", "courage"]
  },
  {
    name: "The Hermit",
    arcana: "Major",
    number: 9,
    meaning: "The Hermit represents soul searching, seeking inner guidance, and introspection. This card suggests a need for inner reflection and spiritual seeking.",
    symbolism: "The lantern represents the light of wisdom that guides the way, while the staff represents the support of experience and knowledge.",
    guidance: "Take time for solitary reflection and seek answers within yourself. Sometimes you must withdraw from the world to find your inner truth.",
    keywords: ["introspection", "soul searching", "inner guidance", "wisdom"]
  },
  {
    name: "Wheel of Fortune",
    arcana: "Major",
    number: 10,
    meaning: "The Wheel of Fortune represents change, cycles, luck, and fate. It reminds us that life is full of changes and unexpected turns.",
    symbolism: "The wheel represents the cyclical nature of life, while the creatures at the corners represent the four fixed signs and elements.",
    guidance: "Embrace change as a natural part of life's cycles. What goes down will come back up - trust in the natural flow of life.",
    keywords: ["change", "luck", "cycles", "fate"]
  },
  {
    name: "Justice",
    arcana: "Major",
    number: 11,
    meaning: "Justice represents fairness, truth, cause and effect, and law. This card suggests that fair and just decisions will be made.",
    symbolism: "The scales represent balance and fairness, while the sword represents the power of reason and justice. The crown represents authority.",
    guidance: "Make decisions based on fairness and truth. Consider all sides of a situation and act with integrity and moral clarity.",
    keywords: ["fairness", "truth", "justice", "balance"]
  },
  {
    name: "The Hanged Man",
    arcana: "Major",
    number: 12,
    meaning: "The Hanged Man represents suspension, restriction, letting go, and sacrifice. This card suggests a period of waiting and gaining new perspective.",
    symbolism: "The upside-down position represents seeing things from a different perspective, while the halo represents spiritual enlightenment gained through sacrifice.",
    guidance: "Sometimes progress requires patience and letting go. Use this time of suspension to gain new insights and perspectives.",
    keywords: ["sacrifice", "waiting", "new perspective", "letting go"]
  },
  {
    name: "Death",
    arcana: "Major",
    number: 13,
    meaning: "Death represents transformation, endings, and new beginnings. This card rarely represents literal death but rather the end of one phase and the beginning of another.",
    symbolism: "The white rose represents purity and the promise of new life, while the rising sun represents rebirth and new beginnings after endings.",
    guidance: "Embrace necessary endings as they make way for new beginnings. Transformation is essential for growth and evolution.",
    keywords: ["transformation", "endings", "rebirth", "change"]
  },
  {
    name: "Temperance",
    arcana: "Major",
    number: 14,
    meaning: "Temperance represents balance, moderation, patience, and finding the middle path. This card suggests the need for patience and measured approach.",
    symbolism: "The angel pouring water between cups represents the flow and balance of energies, while one foot on land and one in water represents balance between realms.",
    guidance: "Find balance and moderation in all things. Patience and a measured approach will lead to harmony and success.",
    keywords: ["balance", "moderation", "patience", "harmony"]
  },
  {
    name: "The Devil",
    arcana: "Major",
    number: 15,
    meaning: "The Devil represents bondage, addiction, sexuality, and materialism. This card suggests being trapped by material desires or unhealthy patterns.",
    symbolism: "The chains are loose, representing that bondage is often self-imposed and can be removed. The inverted pentagram represents spiritual imbalance.",
    guidance: "Recognize the chains that bind you and realize you have the power to break free. Examine what unhealthy patterns or addictions may be controlling you.",
    keywords: ["bondage", "addiction", "materialism", "temptation"]
  },
  {
    name: "The Tower",
    arcana: "Major",
    number: 16,
    meaning: "The Tower represents sudden change, upheaval, chaos, and revelation. This card indicates that false foundations are being destroyed to make way for truth.",
    symbolism: "Lightning strikes the crown, representing divine intervention and sudden illumination. People falling represent the ego being humbled.",
    guidance: "While sudden change can be shocking, it often clears away what no longer serves you. Trust that destruction leads to reconstruction on firmer ground.",
    keywords: ["sudden change", "upheaval", "revelation", "destruction"]
  },
  {
    name: "The Star",
    arcana: "Major",
    number: 17,
    meaning: "The Star represents hope, faith, purpose, renewal, and spirituality. This card brings optimism and suggests that your hopes will be fulfilled.",
    symbolism: "The woman pouring water represents the flow of consciousness and the renewal of spirit. The seven small stars represent the chakras.",
    guidance: "Have faith in the future and trust in your spiritual guidance. This is a time of healing, renewal, and moving toward your higher purpose.",
    keywords: ["hope", "faith", "inspiration", "spirituality"]
  },
  {
    name: "The Moon",
    arcana: "Major",
    number: 18,
    meaning: "The Moon represents illusion, fear, anxiety, subconscious, and intuition. This card suggests confusion and the need to trust your intuition through uncertain times.",
    symbolism: "The moon's changing face represents illusion and changing perceptions. The path between the towers represents the journey through uncertainty.",
    guidance: "Trust your intuition when things seem unclear or confusing. Pay attention to your dreams and subconscious messages during this time of uncertainty.",
    keywords: ["illusion", "intuition", "subconscious", "uncertainty"]
  },
  {
    name: "The Sun",
    arcana: "Major",
    number: 19,
    meaning: "The Sun represents positivity, fun, warmth, success, and vitality. This card brings joy, success, and positive energy to any situation.",
    symbolism: "The sun represents life, energy, and enlightenment. The child on the horse represents innocence, joy, and the free spirit.",
    guidance: "Embrace joy and optimism. This is a time of success, vitality, and positive outcomes. Let your light shine brightly.",
    keywords: ["positivity", "success", "joy", "vitality"]
  },
  {
    name: "Judgement",
    arcana: "Major",
    number: 20,
    meaning: "Judgement represents rebirth, inner calling, absolution, and spiritual awakening. This card suggests a time of evaluation and spiritual renewal.",
    symbolism: "The angel's trumpet represents divine calling and awakening. The people rising represent resurrection and spiritual rebirth.",
    guidance: "Listen to your inner calling and prepare for spiritual awakening. This is a time for evaluation, forgiveness, and starting fresh.",
    keywords: ["rebirth", "awakening", "calling", "evaluation"]
  },
  {
    name: "The World",
    arcana: "Major",
    number: 21,
    meaning: "The World represents completion, integration, accomplishment, and travel. This card indicates the successful completion of a journey or project.",
    symbolism: "The figure in the center represents the integration of all aspects of self. The four creatures represent the four elements and completion.",
    guidance: "Celebrate your achievements and the completion of an important cycle. You have integrated all aspects of your journey and reached a state of wholeness.",
    keywords: ["completion", "achievement", "integration", "success"]
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    for (const card of majorArcanaCards) {
      await pool.query(`
        INSERT INTO tarot_cards (name, arcana, number, suit, meaning, symbolism, guidance, image_url, keywords)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        card.name,
        card.arcana,
        card.number,
        null, // suit
        card.meaning,
        card.symbolism,
        card.guidance,
        null, // image_url
        card.keywords
      ]);
    }
    
    console.log(`Successfully seeded ${majorArcanaCards.length} Major Arcana cards`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();