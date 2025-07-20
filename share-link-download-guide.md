# Tarotopia iOS - Share Link Download Guide

## Your Project Share Link
Use this link to access your project from your Mac: `https://replit.com/@afina238/Tarotopia`

## Step-by-Step Download Process

### Step 1: Access on Mac
1. Open your Mac browser
2. Go to: `https://replit.com/@afina238/Tarotopia`
3. You'll see the full project structure

### Step 2: Download Priority Files (In Order)

#### A. iOS Project (MOST CRITICAL)
Navigate to `ios/App/` folder:
- Right-click on `App.xcodeproj` → Download
- Download entire `App/` subfolder contents
- These are your native iOS project files

#### B. Essential Configuration Files
Download these root files:
- `capacitor.config.ts` - iOS app configuration
- `package.json` - Dependencies list
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Build configuration

#### C. Tarot Card Images
Navigate to `attached_assets/` folder:
- Download all JPG files (your 78 tarot cards)
- These are essential for the app functionality

#### D. React App Source
Navigate to `client/src/` folder:
- Download all source files and subfolders
- This is your React frontend code

#### E. Backend Code
Navigate to `server/` folder:
- Download all TypeScript server files
- This is your API backend

### Step 3: Recreate Project Structure on Mac

Create this folder structure:
```
tarotopia-ios/
├── ios/
│   └── App/
│       ├── App.xcodeproj/
│       └── App/
├── client/
│   └── src/
├── server/
├── attached_assets/
├── capacitor.config.ts
├── package.json
└── tsconfig.json
```

### Step 4: Quick Setup Commands
```bash
cd tarotopia-ios

# Install dependencies
npm install

# Install Capacitor iOS
npx cap add ios

# Build project
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## Alternative: Bulk Download Method

### Option A: Browser Download All
Some browsers allow you to:
1. Right-click on root folder
2. Select "Download" or "Save As"
3. Download entire project as ZIP

### Option B: Individual File Method
For each essential file:
1. Click on file in Replit interface
2. Copy all content (Cmd+A, Cmd+C)
3. Create matching file on Mac
4. Paste content and save

## Verification Checklist

After download, verify you have:
- ✅ `ios/App/App.xcodeproj` (Xcode project)
- ✅ `capacitor.config.ts` (Bundle ID: com.tarotopia.app)
- ✅ `attached_assets/` with 78 JPG files
- ✅ `client/src/` with React components
- ✅ `package.json` with Capacitor dependencies

## Troubleshooting

### If Xcode Still Opens Wrong Project:
Make sure you're opening `ios/App/App.xcodeproj`, not creating a new project.

### If Files Don't Download:
Try the copy-paste method for essential configuration files.

### If Build Fails:
Ensure all dependencies are installed with `npm install` before building.

## What You Should See in Xcode
When correctly opened:
- Project name: "App"
- Bundle Identifier: com.tarotopia.app
- Files: AppDelegate.swift, not ContentView.swift
- Public folder with your React build files

Your Tarotopia app should launch in the iOS simulator with the mystical teal-rose interface and full tarot card functionality.