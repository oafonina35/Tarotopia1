# Manual Tarotopia iOS Setup Guide

## Problem: Archive Extraction Failed
The tar.gz file didn't extract properly on your Mac. Let's set up manually.

## Step 1: Create Project Structure
In Terminal on your Mac:

```bash
# Create project folder
mkdir tarotopia-ios
cd tarotopia-ios

# Create essential folders
mkdir -p ios/App/App
mkdir -p client/src
mkdir -p server
mkdir -p shared
mkdir -p attached_assets
```

## Step 2: Essential Files to Copy from Replit

### A. package.json (Create this file first)
```json
{
  "name": "tarotopia",
  "version": "1.0.0",
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "@capacitor/camera": "^6.0.1",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/ios": "^6.0.0",
    "@capacitor/filesystem": "^6.0.1",
    "@capacitor/splash-screen": "^6.0.1",
    "@capacitor/status-bar": "^6.0.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### B. capacitor.config.ts (Create this file)
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tarotopia.app',
  appName: 'Tarotopia',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a0b2e",
      showSpinner: false
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
```

## Step 3: Quick Setup Commands
```bash
# Install dependencies
npm install

# Add Capacitor platforms
npx cap add ios

# Create a basic build
mkdir -p dist
echo '<html><body><h1>Tarotopia Loading...</h1></body></html>' > dist/index.html

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## Step 4: Alternative - Get Files Individually

Instead of the archive, copy these essential files from Replit one by one:

### Critical Files (Priority Order):
1. **ios/App/App.xcodeproj** - The actual Xcode project
2. **attached_assets/** - All 78 tarot card JPG images  
3. **client/src/** - Your React app source code
4. **capacitor.config.ts** - iOS configuration
5. **package.json** - Dependencies list

### Copy Process:
1. Go to your Replit share link in browser
2. Navigate to each folder
3. Copy file contents
4. Create matching files on Mac
5. Paste contents

## Step 5: Verify Setup
After setup, you should have:
```
tarotopia-ios/
├── ios/App/App.xcodeproj ← Xcode project
├── attached_assets/ ← 78 tarot images
├── client/ ← React app
├── capacitor.config.ts ← Bundle ID: com.tarotopia.app
└── package.json ← Dependencies
```

## Step 6: Build and Test
```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

This should open the correct Capacitor project in Xcode, not a SwiftUI template.