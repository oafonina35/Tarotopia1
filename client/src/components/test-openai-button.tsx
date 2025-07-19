import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";

export function TestOpenAIButton() {
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [openAIResult, setOpenAIResult] = useState<string | null>(null);
  const [openAIError, setOpenAIError] = useState<string | null>(null);

  const testOpenAIVision = async () => {
    setIsTestingOpenAI(true);
    setOpenAIResult(null);
    setOpenAIError(null);

    try {
      const response = await fetch('/api/test-openai-vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success && data.result.card) {
        setOpenAIResult(`✅ Success: "${data.result.card.name}" (confidence: ${(data.result.confidence * 100).toFixed(0)}%)`);
      } else if (data.result.extractedText === 'UNCLEAR') {
        setOpenAIError('OpenAI could not read the card text clearly');
      } else {
        setOpenAIError(data.error || 'Failed to identify card');
      }
    } catch (error) {
      setOpenAIError('Network error or API unavailable');
      console.error('OpenAI test error:', error);
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          onClick={testOpenAIVision} 
          disabled={isTestingOpenAI}
          variant="outline"
          size="sm"
        >
          {isTestingOpenAI ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing OpenAI Vision...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Test OpenAI Vision
            </>
          )}
        </Button>
        
        {openAIResult && (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Working
          </Badge>
        )}
        
        {openAIError && (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )}
      </div>

      {openAIResult && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {openAIResult}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            OpenAI Vision successfully read "The Fool" from your card image!
          </p>
        </div>
      )}

      {openAIError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {openAIError}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Check your OpenAI API key or try again
          </p>
        </div>
      )}
    </div>
  );
}