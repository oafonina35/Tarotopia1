import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";

export function TestFreeOCRButton() {
  const [isTestingFreeOCR, setIsTestingFreeOCR] = useState(false);
  const [freeOCRResult, setFreeOCRResult] = useState<string | null>(null);
  const [freeOCRError, setFreeOCRError] = useState<string | null>(null);

  const testFreeOCR = async () => {
    setIsTestingFreeOCR(true);
    setFreeOCRResult(null);
    setFreeOCRError(null);

    try {
      // Create a simple test image with text "THE FOOL"
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 100);
        
        // Black text
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('THE FOOL', 100, 50);
        
        const imageData = canvas.toDataURL('image/png');
        
        const response = await fetch('/api/recognize-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData })
        });

        const data = await response.json();
        
        if (data.card && data.method === 'free-ocr') {
          setFreeOCRResult(`✅ Success: "${data.card.name}" via Free OCR (confidence: ${(data.confidence * 100).toFixed(0)}%)`);
        } else if (data.card) {
          setFreeOCRResult(`ℹ️ Recognized via ${data.method}: "${data.card.name}"`);
        } else {
          setFreeOCRError('Free OCR could not read the test text');
        }
      }
    } catch (error) {
      setFreeOCRError('Free OCR test failed');
      console.error('Free OCR test error:', error);
    } finally {
      setIsTestingFreeOCR(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          onClick={testFreeOCR} 
          disabled={isTestingFreeOCR}
          variant="outline"
          size="sm"
        >
          {isTestingFreeOCR ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Free OCR...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Test Free OCR
            </>
          )}
        </Button>
        
        {freeOCRResult && (
          <Badge variant="default" className="bg-blue-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Working
          </Badge>
        )}
        
        {freeOCRError && (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )}
      </div>

      {freeOCRResult && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {freeOCRResult}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Free OCR API: 500 requests/day, no cost ever!
          </p>
        </div>
      )}

      {freeOCRError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {freeOCRError}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            The free OCR service may be temporarily unavailable
          </p>
        </div>
      )}
    </div>
  );
}