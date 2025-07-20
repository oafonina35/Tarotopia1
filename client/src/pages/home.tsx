import { useState } from "react";
import CameraScanner from "@/components/camera-scanner";
import CardResult from "@/components/card-result";
import RecentReadings from "@/components/recent-readings";
import ManualCardSelector from "@/components/manual-card-selector";
import NavigationMenu from "@/components/navigation-menu";
import { Button } from "@/components/ui/button";
import { Star, BookOpen } from "lucide-react";
import type { TarotCard, CardReading } from "@shared/schema";
import tarotopiaLogo from "@assets/Tarotopia-01_1752963540547.png";

type ScanningState = 'ready' | 'scanning' | 'processing' | 'result' | 'error';

export default function Home() {
  const [scanningState, setScanningState] = useState<ScanningState>('ready');
  const [recognizedCard, setRecognizedCard] = useState<TarotCard | null>(null);
  const [currentReading, setCurrentReading] = useState<CardReading | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showManualSelector, setShowManualSelector] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    imageData: string;
    confidence: number;
    method: string;
    extractedText?: string;
  } | null>(null);

  const handleScanComplete = (card: TarotCard, reading: CardReading, scanData?: {
    imageData: string;
    confidence: number;
    method: string;
    extractedText?: string;
  }) => {
    setRecognizedCard(card);
    setCurrentReading(reading);
    if (scanData) {
      setScanResult(scanData);
    }
    setScanningState('result');
  };

  const handleScanError = (error: string) => {
    setErrorMessage(error);
    setScanningState('error');
  };

  const handleScanAnother = () => {
    setRecognizedCard(null);
    setCurrentReading(null);
    setErrorMessage('');
    setShowManualSelector(false);
    setScanResult(null);
    setScanningState('ready');
  };

  const handleTryAgain = () => {
    setErrorMessage('');
    setScanningState('ready');
  };

  const handleManualCardSelected = (card: TarotCard, reading: CardReading) => {
    setRecognizedCard(card);
    setCurrentReading(reading);
    setShowManualSelector(false);
    setScanningState('result');
  };

  return (
    <div className="min-h-screen ethereal-gradient">
      {/* Header */}
      <header className="relative z-10 px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            {/* Navigation Menu */}
            <NavigationMenu />
            {/* Centered Logo */}
            <div className="flex-1 flex justify-center -ml-8">
              <img 
                src={tarotopiaLogo} 
                alt="Tarotopia Logo" 
                className="w-36 h-36 object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-8">
        <div className="max-w-md mx-auto">
          
          {/* Welcome Section */}
          {scanningState === 'ready' && (
            <div className="text-center mb-8 -mt-4">
              <h2 className="text-2xl font-serif font-bold mb-2" style={{ color: 'hsl(180, 45%, 35%)' }}>Discover Your Path</h2>
              <p className="text-sm text-foreground mb-6 max-w-64 mx-auto">Scan your tarot card to reveal its mystical meanings and guidance</p>
            </div>
          )}

          {/* Browse Deck Button - Always Visible */}
          {!showManualSelector && (
            <div className="text-center mb-6">
              <Button
                onClick={() => setShowManualSelector(true)}
                variant="outline"
                className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Choose Card Manually
              </Button>
            </div>
          )}

          {/* Manual Card Selector */}
          {showManualSelector && (
            <ManualCardSelector
              onCardSelected={handleManualCardSelected}
              onClose={() => setShowManualSelector(false)}
            />
          )}

          {/* Scanning Interface */}
          {!showManualSelector && scanningState !== 'result' && (
            <CameraScanner
              scanningState={scanningState}
              setScanningState={setScanningState}
              onScanComplete={handleScanComplete}
              onScanError={handleScanError}
            />
          )}

          {/* Card Result */}
          {scanningState === 'result' && recognizedCard && (
            <>
              <CardResult
                card={recognizedCard}
                reading={currentReading}
                onScanAnother={handleScanAnother}
                scanData={scanResult}
              />
              
              {/* Training Interface Removed */}
            </>
          )}

          {/* Error State */}
          {scanningState === 'error' && (
            <div className="card-gradient rounded-2xl p-6 border border-red-500/30 backdrop-blur-sm mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-serif font-semibold text-red-400 mb-2">Card Not Recognized</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {errorMessage || "We couldn't identify this tarot card. Please ensure the entire card is visible and well-lit."}
                </p>
                <Button 
                  onClick={handleTryAgain}
                  className="bg-mystic-gold text-rich-black font-medium hover:bg-yellow-400"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Recent Readings */}
          {scanningState === 'ready' && <RecentReadings />}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-6 border-t border-mystic-purple/20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <button className="hover:text-mystic-gold transition-colors duration-200">About</button>
            <button className="hover:text-mystic-gold transition-colors duration-200">Settings</button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            &copy; 2024 Tarotopia. Embrace the journey.
          </p>
        </div>
      </footer>

      {/* Recognition Options Modal Removed */}
    </div>
  );
}
