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

      {/* Card Image Placeholder */}
      <div className="mb-6 flex justify-center">
        <div className="w-32 h-48 bg-gradient-to-br from-mystic-purple to-cosmic-blue rounded-lg shadow-lg border border-mystic-gold/30 flex items-center justify-center">
          <div className="text-center">
            <Star className="w-8 h-8 text-mystic-gold mx-auto mb-2" fill="currentColor" />
            <p className="text-mystic-gold text-xs font-medium">{card.name}</p>
          </div>
        </div>
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
          <h4 className="text-lg font-serif font-semibold text-mystic-gold mb-2">Symbolism</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {card.symbolism}
          </p>
        </div>

        <div>
          <h4 className="text-lg font-serif font-semibold text-mystic-gold mb-2">Guidance</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {card.guidance}
          </p>
        </div>

        {card.keywords && card.keywords.length > 0 && (
          <div>
            <h4 className="text-lg font-serif font-semibold text-mystic-gold mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {card.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-mystic-purple/30 text-mystic-gold text-xs rounded-md border border-mystic-gold/20"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
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
