import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Eye, Zap, Layers, CheckCircle, AlertCircle } from "lucide-react";

interface RecognitionDetailsProps {
  confidence: number;
  method: string;
  isLearned: boolean;
  extractedText?: string;
  fallbackResults?: Array<{
    method: string;
    card?: any;
    confidence: number;
    extractedText?: string;
  }>;
}

export default function RecognitionDetails({
  confidence,
  method,
  isLearned,
  extractedText,
  fallbackResults = []
}: RecognitionDetailsProps) {
  
  const getMethodIcon = (methodName: string) => {
    if (methodName.includes('training')) return <Brain className="w-4 h-4" />;
    if (methodName.includes('vision') || methodName.includes('ocr')) return <Eye className="w-4 h-4" />;
    if (methodName.includes('pattern') || methodName.includes('ensemble')) return <Layers className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getMethodColor = (methodName: string) => {
    if (methodName.includes('training')) return 'bg-emerald-500';
    if (methodName.includes('tesseract')) return 'bg-blue-500';
    if (methodName.includes('free-ocr')) return 'bg-cyan-500';
    if (methodName.includes('openai')) return 'bg-purple-500';
    if (methodName.includes('ensemble')) return 'bg-orange-500';
    if (methodName.includes('pattern')) return 'bg-slate-500';
    return 'bg-gray-500';
  };

  const getMethodDisplayName = (methodName: string) => {
    const names: Record<string, string> = {
      'training-database': 'Learned Recognition',
      'tesseract': 'Tesseract OCR',
      'free-ocr': 'Free OCR',
      'openai-vision': 'AI Vision',
      'ensemble': 'Ensemble Method',
      'advanced-pattern': 'Advanced Pattern',
      'visual-similarity': 'Visual Similarity',
      'pattern-based': 'Pattern Matching',
      'fallback-tesseract': 'Fallback: Tesseract',
      'fallback-free-ocr': 'Fallback: Free OCR'
    };
    return names[methodName] || methodName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const confidenceColor = confidence >= 0.8 ? 'text-emerald-600' : 
                         confidence >= 0.6 ? 'text-orange-600' : 'text-red-600';
  
  const confidenceLabel = confidence >= 0.9 ? 'Excellent' :
                         confidence >= 0.8 ? 'Very High' :
                         confidence >= 0.7 ? 'High' :
                         confidence >= 0.6 ? 'Good' :
                         confidence >= 0.5 ? 'Moderate' : 'Low';

  return (
    <Card className="mt-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isLearned ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-500" />
          )}
          Recognition Analysis
          {isLearned && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Learned
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Recognition Method */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getMethodColor(method)} text-white`}>
              {getMethodIcon(method)}
            </div>
            <div>
              <div className="font-medium">{getMethodDisplayName(method)}</div>
              <div className="text-sm text-muted-foreground">Primary method used</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${confidenceColor}`}>
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">{confidenceLabel}</div>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confidence Level</span>
            <span className={confidenceColor}>{Math.round(confidence * 100)}%</span>
          </div>
          <Progress 
            value={confidence * 100} 
            className="h-2"
          />
        </div>

        {/* Extracted Text */}
        {extractedText && extractedText !== 'No text found' && (
          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Detected Text
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border text-sm font-mono">
              "{extractedText}"
            </div>
          </div>
        )}

        {/* Recognition Layers Attempted */}
        {fallbackResults.length > 0 && (
          <div className="space-y-3">
            <div className="font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Recognition Layers
            </div>
            <div className="space-y-2">
              {fallbackResults.slice(0, 4).map((result, index) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getMethodColor(result.method)}`} />
                    <span className="text-sm">{getMethodDisplayName(result.method)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.card && (
                      <span className="text-xs text-muted-foreground">{result.card.name}</span>
                    )}
                    <span className="text-sm font-medium">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recognition Quality Badge */}
        <div className="flex justify-center pt-2">
          {confidence >= 0.9 ? (
            <Badge className="bg-emerald-500 text-white">
              🎯 Excellent Recognition
            </Badge>
          ) : confidence >= 0.7 ? (
            <Badge className="bg-blue-500 text-white">
              ✅ High Quality Match
            </Badge>
          ) : confidence >= 0.5 ? (
            <Badge className="bg-orange-500 text-white">
              ⚡ Good Recognition
            </Badge>
          ) : (
            <Badge className="bg-slate-500 text-white">
              🔍 Pattern Based Match
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}