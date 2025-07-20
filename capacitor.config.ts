import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tarotopia.app',
  appName: 'Tarotopia',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a0b2e",
      showSpinner: false,
      spinnerColor: "#7dd3fc"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#1a0b2e"
    },
    Camera: {
      permissions: {
        camera: "Camera access is required for tarot card scanning"
      }
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
