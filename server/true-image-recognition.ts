import { createCanvas, loadImage } from 'canvas';
import type { TarotCard } from "@shared/schema";
import path from 'path';
import fs from 'fs';

interface ImageFeatures {
  histogram: number[];
  edges: number[];
  corners: number[];
}

class TarotImageRecognizer {
  private referenceFeatures: Map<number, ImageFeatures> = new Map();
  private initialized = false;

  async initialize(cards: TarotCard[]) {
    if (this.initialized) return;
    
    console.log('Initializing image recognition with reference cards...');
    
    for (const card of cards) {
      try {
        const imagePath = path.join(process.cwd(), 'attached_assets', card.image);
        if (fs.existsSync(imagePath)) {
          const features = await this.extractFeatures(imagePath);
          this.referenceFeatures.set(card.id, features);
        }
      } catch (error) {
        console.warn(`Failed to process reference image for ${card.name}:`, error);
      }
    }
    
    this.initialized = true;
    console.log(`Initialized with ${this.referenceFeatures.size} reference images`);
  }

  async recognizeCard(imageData: string, cards: TarotCard[]): Promise<TarotCard | null> {
    await this.initialize(cards);
    
    try {
      const scannedFeatures = await this.extractFeaturesFromBase64(imageData);
      let bestMatch: { card: TarotCard; similarity: number } | null = null;

      for (const card of cards) {
        const refFeatures = this.referenceFeatures.get(card.id);
        if (!refFeatures) continue;

        const similarity = this.calculateSimilarity(scannedFeatures, refFeatures);
        
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { card, similarity };
        }
      }

      // Only return match if similarity is above threshold
      if (bestMatch && bestMatch.similarity > 0.6) {
        console.log(`Recognized ${bestMatch.card.name} with ${(bestMatch.similarity * 100).toFixed(1)}% similarity`);
        return bestMatch.card;
      }

      return null;
    } catch (error) {
      console.error('Image recognition error:', error);
      return null;
    }
  }

  private async extractFeaturesFromBase64(base64Data: string): Promise<ImageFeatures> {
    // Remove data URL prefix if present
    const imageData = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(imageData, 'base64');
    
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    
    const img = await loadImage(buffer);
    ctx.drawImage(img, 0, 0, 200, 200);
    
    return this.extractFeaturesFromCanvas(canvas);
  }

  private async extractFeatures(imagePath: string): Promise<ImageFeatures> {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    
    const img = await loadImage(imagePath);
    ctx.drawImage(img, 0, 0, 200, 200);
    
    return this.extractFeaturesFromCanvas(canvas);
  }

  private extractFeaturesFromCanvas(canvas: any): ImageFeatures {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Extract color histogram (simplified to RGB channels)
    const histogram = new Array(768).fill(0); // 256 * 3 channels
    
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.floor(data[i] / 4) * 4;     // Reduce to 64 bins per channel
      const g = Math.floor(data[i + 1] / 4) * 4;
      const b = Math.floor(data[i + 2] / 4) * 4;
      
      histogram[r]++;
      histogram[256 + g]++;
      histogram[512 + b]++;
    }

    // Simple edge detection (Sobel-like)
    const edges = this.detectEdges(data, canvas.width, canvas.height);
    
    // Corner detection (simplified Harris corner detection)
    const corners = this.detectCorners(data, canvas.width, canvas.height);

    return { histogram, edges, corners };
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number): number[] {
    const edges: number[] = [];
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            
            gx += gray * sobelX[(ky + 1) * 3 + (kx + 1)];
            gy += gray * sobelY[(ky + 1) * 3 + (kx + 1)];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        if (magnitude > 50) edges.push(magnitude);
      }
    }
    
    return edges.slice(0, 100); // Keep top 100 edge points
  }

  private detectCorners(data: Uint8ClampedArray, width: number, height: number): number[] {
    const corners: number[] = [];
    
    // Simplified corner detection
    for (let y = 2; y < height - 2; y += 4) {
      for (let x = 2; x < width - 2; x += 4) {
        const centerIdx = (y * width + x) * 4;
        const centerGray = (data[centerIdx] + data[centerIdx + 1] + data[centerIdx + 2]) / 3;
        
        let variance = 0;
        let count = 0;
        
        // Check surrounding pixels
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            variance += Math.pow(gray - centerGray, 2);
            count++;
          }
        }
        
        variance /= count;
        if (variance > 1000) {
          corners.push(variance);
        }
      }
    }
    
    return corners.slice(0, 50); // Keep top 50 corner points
  }

  private calculateSimilarity(features1: ImageFeatures, features2: ImageFeatures): number {
    const histSim = this.compareHistograms(features1.histogram, features2.histogram);
    const edgeSim = this.compareArrays(features1.edges, features2.edges);
    const cornerSim = this.compareArrays(features1.corners, features2.corners);
    
    // Weighted combination
    return (histSim * 0.5) + (edgeSim * 0.3) + (cornerSim * 0.2);
  }

  private compareHistograms(hist1: number[], hist2: number[]): number {
    const minLength = Math.min(hist1.length, hist2.length);
    let intersection = 0;
    let union = 0;
    
    for (let i = 0; i < minLength; i++) {
      intersection += Math.min(hist1[i], hist2[i]);
      union += Math.max(hist1[i], hist2[i]);
    }
    
    return union > 0 ? intersection / union : 0;
  }

  private compareArrays(arr1: number[], arr2: number[]): number {
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const minLength = Math.min(arr1.length, arr2.length);
    let similarity = 0;
    
    for (let i = 0; i < minLength; i++) {
      const diff = Math.abs(arr1[i] - arr2[i]);
      const max = Math.max(arr1[i], arr2[i]);
      similarity += max > 0 ? (1 - diff / max) : 1;
    }
    
    return similarity / minLength;
  }
}

export const imageRecognizer = new TarotImageRecognizer();