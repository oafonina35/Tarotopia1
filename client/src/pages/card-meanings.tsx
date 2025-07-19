import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import NavigationMenu from "@/components/navigation-menu";
import { Search } from "lucide-react";
import type { TarotCard } from "@shared/schema";
import tarotopiaLogo from "@assets/Tarotopia-01_1752963540547.png";

export default function CardMeanings() {
  const [searchTerm, setSearchTerm] = useState("");

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
      (card.suit && card.suit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.meaning && card.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => getSortOrder(a) - getSortOrder(b));

  return (
    <div className="min-h-screen ethereal-gradient">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <NavigationMenu />
          <div className="flex-1 flex justify-center">
            <img 
              src={tarotopiaLogo} 
              alt="Tarotopia Logo" 
              className="w-36 h-36 object-contain"
            />
          </div>
        </div>
      </header>
      
      <main className="relative z-10 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-teal-700">Card Meanings Guide</CardTitle>
            <CardDescription className="text-center">
              Explore the complete meanings and symbolism of all 78 tarot cards
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by card name, arcana, suit, or meaning..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <ScrollArea className="h-[600px] w-full">
              <div className="space-y-4 pr-4">
                {filteredCards.map((card) => (
                  <Card key={card.id} className="border-muted">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-4">
                        {card.imageUrl && (
                          <div className="w-32 h-48 rounded border overflow-hidden flex-shrink-0">
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
                        
                        <div className="w-full space-y-3">
                          <div className="text-center">
                            <h3 className="text-xl font-semibold text-teal-700 mb-2">{card.name}</h3>
                            <div className="flex items-center justify-center gap-2">
                              <Badge variant={card.arcana === 'Major' ? 'default' : 'secondary'}>
                                {card.arcana} Arcana
                              </Badge>
                              {card.suit && (
                                <Badge variant="outline">{card.suit}</Badge>
                              )}
                            </div>
                          </div>
                          
                          {card.meaning && (
                            <div>
                              <h4 className="font-medium text-teal-600 mb-1">Meaning:</h4>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {card.meaning}
                              </p>
                            </div>
                          )}
                          

                          
                          {card.keywords && (
                            <div>
                              <h4 className="font-medium text-teal-600 mb-1">Keywords:</h4>
                              <p className="text-sm text-slate-600">
                                {card.keywords}
                              </p>
                            </div>
                          )}
                        </div>
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

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {filteredCards.length} of {cards.length} cards shown
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}