import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TarotCard } from "@shared/schema";

interface TrainingInterfaceProps {
  scannedImage: string;
  currentCard: TarotCard;
  confidence: number;
  isLearned: boolean;
  method: string;
}

export function TrainingInterface({ 
  scannedImage, 
  currentCard, 
  confidence, 
  isLearned,
  method 
}: TrainingInterfaceProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all cards for the dropdown
  const { data: allCards = [] } = useQuery<TarotCard[]>({
    queryKey: ['/api/cards'],
  });

  // Training mutation
  const trainMutation = useMutation({
    mutationFn: async ({ imageData, cardId }: { imageData: string; cardId: number }) => {
      return apiRequest('/api/train-card', {
        method: 'POST',
        body: { imageData, cardId }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Training Successful",
        description: `Scanner learned: ${data.cardName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/training-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Training Failed",
        description: error.message || "Could not train the scanner",
        variant: "destructive",
      });
    }
  });

  // Stats query
  const { data: stats } = useQuery({
    queryKey: ['/api/training-stats'],
  });

  const handleTrainCard = () => {
    if (!selectedCardId) {
      toast({
        title: "Select a Card",
        description: "Please choose the correct card from the dropdown",
        variant: "destructive",
      });
      return;
    }

    trainMutation.mutate({
      imageData: scannedImage,
      cardId: parseInt(selectedCardId)
    });
  };

  const confidenceColor = confidence > 0.8 ? "bg-green-500" : 
                         confidence > 0.6 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Scanner Training
          <div className="flex gap-2">
            <Badge variant={isLearned ? "default" : "secondary"}>
              {isLearned ? "Learned" : "Guessing"}
            </Badge>
            <Badge className={`${confidenceColor} text-white`}>
              {Math.round(confidence * 100)}%
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          {isLearned 
            ? "Scanner recognized this image from previous training"
            : "Help the scanner learn by selecting the correct card"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Scanner Result:</h4>
            <p className="text-lg font-semibold text-purple-400">{currentCard.name}</p>
            <p className="text-sm text-muted-foreground">Method: {method}</p>
          </div>
          
          {!isLearned && (
            <div className="space-y-3">
              <h4 className="font-medium">Correct this result:</h4>
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct card..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {allCards.map((card) => (
                    <SelectItem key={card.id} value={card.id.toString()}>
                      {card.name} ({card.arcana})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleTrainCard}
                disabled={trainMutation.isPending || !selectedCardId}
                className="w-full"
              >
                {trainMutation.isPending ? "Training..." : "Train Scanner"}
              </Button>
            </div>
          )}
        </div>

        {/* Advanced Stats */}
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide" : "Show"} Training Stats
          </Button>
          
          {showAdvanced && stats && (
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Total trained images:</strong> {stats.totalTrainedImages}
              </p>
              {stats.trainedCards.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Recently trained:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {stats.trainedCards.slice(0, 5).map((card: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {card}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}