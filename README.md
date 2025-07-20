# Tarotopia - Mystical Tarot Card Scanner

> An advanced AI-powered tarot card recognition mobile application that provides intuitive digital tarot readings with seamless user experience and intelligent card detection.

## 🌟 Features

- **Smart Card Recognition** - Upload or capture tarot card images for instant identification
- **Complete Tarot Deck** - All 78 cards with detailed meanings, symbolism, and guidance
- **Mystical UI** - Beautiful, mobile-first design with mystical theming
- **Reading History** - Save and revisit your past card readings
- **Manual Card Selection** - Browse and select cards directly from the complete deck
- **Daily Card Draw** - Get daily guidance with random card selection

## 🛠 Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Mobile**: Capacitor for iOS/Android
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Recognition**: Multi-layer AI recognition system

## 📱 iOS Development

This project is optimized for iOS App Store deployment:

### Requirements
- Xcode 14.0+
- iOS 13.0+
- Node.js 18+
- Capacitor CLI

### iOS Build Process
```bash
# Install dependencies
npm install

# Build web assets
npm run build

# Sync with iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### iOS Project Structure
- `ios/App/App.xcworkspace` - Main Xcode workspace
- `capacitor.config.ts` - Capacitor configuration
- App ID: `com.tarotopia.app`
- Bundle Name: `Tarotopia`

## 🚀 Development

### Prerequisites
```bash
npm install
```

### Environment Setup
Create `.env` file with:
```
DATABASE_URL=your_postgresql_url
OPENAI_API_KEY=your_openai_key
```

### Development Server
```bash
npm run dev
```

### Database Setup
```bash
npm run db:push
```

## 📁 Project Structure

```
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types & schemas
├── ios/             # iOS/Xcode project
├── attached_assets/ # Card images & assets
└── capacitor.config.ts
```

## 🎯 Key Components

- **CameraScanner** - Image capture and upload
- **CardResult** - Card details and meanings
- **ManualCardSelector** - Deck browser
- **NavigationMenu** - App navigation
- **RecentReadings** - History tracking

## 📊 Recognition System

Multi-layer recognition with:
- Training data matching
- OCR text extraction
- OpenAI Vision API
- Pattern matching algorithms
- Fuzzy string comparison

## 🔧 Configuration

### Capacitor Configuration
- App ID: `com.tarotopia.app`
- Web directory: `dist/public`
- iOS content inset: automatic
- Camera permissions enabled
- Custom splash screen and status bar

### Database Schema
- `tarot_cards` - Complete card information
- `card_readings` - Scan history
- `users` - User management

## 🚀 Deployment

### Web Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### iOS App Store
1. Open `ios/App/App.xcworkspace` in Xcode
2. Configure signing & capabilities
3. Build for release
4. Submit to App Store Connect

## 📝 License

Private project - All rights reserved

## 🏆 Status

✅ Complete tarot deck (78 cards)
✅ Advanced recognition system  
✅ Mobile-optimized UI
✅ iOS-ready build
✅ Database integration
✅ Production deployment ready

---

*Built with ❤️ for tarot enthusiasts*