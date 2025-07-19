import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import type { TarotCard, CardReading } from "@shared/schema";

interface ManualCardSelectorProps {
  onCardSelected: (card: TarotCard, reading: CardReading) => void;
  onClose: () => void;
}

export default function ManualCardSelector({ onCardSelected, onClose }: ManualCardSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["/api/cards"],
  });

  const createReadingMutation = useMutation({
    mutationFn: async (card: TarotCard) => {
      // Create reading directly for the selected card
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          cardName: card.name,
          imageData: `manual_selection_${card.id}_${Date.now()}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create reading");
      }
      
      const reading = await response.json();
      return { card, reading };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/readings"] });
      onCardSelected(data.card, data.reading);
    },
  });

  const filteredCards = cards.filter((card: TarotCard) =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.arcana.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.suit && card.suit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCardSelect = (card: TarotCard) => {
    createReadingMutation.mutate(card);
  };

  return (
    <div className="card-gradient rounded-2xl p-6 border border-mystic-purple/30 backdrop-blur-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif font-semibold text-mystic-gold">Browse Your Custom Deck</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          ✕
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search cards by name, arcana, or suit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-rich-black/50 border-mystic-purple/30 text-gray-300 placeholder-gray-500"
        />
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-mystic-gold border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading your custom deck...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No cards found matching "{searchTerm}"</p>
          </div>
        ) : (
          filteredCards.map((card: TarotCard) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-3 bg-rich-black/30 rounded-lg border border-mystic-purple/20 hover:border-mystic-gold/50 transition-colors cursor-pointer"
              onClick={() => handleCardSelect(card)}
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-300">{card.name}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{card.arcana} Arcana</span>
                  {card.suit && <span>• {card.suit}</span>}
                  {card.number && <span>• #{card.number}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {card.imageUrl && (
                  <div className="w-8 h-8 bg-mystic-purple/20 rounded border border-mystic-purple/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-mystic-gold" />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10"
                  disabled={createReadingMutation.isPending}
                >
                  {createReadingMutation.isPending ? "..." : "Select"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 bg-mystic-purple/10 rounded-lg border border-mystic-purple/20">
        <p className="text-xs text-gray-400">
          <strong className="text-mystic-gold">Note:</strong> This manual selector lets you test your custom deck descriptions. 
          Real image recognition would analyze uploaded photos to automatically identify cards.
        </p>
      </div>
    </div>
  );
}