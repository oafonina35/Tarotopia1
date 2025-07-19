import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Zap, DollarSign, Target } from "lucide-react";
import { TestOpenAIButton } from "./test-openai-button";
import { TestFreeOCRButton } from "./test-free-ocr-button";
import { UnlimitedOCROptions } from "./unlimited-ocr-options";

interface RecognitionOption {
  name: string;
  description: string;
  accuracy: string;
  cost: string;
}

interface RecognitionOptionsProps {
  onClose?: () => void;
}

export default function RecognitionOptions({ onClose }: RecognitionOptionsProps) {
  const { data: options } = useQuery<Record<string, RecognitionOption>>({
    queryKey: ['/api/recognition-options'],
  });

  if (!options) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading recognition options...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Card Recognition Options
        </CardTitle>
        <CardDescription>
          Compare different recognition services for better accuracy
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(options).map(([key, option]) => (
            <Card key={key} className={`border ${key === 'free' ? 'border-green-500' : 'border-muted'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{option.name}</CardTitle>
                  {key === 'free' && (
                    <Badge variant="default" className="bg-green-500">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">{option.cost}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Accuracy:</span>
                  <span className="text-sm">{option.accuracy}</span>
                </div>
                
                {key !== 'free' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // Open relevant pricing page
                      const urls = {
                        openai_hobby: 'https://openai.com/pricing',
                        openai_pro: 'https://openai.com/pricing',
                        google_vision: 'https://cloud.google.com/vision/pricing',
                        aws_textract: 'https://aws.amazon.com/textract/pricing/',
                        azure_computer_vision: 'https://azure.microsoft.com/en-us/pricing/details/cognitive-services/computer-vision/'
                      };
                      window.open(urls[key as keyof typeof urls], '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Recognition Options:</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-sm mb-2">Free OCR (No Cost Ever):</h5>
              <TestFreeOCRButton />
            </div>
            
            <div>
              <h5 className="font-medium text-sm mb-2">OpenAI Vision (Pay-per-use):</h5>
              <TestOpenAIButton />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Current Recognition Flow:</h4>
            <p className="text-sm text-muted-foreground">
              <strong>1. Training System:</strong> Learns from your corrections (95% accuracy, unlimited)
              <br/>
              <strong>2. Tesseract OCR:</strong> Unlimited offline text recognition (downloaded once)
              <br/>
              <strong>3. Free OCR API:</strong> OCR.space backup (500/day limit)
              <br/>
              <strong>4. OpenAI Vision:</strong> Best accuracy but costs ~1¢ per scan
              <br/>
              <strong>5. Pattern Matching:</strong> Final fallback for unknown cards
            </p>
          </div>
        </div>
        
        <UnlimitedOCROptions />
        
        {onClose && (
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}