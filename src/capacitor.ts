// Capacitor integration for native iOS functionality
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export class CapacitorService {
  static async initializeApp() {
    // Hide splash screen
    await SplashScreen.hide();
    
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1a0b2e' });
  }

  static async takePicture(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Failed to capture image');
    }
  }

  static async selectFromGallery(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Gallery error:', error);
      throw new Error('Failed to select image');
    }
  }

  static async saveReading(reading: any): Promise<void> {
    try {
      const fileName = `reading_${Date.now()}.json`;
      await Filesystem.writeFile({
        path: fileName,
        data: JSON.stringify(reading),
        directory: Directory.Documents,
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  }
}