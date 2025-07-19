import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TarotCard, CardReading } from "@shared/schema";

type ScanningState = 'ready' | 'scanning' | 'processing' | 'result' | 'error';

interface CameraScannerProps {
  scanningState: ScanningState;
  setScanningState: (state: ScanningState) => void;
  onScanComplete: (card: TarotCard, reading: CardReading) => void;
  onScanError: (error: string) => void;
}

interface RecognitionResponse {
  card: TarotCard;
  reading: CardReading;
  confidence: number;
}

export default function CameraScanner({ 
  scanningState, 
  setScanningState, 
  onScanComplete, 
  onScanError 
}: CameraScannerProps) {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const recognizeCardMutation = useMutation({
    mutationFn: async (imageData: string): Promise<RecognitionResponse> => {
      const response = await apiRequest('POST', '/api/recognize-card', { imageData });
      return response.json();
    },
    onSuccess: (data) => {
      setScanningState('result');
      onScanComplete(data.card, data.reading);
      toast({
        title: "Card Recognized!",
        description: `Identified as "${data.card.name}" with ${Math.round(data.confidence * 100)}% confidence.`,
      });
    },
    onError: (error) => {
      setScanningState('error');
      onScanError(error.message);
      toast({
        title: "Recognition Failed",
        description: "Unable to identify the card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCamera = useCallback(async () => {
    try {
      setScanningState('scanning');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanningState('error');
      onScanError('Unable to access camera. Please check permissions.');
    }
  }, [setScanningState, onScanError]);

  const stopCamera = useCallback(() => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoStream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanningState('processing');
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Stop camera after capture
    stopCamera();
    
    // Send for recognition
    recognizeCardMutation.mutate(imageData);
  }, [setScanningState, stopCamera, recognizeCardMutation]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onScanError('Please select a valid image file.');
      return;
    }

    setScanningState('processing');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      recognizeCardMutation.mutate(imageData);
    };
    reader.onerror = () => {
      setScanningState('error');
      onScanError('Error reading the image file.');
    };
    reader.readAsDataURL(file);
  }, [setScanningState, onScanError, recognizeCardMutation]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isScanning = scanningState === 'scanning';
  const isProcessing = scanningState === 'processing';

  return (
    <div className="card-gradient rounded-2xl p-6 mb-6 border border-mystic-purple/30 backdrop-blur-sm">
      {/* Camera Preview Area */}
      <div className="relative mb-6">
        <div className="aspect-square bg-charcoal rounded-xl border-2 border-dashed border-mystic-gold/50 flex items-center justify-center overflow-hidden">
          
          {/* Video Stream */}
          {isScanning && (
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-xl"
              playsInline
              muted
            />
          )}
          
          {/* Placeholder */}
          {!isScanning && !isProcessing && (
            <div className="text-center p-4">
              <Camera className="w-16 h-16 text-mystic-gold/70 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Position your tarot card here</p>
              <p className="text-gray-500 text-xs mt-1">Make sure the entire card is visible</p>
            </div>
          )}
          
          {/* Processing State */}
          {isProcessing && (
            <div className="text-center p-4">
              <div className="w-16 h-16 border-4 border-mystic-gold/30 border-t-mystic-gold rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Processing image...</p>
              <p className="text-gray-500 text-xs mt-1">Analyzing card details</p>
            </div>
          )}
          
          {/* Scanning overlay corners */}
          {isScanning && (
            <>
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-mystic-gold animate-pulse"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-mystic-gold animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-mystic-gold animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-mystic-gold animate-pulse"></div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isScanning && (
          <Button 
            onClick={startCamera}
            className="w-full bg-mystic-gold text-rich-black font-semibold py-4 px-6 hover:bg-yellow-400 transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isProcessing}
          >
            <div className="flex items-center justify-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Scan Card</span>
            </div>
          </Button>
        )}
        
        {isScanning && (
          <div className="space-y-3">
            <Button 
              onClick={captureImage}
              className="w-full bg-mystic-gold text-rich-black font-semibold py-4 px-6 hover:bg-yellow-400 transition-all duration-300"
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Capture</span>
              </div>
            </Button>
            
            <Button 
              onClick={stopCamera}
              variant="outline"
              className="w-full border-2 border-mystic-purple text-gray-300 hover:border-mystic-gold hover:text-mystic-gold"
            >
              Cancel
            </Button>
          </div>
        )}
        
        {!isScanning && (
          <Button 
            onClick={handleUploadClick}
            variant="outline"
            className="w-full border-2 border-mystic-purple text-gray-300 font-medium py-3 px-6 hover:border-mystic-gold hover:text-mystic-gold transition-all duration-300"
            disabled={isProcessing}
          >
            <div className="flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
            </div>
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
