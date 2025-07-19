import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavigationMenu from "@/components/navigation-menu";
import { Star, Shuffle, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TarotCard, CardReading } from "@shared/schema";
import tarotopiaLogo from "@assets/Tarotopia-01_1752963540547.png";
import cardBackImage from "@assets/70x120 mm, cover_1752965274499.jpg";

export default function DailyCard() {
  const [currentCard, setCurrentCard] = useState<TarotCard | null>(null);
  const [currentReading, setCurrentReading] = useState<CardReading | null>(null);
  const { toast } = useToast();

  const { data: cards = [] } = useQuery<TarotCard[]>({
    queryKey: ['/api/cards'],
  });

  const pullDailyCardMutation = useMutation({
    mutationFn: async (): Promise<{ card: TarotCard; reading: CardReading }> => {
      if (cards.length === 0) throw new Error('No cards available');
      
      // Get random card
      const randomIndex = Math.floor(Math.random() * cards.length);
      const selectedCard = cards[randomIndex];
      
      // Create reading
      const response = await apiRequest('POST', '/api/readings', { 
        cardId: selectedCard.id,
        cardName: selectedCard.name,
        imageData: null
      });
      const reading = await response.json();
      
      return { card: selectedCard, reading };
    },
    onSuccess: ({ card, reading }) => {
      setCurrentCard(card);
      setCurrentReading(reading);
      toast({
        title: "Daily Card Drawn!",
        description: `Your guidance for today: "${card.name}"`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to draw daily card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePullDailyCard = () => {
    pullDailyCardMutation.mutate();
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
        <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-6 w-6 text-teal-600" />
              <CardTitle className="text-2xl text-teal-700">Daily Card</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {formatDate()}
            </CardDescription>
            <p className="text-sm text-slate-600 mt-2">
              Receive guidance and insight for your day ahead
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!currentCard ? (
              <div className="text-center space-y-6">
                <div className="w-32 h-48 mx-auto rounded-lg overflow-hidden border-2 border-purple-300 shadow-lg">
                  <img
                    src={cardBackImage}
                    alt="Mystical Card Back"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-teal-700">Ready for Your Daily Guidance?</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Take a moment to center yourself, then discover what the universe wants you to know today.
                  </p>
                  
                  <Button 
                    onClick={handlePullDailyCard}
                    disabled={pullDailyCardMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3"
                  >
                    {pullDailyCardMutation.isPending ? (
                      <>
                        <Shuffle className="w-4 h-4 mr-2 animate-spin" />
                        Drawing Your Card...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Draw Daily Card
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold text-teal-700">Your Card for Today</h3>
                  
                  {currentCard.imageUrl && (
                    <div className="w-48 h-72 mx-auto rounded-lg border-2 border-teal-200 overflow-hidden shadow-lg">
                      <img
                        src={currentCard.imageUrl.replace('@assets/', '/attached_assets/')}
                        alt={currentCard.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-teal-700 mb-2">{currentCard.name}</h4>
                      <div className="flex justify-center gap-2 mb-4">
                        <Badge variant={currentCard.arcana === 'Major' ? 'default' : 'secondary'}>
                          {currentCard.arcana} Arcana
                        </Badge>
                        {currentCard.suit && (
                          <Badge variant="outline">{currentCard.suit}</Badge>
                        )}
                      </div>
                    </div>
                    
                    {currentCard.meaning && (
                      <div className="text-left max-w-2xl mx-auto">
                        <h5 className="font-semibold text-teal-600 mb-2">Today's Message:</h5>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                          {currentCard.meaning.split('\n\n')[0]}
                        </p>
                      </div>
                    )}
                    
                    {currentCard.keywords && (
                      <div className="text-left max-w-2xl mx-auto">
                        <h5 className="font-semibold text-teal-600 mb-2">Focus Areas:</h5>
                        <p className="text-sm text-slate-600">
                          {currentCard.keywords}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <p className="text-sm text-slate-500">
                    Reflect on this message throughout your day
                  </p>
                  
                  <Button 
                    onClick={handlePullDailyCard}
                    variant="outline"
                    disabled={pullDailyCardMutation.isPending}
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Draw Another Card
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}