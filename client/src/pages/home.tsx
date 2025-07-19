import { useState } from "react";
import CameraScanner from "@/components/camera-scanner";
import CardResult from "@/components/card-result";
import RecentReadings from "@/components/recent-readings";
import ManualCardSelector from "@/components/manual-card-selector";
import { Button } from "@/components/ui/button";
import { Star, Menu, BookOpen } from "lucide-react";
import type { TarotCard, CardReading } from "@shared/schema";

type ScanningState = 'ready' | 'scanning' | 'processing' | 'result' | 'error';

export default function Home() {
  const [scanningState, setScanningState] = useState<ScanningState>('ready');
  const [recognizedCard, setRecognizedCard] = useState<TarotCard | null>(null);
  const [currentReading, setCurrentReading] = useState<CardReading | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showManualSelector, setShowManualSelector] = useState<boolean>(false);

  const handleScanComplete = (card: TarotCard, reading: CardReading) => {
    setRecognizedCard(card);
    setCurrentReading(reading);
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
    <div className="min-h-screen cosmic-gradient">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-mystic-gold rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-rich-black" fill="currentColor" />
            </div>
            <h1 className="text-xl font-serif font-semibold text-mystic-gold">Mystic Scanner</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-100 hover:bg-charcoal/50">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-8">
        <div className="max-w-md mx-auto">
          
          {/* Welcome Section */}
          {scanningState === 'ready' && (
            <div className="text-center mb-8">
              <div 
                className="relative mb-6 h-32 rounded-2xl overflow-hidden"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-rich-black via-mystic-purple/50 to-transparent"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <h2 className="text-2xl font-serif font-bold text-mystic-gold mb-2">Discover Your Path</h2>
                  <p className="text-sm text-gray-300 max-w-64">Scan any tarot card to reveal its mystical meanings and guidance</p>
                </div>
              </div>
            </div>
          )}

          {/* Browse Deck Button */}
          {scanningState === 'ready' && !showManualSelector && (
            <div className="text-center mb-6">
              <Button
                onClick={() => setShowManualSelector(true)}
                variant="outline"
                className="border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Your Custom Deck
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
          {!showManualSelector && (
            <CameraScanner
              scanningState={scanningState}
              setScanningState={setScanningState}
              onScanComplete={handleScanComplete}
              onScanError={handleScanError}
            />
          )}

          {/* Card Result */}
          {scanningState === 'result' && recognizedCard && (
            <CardResult
              card={recognizedCard}
              reading={currentReading}
              onScanAnother={handleScanAnother}
            />
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
            <button className="hover:text-mystic-gold transition-colors duration-200">Help</button>
            <button className="hover:text-mystic-gold transition-colors duration-200">Settings</button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            &copy; 2024 Mystic Scanner. Embrace the journey.
          </p>
        </div>
      </footer>
    </div>
  );
}
