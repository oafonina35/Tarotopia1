import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Shuffle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TarotCard, CardReading } from "@shared/schema";

interface DailyCardProps {
  onBack: () => void;
}

export default function DailyCard({ onBack }: DailyCardProps) {
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [drawnReading, setDrawnReading] = useState<CardReading | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  const { data: cards = [] } = useQuery<TarotCard[]>({
    queryKey: ['/api/cards'],
  });

  const createReadingMutation = useMutation({
    mutationFn: async (card: TarotCard): Promise<CardReading> => {
      const response = await apiRequest('POST', '/api/readings', { 
        cardId: card.id,
        cardName: card.name,
        imageData: null
      });
      return response.json();
    },
    onSuccess: (reading, card) => {
      setDrawnCard(card);
      setDrawnReading(reading);
      setIsDrawing(false);
      toast({
        title: "Daily Card Drawn!",
        description: `Your guidance for today: "${card.name}"`,
      });
    },
    onError: (error) => {
      setIsDrawing(false);
      toast({
        title: "Error",
        description: "Failed to draw daily card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const drawDailyCard = () => {
    if (cards.length === 0) return;
    
    setIsDrawing(true);
    
    // Add a small delay for dramatic effect
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * cards.length);
      const selectedCard = cards[randomIndex];
      createReadingMutation.mutate(selectedCard);
    }, 800);
  };

  const drawNewCard = () => {
    setDrawnCard(null);
    setDrawnReading(null);
    drawDailyCard();
  };

  if (drawnCard && drawnReading) {
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
              <CardTitle className="text-teal-700">Your Daily Card</CardTitle>
              <CardDescription>
                Guidance and wisdom for today
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-800 mb-4">{drawnCard.name}</h2>
            
            {drawnCard.imageUrl && (
              <div className="flex justify-center mb-6">
                <div className="w-48 h-72 rounded-lg border overflow-hidden shadow-lg">
                  <img
                    src={drawnCard.imageUrl.replace('@assets/', '/attached_assets/')}
                    alt={drawnCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-teal-700 mb-2">Today's Message</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{drawnCard.meaning}</p>
            </div>
            
            {drawnCard.guidance && (
              <div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Guidance</h3>
                <p className="text-gray-700 leading-relaxed">{drawnCard.guidance}</p>
              </div>
            )}
            
            {drawnCard.keywords && (
              <div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Key Themes</h3>
                <p className="text-gray-600">{drawnCard.keywords}</p>
              </div>
            )}

            {drawnCard.arcana === 'Major' && drawnCard.sensualSuggestions && (
              <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                <h3 className="text-lg font-semibold text-rose-700 mb-2">Sensual Suggestions</h3>
                <p className="text-rose-800 leading-relaxed whitespace-pre-line">{drawnCard.sensualSuggestions}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={drawNewCard}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Draw Another Card
            </Button>
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
            <CardTitle className="text-teal-700">Daily Card</CardTitle>
            <CardDescription>
              Draw a random card for today's guidance
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <Star className="h-16 w-16 text-teal-500 mx-auto" />
            <h2 className="text-2xl font-bold text-teal-800">Discover Your Path</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Let the universe guide you with a randomly drawn card. Each card offers wisdom, 
              insight, and guidance for your day ahead.
            </p>
          </div>
          
          <Button
            onClick={drawDailyCard}
            disabled={isDrawing || cards.length === 0}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
          >
            {isDrawing ? (
              <>
                <Shuffle className="w-5 h-5 mr-2 animate-spin" />
                Drawing Card...
              </>
            ) : (
              <>
                <Star className="w-5 h-5 mr-2" />
                Draw Your Daily Card
              </>
            )}
          </Button>
          
          {cards.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Loading cards...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}