import { Button } from "@/components/ui/button";
import { Star, Heart, RefreshCw } from "lucide-react";
import type { TarotCard, CardReading } from "@shared/schema";

interface CardResultProps {
  card: TarotCard;
  reading: CardReading | null;
  onScanAnother: () => void;
}

export default function CardResult({ card, reading, onScanAnother }: CardResultProps) {
  const handleSaveReading = () => {
    // In a real app, this would save to favorites or a personal collection
    console.log('Saving reading for card:', card.name);
  };

  return (
    <div className="card-gradient rounded-2xl p-6 border border-mystic-purple/30 backdrop-blur-sm mb-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 text-mystic-gold mb-3">
          <Star className="w-5 h-5" fill="currentColor" />
          <span className="text-sm font-medium">Card Identified</span>
        </div>
        <h3 className="text-2xl font-serif font-bold text-mystic-gold mb-2">{card.name}</h3>
        <p className="text-gray-400 text-sm">
          {card.arcana} Arcana • Card {card.number !== null ? card.number : 'N/A'}
        </p>
      </div>

      {/* Card Image */}
      <div className="mb-6 flex flex-col items-center">
        {card.imageUrl ? (
          <div className="relative w-32 h-48 rounded-lg shadow-lg border border-mystic-gold/30 overflow-hidden mb-3">
            <img 
              src={card.imageUrl.replace('@assets/', '/attached_assets/')}
              alt={card.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-mystic-purple to-cosmic-blue flex items-center justify-center">
                    <div class="text-center">
                      <div class="w-8 h-8 mx-auto mb-2 text-mystic-gold">★</div>
                      <p class="text-mystic-gold text-xs font-medium">${card.name}</p>
                    </div>
                  </div>
                `;
              }}
            />
          </div>
        ) : (
          <div className="w-32 h-48 bg-gradient-to-br from-mystic-purple to-cosmic-blue rounded-lg shadow-lg border border-mystic-gold/30 flex items-center justify-center mb-3">
            <div className="text-center">
              <Star className="w-8 h-8 text-mystic-gold mx-auto mb-2" fill="currentColor" />
              <p className="text-mystic-gold text-xs font-medium">{card.name}</p>
            </div>
          </div>
        )}
        <p className="text-center text-mystic-gold text-sm font-medium italic">
          {card.symbolism}
        </p>
      </div>

      {/* Card Description */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-serif font-semibold text-mystic-gold mb-2">Meaning</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {card.meaning}
          </p>
        </div>
        


        <div>
          <h4 className="text-lg font-serif font-semibold text-mystic-gold mb-2">Sensual Suggestions</h4>
          <div className="text-gray-300 text-sm leading-relaxed">
            {card.guidance && card.guidance.split(' – ').map((suggestion, index) => (
              <div key={index} className="flex items-start mb-2">
                <span className="text-mystic-gold mr-2 mt-1">•</span>
                <span>{suggestion.trim()}</span>
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-mystic-purple/30">
        <div className="flex space-x-3">
          <Button
            onClick={handleSaveReading}
            className="flex-1 bg-mystic-purple text-white font-medium py-3 px-4 hover:bg-mystic-purple/80 transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Save</span>
            </div>
          </Button>
          <Button
            onClick={onScanAnother}
            variant="outline"
            className="flex-1 border border-mystic-gold text-mystic-gold font-medium py-3 px-4 hover:bg-mystic-gold hover:text-rich-black transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Scan Another</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
