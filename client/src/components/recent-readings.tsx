import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardReading } from "@shared/schema";

export default function RecentReadings() {
  const { data: readings, isLoading } = useQuery<CardReading[]>({
    queryKey: ['/api/readings'],
    queryFn: async () => {
      const response = await fetch('/api/readings?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      return response.json();
    },
  });

  const formatTimeAgo = (timestamp: string | Date | null | undefined) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getShortMeaning = (cardName: string) => {
    // Simple mapping for common cards - in a real app this would come from the API
    const meanings: { [key: string]: string } = {
      'The Fool': 'New beginnings, adventure',
      'The Magician': 'Manifestation, willpower',
      'The High Priestess': 'Intuition, mystery',
      'The Empress': 'Abundance, creativity',
      'The Emperor': 'Authority, structure',
      'The Hierophant': 'Tradition, spirituality',
      'The Lovers': 'Love, relationships',
      'The Chariot': 'Control, determination',
      'Strength': 'Inner strength, courage',
      'The Hermit': 'Soul searching, wisdom',
      'Wheel of Fortune': 'Change, luck',
      'Justice': 'Fairness, truth',
      'The Hanged Man': 'Sacrifice, new perspective',
      'Death': 'Transformation, endings',
      'Temperance': 'Balance, moderation',
      'The Devil': 'Bondage, materialism',
      'The Tower': 'Sudden change, revelation',
      'The Star': 'Hope, inspiration',
      'The Moon': 'Illusion, intuition',
      'The Sun': 'Joy, success',
      'Judgement': 'Rebirth, awakening',
      'The World': 'Completion, achievement'
    };
    
    return meanings[cardName] || 'Mystical guidance';
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-serif font-semibold text-mystic-gold mb-4 text-center">Recent Readings</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-charcoal/50 rounded-xl p-4 border border-mystic-purple/20 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-12 h-18 bg-mystic-purple/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 bg-mystic-purple/20" />
                  <Skeleton className="h-3 w-20 bg-mystic-purple/20" />
                  <Skeleton className="h-3 w-32 bg-mystic-purple/20" />
                </div>
                <Skeleton className="w-8 h-8 bg-mystic-purple/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!readings || readings.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-serif font-semibold text-mystic-gold mb-4 text-center">Recent Readings</h3>
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-mystic-gold/50 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No readings yet</p>
          <p className="text-gray-500 text-xs mt-1">Scan your first card to begin your mystical journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-serif font-semibold text-mystic-gold mb-4 text-center">Recent Readings</h3>
      
      <div className="space-y-3">
        {readings.map((reading) => (
          <div
            key={reading.id}
            className="bg-charcoal/50 rounded-xl p-4 border border-mystic-purple/20 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3">
              {/* Card Image Placeholder */}
              <div className="w-12 h-18 bg-gradient-to-br from-mystic-purple to-cosmic-blue rounded border border-mystic-gold/30 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-mystic-gold" fill="currentColor" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-200 truncate">{reading.cardName}</h4>
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(reading.timestamp)}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {getShortMeaning(reading.cardName)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-mystic-gold hover:bg-mystic-gold/10 flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
