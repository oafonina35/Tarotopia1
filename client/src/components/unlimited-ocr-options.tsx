import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Server, Globe, Zap } from "lucide-react";

export function UnlimitedOCROptions() {
  const [isTestingTesseract, setIsTestingTesseract] = useState(false);
  const [tesseractResult, setTesseractResult] = useState<string | null>(null);

  const testTesseract = async () => {
    setIsTestingTesseract(true);
    setTesseractResult(null);

    try {
      // Create test image with "THE FOOL" text
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 80);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('THE FOOL', 150, 45);
        
        const imageData = canvas.toDataURL('image/png');
        
        const response = await fetch('/api/recognize-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData })
        });

        const data = await response.json();
        
        if (data.card && data.method === 'tesseract') {
          setTesseractResult(`✅ Tesseract recognized: "${data.card.name}"`);
        } else if (data.card) {
          setTesseractResult(`ℹ️ Recognized via ${data.method}: "${data.card.name}"`);
        } else {
          setTesseractResult('❌ Tesseract test failed');
        }
      }
    } catch (error) {
      setTesseractResult('❌ Tesseract test error');
      console.error('Tesseract test error:', error);
    } finally {
      setIsTestingTesseract(false);
    }
  };

  const ocrOptions = [
    {
      name: "Tesseract.js",
      description: "Runs in browser/Node.js, completely offline after download",
      limits: "Unlimited Forever",
      accuracy: "Good (85-90%)",
      setup: "Already installed",
      icon: <Download className="w-5 h-5" />,
      color: "bg-green-500",
      status: "Ready"
    },
    {
      name: "PaddleOCR",
      description: "Ultra-accurate Chinese AI model, supports 80+ languages",
      limits: "Unlimited",
      accuracy: "Excellent (95-98%)", 
      setup: "Python: pip install paddleocr",
      icon: <Server className="w-5 h-5" />,
      color: "bg-blue-500",
      status: "Available"
    },
    {
      name: "EasyOCR",
      description: "Simple Python OCR with great accuracy",
      limits: "Unlimited",
      accuracy: "Very Good (90-95%)",
      setup: "Python: pip install easyocr",
      icon: <Zap className="w-5 h-5" />,
      color: "bg-purple-500", 
      status: "Available"
    },
    {
      name: "Browser Text API",
      description: "Native browser text detection (Chrome/Edge)",
      limits: "Unlimited",
      accuracy: "Good (80-90%)",
      setup: "Client-side only",
      icon: <Globe className="w-5 h-5" />,
      color: "bg-orange-500",
      status: "Browser-only"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Unlimited OCR Solutions (No API Limits)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {ocrOptions.map((option, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${option.color} text-white`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{option.name}</h4>
                      <Badge variant={option.status === "Ready" ? "default" : "secondary"}>
                        {option.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {option.description}
                    </p>
                    <div className="space-y-1 text-xs">
                      <div><strong>Limits:</strong> {option.limits}</div>
                      <div><strong>Accuracy:</strong> {option.accuracy}</div>
                      <div><strong>Setup:</strong> {option.setup}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Test Tesseract.js (Unlimited)</h4>
          <div className="flex items-center gap-3">
            <Button 
              onClick={testTesseract} 
              disabled={isTestingTesseract}
              variant="outline"
            >
              {isTestingTesseract ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Tesseract...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Test Unlimited OCR
                </>
              )}
            </Button>
            
            {tesseractResult && (
              <span className="text-sm font-medium">{tesseractResult}</span>
            )}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Recommendation:</h4>
          <p className="text-sm text-muted-foreground">
            <strong>Tesseract.js:</strong> Already implemented, works in browser with unlimited use.
            Downloads once (~2MB), then works offline forever.
            <br/><br/>
            <strong>For Maximum Accuracy:</strong> PaddleOCR or EasyOCR can be added as Python services
            with 95%+ accuracy and zero API costs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}