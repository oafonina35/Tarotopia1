import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Wand2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TarotCard, CardReading } from "@shared/schema";

interface ManualCardSelectorProps {
  onCardSelected: (card: TarotCard, reading: CardReading) => void;
  onClose: () => void;
}

export default function ManualCardSelector({ onCardSelected, onClose }: ManualCardSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: cards = [] } = useQuery<TarotCard[]>({
    queryKey: ['/api/cards'],
  });

  const createReadingMutation = useMutation({
    mutationFn: async (cardId: number): Promise<CardReading> => {
      const response = await apiRequest('POST', '/api/readings', { 
        cardId, 
        imageData: null,
        confidence: 1.0,
        method: 'manual_selection'
      });
      return response.json();
    },
    onSuccess: (reading, cardId) => {
      const selectedCard = cards.find(c => c.id === cardId);
      if (selectedCard) {
        onCardSelected(selectedCard, reading);
        toast({
          title: "Card Selected!",
          description: `You chose "${selectedCard.name}" - view the full reading below.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create reading. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.arcana.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.suit && card.suit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCardSelect = (card: TarotCard) => {
    createReadingMutation.mutate(card.id);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Choose Your Card
        </CardTitle>
        <CardDescription>
          Select any card from your deck to view its meaning and guidance
        </CardDescription>
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
                onClick={() => handleCardSelect(card)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{card.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={card.arcana === 'Major' ? 'default' : 'secondary'}>
                          {card.arcana} Arcana
                        </Badge>
                        {card.suit && (
                          <Badge variant="outline">{card.suit}</Badge>
                        )}
                      </div>
                    </div>
                    {card.imageUrl && (
                      <div className="w-12 h-16 rounded border overflow-hidden ml-4 flex-shrink-0">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full h-full object-cover"
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

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Back to Scanner
          </Button>
          <p className="text-sm text-muted-foreground self-center">
            {filteredCards.length} cards available
          </p>
        </div>
      </CardContent>
    </Card>
  );
}