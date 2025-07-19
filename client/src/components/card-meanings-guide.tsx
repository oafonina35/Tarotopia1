import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import type { TarotCard } from "@shared/schema";

interface CardMeaningsGuideProps {
  onBack: () => void;
}

export default function CardMeaningsGuide({ onBack }: CardMeaningsGuideProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  const { data: cards = [] } = useQuery<TarotCard[]>({
    queryKey: ['/api/cards'],
  });

  const getSortOrder = (card: TarotCard): number => {
    // Major Arcana first (0-21)
    if (card.arcana === 'Major') {
      return card.number ?? 0;
    }
    
    // Minor Arcana - offset by 100 + suit order + card number
    const suitOrder = {
      'Wands': 100,
      'Cups': 200,
      'Swords': 300,
      'Pentacles': 400
    };
    
    const suitOffset = suitOrder[card.suit as keyof typeof suitOrder] ?? 500;
    
    // Handle court cards (Page=11, Knight=12, Queen=13, King=14)
    if (card.name.includes('Page')) return suitOffset + 11;
    if (card.name.includes('Knight')) return suitOffset + 12;
    if (card.name.includes('Queen')) return suitOffset + 13;
    if (card.name.includes('King')) return suitOffset + 14;
    if (card.name.includes('Ace')) return suitOffset + 1;
    
    // Extract number from card name (e.g., "2 of Wands" -> 2)
    const match = card.name.match(/^(\d+)\s+of/);
    const cardNumber = match ? parseInt(match[1]) : 15;
    
    return suitOffset + cardNumber;
  };

  const filteredCards = cards
    .filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.arcana.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.suit && card.suit.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => getSortOrder(a) - getSortOrder(b));

  if (selectedCard) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCard(null)}
              className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-teal-700">{selectedCard.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedCard.arcana === 'Major' ? 'default' : 'secondary'}>
                    {selectedCard.arcana} Arcana
                  </Badge>
                  {selectedCard.suit && (
                    <Badge variant="outline">{selectedCard.suit}</Badge>
                  )}
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {selectedCard.imageUrl && (
            <div className="flex justify-center">
              <div className="w-48 h-72 rounded-lg border overflow-hidden">
                <img
                  src={selectedCard.imageUrl.replace('@assets/', '/attached_assets/')}
                  alt={selectedCard.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-teal-700 mb-2">Meaning</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedCard.meaning}</p>
            </div>
            
            {selectedCard.symbolism && (
              <div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Symbolism</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCard.symbolism}</p>
              </div>
            )}
            
            {selectedCard.guidance && (
              <div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Guidance</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCard.guidance}</p>
              </div>
            )}
            
            {selectedCard.keywords && (
              <div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Keywords</h3>
                <p className="text-gray-600">{selectedCard.keywords}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-teal-700">Card Meanings Guide</CardTitle>
            <CardDescription>
              Browse all tarot card meanings and descriptions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards by name, arcana, or suit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <ScrollArea className="h-96 w-full">
          <div className="grid gap-2 pr-4">
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-muted hover:border-primary/50"
                onClick={() => setSelectedCard(card)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-teal-800">{card.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={card.arcana === 'Major' ? 'default' : 'secondary'}>
                          {card.arcana} Arcana
                        </Badge>
                        {card.suit && (
                          <Badge variant="outline">{card.suit}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {card.meaning.substring(0, 120)}...
                      </p>
                    </div>
                    {card.imageUrl && (
                      <div className="w-20 h-28 rounded border overflow-hidden ml-4 flex-shrink-0">
                        <img
                          src={card.imageUrl.replace('@assets/', '/attached_assets/')}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No cards found matching "{searchTerm}"
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          {filteredCards.length} cards available
        </p>
      </CardContent>
    </Card>
  );
}