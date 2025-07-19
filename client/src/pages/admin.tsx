import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Trash2 } from "lucide-react";
import type { InsertTarotCard } from "@shared/schema";

interface CardForm {
  name: string;
  arcana: "Major" | "Minor";
  number?: number;
  suit?: string;
  meaning: string;
  symbolism: string;
  guidance: string;
  keywords: string;
  imageFile?: File;
}

export default function Admin() {
  const [cards, setCards] = useState<CardForm[]>([{
    name: "",
    arcana: "Major",
    meaning: "",
    symbolism: "",
    guidance: "",
    keywords: ""
  }]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCardMutation = useMutation({
    mutationFn: async (cardData: InsertTarotCard) => {
      const response = await apiRequest('POST', '/api/cards', cardData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      toast({
        title: "Card Added",
        description: "Tarot card has been successfully added to the database.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add card: " + error.message,
        variant: "destructive",
      });
    }
  });

  const addNewCard = () => {
    setCards([...cards, {
      name: "",
      arcana: "Major",
      meaning: "",
      symbolism: "",
      guidance: "",
      keywords: ""
    }]);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: keyof CardForm, value: any) => {
    const updated = cards.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    );
    setCards(updated);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (cardIndex: number) => {
    const card = cards[cardIndex];
    
    if (!card.name || !card.meaning || !card.symbolism || !card.guidance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    let imageUrl = null;
    if (card.imageFile) {
      try {
        imageUrl = await convertImageToBase64(card.imageFile);
      } catch (error) {
        toast({
          title: "Image Error",
          description: "Failed to process image file.",
          variant: "destructive",
        });
        return;
      }
    }

    const cardData: InsertTarotCard = {
      name: card.name,
      arcana: card.arcana,
      number: card.number,
      suit: card.suit || null,
      meaning: card.meaning,
      symbolism: card.symbolism,
      guidance: card.guidance,
      imageUrl,
      keywords: card.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    createCardMutation.mutate(cardData);
  };

  return (
    <div className="min-h-screen cosmic-gradient">
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-mystic-gold text-center">
            Card Database Admin
          </h1>
          <p className="text-gray-300 text-center mt-2">
            Add new tarot cards with images and descriptions
          </p>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {cards.map((card, index) => (
              <Card key={index} className="card-gradient border border-mystic-purple/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-mystic-gold">
                    Card {index + 1}
                  </CardTitle>
                  {cards.length > 1 && (
                    <Button
                      onClick={() => removeCard(index)}
                      variant="outline"
                      size="icon"
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Card Name *</label>
                      <Input
                        placeholder="e.g., The Fool"
                        value={card.name}
                        onChange={(e) => updateCard(index, 'name', e.target.value)}
                        className="bg-charcoal/50 border-mystic-purple/30 text-gray-200"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-300">Arcana *</label>
                      <Select value={card.arcana} onValueChange={(value: "Major" | "Minor") => updateCard(index, 'arcana', value)}>
                        <SelectTrigger className="bg-charcoal/50 border-mystic-purple/30 text-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Major">Major Arcana</SelectItem>
                          <SelectItem value="Minor">Minor Arcana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300">Number</label>
                      <Input
                        type="number"
                        placeholder="0-21 for Major, 1-14 for Minor"
                        value={card.number || ""}
                        onChange={(e) => updateCard(index, 'number', parseInt(e.target.value) || undefined)}
                        className="bg-charcoal/50 border-mystic-purple/30 text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300">Suit (Minor Arcana only)</label>
                      <Input
                        placeholder="Cups, Wands, Swords, Pentacles"
                        value={card.suit || ""}
                        onChange={(e) => updateCard(index, 'suit', e.target.value)}
                        className="bg-charcoal/50 border-mystic-purple/30 text-gray-200"
                        disabled={card.arcana === "Major"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Card Image</label>
                    <div className="mt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateCard(index, 'imageFile', e.target.files?.[0])}
                        className="hidden"
                        id={`image-${index}`}
                      />
                      <label
                        htmlFor={`image-${index}`}
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-mystic-purple/50 rounded-lg cursor-pointer hover:border-mystic-gold/50 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-mystic-gold mx-auto mb-2" />
                          <p className="text-gray-300 text-sm">
                            {card.imageFile ? card.imageFile.name : 'Click to upload card image'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Meaning *</label>
                    <Textarea
                      placeholder="Describe what this card represents and its general meaning..."
                      value={card.meaning}
                      onChange={(e) => updateCard(index, 'meaning', e.target.value)}
                      className="bg-charcoal/50 border-mystic-purple/30 text-gray-200 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Symbolism *</label>
                    <Textarea
                      placeholder="Explain the symbols and imagery on this card..."
                      value={card.symbolism}
                      onChange={(e) => updateCard(index, 'symbolism', e.target.value)}
                      className="bg-charcoal/50 border-mystic-purple/30 text-gray-200 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Guidance *</label>
                    <Textarea
                      placeholder="What guidance or advice does this card offer..."
                      value={card.guidance}
                      onChange={(e) => updateCard(index, 'guidance', e.target.value)}
                      className="bg-charcoal/50 border-mystic-purple/30 text-gray-200 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Keywords</label>
                    <Input
                      placeholder="love, relationships, choices, harmony (comma-separated)"
                      value={card.keywords}
                      onChange={(e) => updateCard(index, 'keywords', e.target.value)}
                      className="bg-charcoal/50 border-mystic-purple/30 text-gray-200"
                    />
                  </div>

                  <Button
                    onClick={() => handleSubmit(index)}
                    disabled={createCardMutation.isPending}
                    className="w-full bg-mystic-gold text-rich-black font-semibold hover:bg-yellow-400"
                  >
                    {createCardMutation.isPending ? "Adding..." : "Add Card"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button
              onClick={addNewCard}
              variant="outline"
              className="border-mystic-gold text-mystic-gold hover:bg-mystic-gold hover:text-rich-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Card
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}