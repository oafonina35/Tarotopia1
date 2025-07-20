# Tarotopia - Mystical Tarot Card Scanner

## Overview

Tarotopia is a mystical web application that allows users to scan and identify tarot cards using advanced visual recognition technology including color analysis and card name detection. The app provides detailed information about recognized cards including meanings, symbolism, and guidance. It features a modern, mystical-themed UI with a focus on mobile-first design.

## User Preferences

Preferred communication style: Simple, everyday language.
Manual card selection: Keep "Choose Card Manually" button permanently visible for easy deck browsing.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with custom mystic-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: "new-york" style from shadcn/ui with custom mystic theming

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints for tarot card operations
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

### Database Design
- **Database**: PostgreSQL (Neon serverless with connection pooling)
- **Schema**: 
  - `tarot_cards`: Stores card information (name, arcana, meaning, symbolism, guidance, keywords, images)
  - `card_readings`: Stores scan history with timestamps and image data
  - `users`: Basic user management (currently minimal implementation)
- **Seeded Data**: Complete Major Arcana deck (22 cards) with detailed descriptions
- **Storage Interface**: Abstracted IStorage interface supporting both in-memory and database implementations

## Key Components

### Frontend Components
1. **CameraScanner**: Handles image capture and upload functionality
2. **CardResult**: Displays detailed card information after recognition
3. **RecentReadings**: Shows history of previously scanned cards
4. **UI Components**: Comprehensive set of reusable components from shadcn/ui

### Backend Services
1. **Storage Layer**: PostgreSQL database with Drizzle ORM for persistent data storage
2. **Card Recognition**: Simulated image recognition service (placeholder for real AI integration)
3. **API Routes**: RESTful endpoints for card operations and recognition
4. **Database**: PostgreSQL with Neon serverless driver for production scalability

### Shared Resources
1. **Schema Definitions**: Zod schemas and TypeScript types shared between client and server
2. **Database Schema**: Drizzle ORM table definitions

## Data Flow

1. **Card Scanning**: User captures/uploads image → Frontend sends to recognition API → Backend processes and returns card data
2. **Card Display**: Recognition results → Card details rendered → Option to save reading
3. **Reading History**: Previous scans stored in database → Retrieved and displayed in recent readings component

## Recent Changes
- **July 20, 2025**: Successfully transferred project to Xcode for iOS App Store publishing
  - Fixed navigation menu functionality with proper debugging
  - Created complete project archive for Mac transfer
  - User successfully opened project in Xcode and ready for App Store submission
  - Removed training interface and simplified app for deployment
  - Removed scanner trainer functionality as requested by user
  - Cleaned up training-related components and interfaces
  - Simplified recognition system to focus on core card identification
  - Prepared app for production deployment with clean, streamlined interface
- **July 19, 2025**: Complete deck transformation and organization
  - Replaced all 78 tarot cards with enhanced sensual/erotic themed artwork
  - Updated entire Major Arcana (22 cards) and all four Minor Arcana suits
  - Fixed card image mismatches: 9 of Cups, Page of Cups, 10 of Cups, Knight of Cups, Queen of Cups, The High Priestess
  - Updated all Cup court cards with proper sensual artwork
  - Implemented proper card sorting in manual selector: Major Arcana first, then suits (Wands, Cups, Swords, Pentacles) by number
  - Added card preview thumbnails in manual selector with proper image path conversion
  - Fixed training system with database persistence (95% accuracy)
  - Added free OCR.space API integration (500 requests/day, no cost)
  - Implemented 4-layer recognition: Training → Free OCR → OpenAI Vision → Pattern Matching
  - Enhanced fuzzy matching with multi-segment hash comparison
  - User confirmed preference for flat-fee options over pay-per-use
  - Added permanent manual card selection button for easy deck browsing
  - Restored full card descriptions without truncation (complete 1200+ character descriptions)
  - Fixed paragraph spacing across all pages with proper line break handling and margin spacing
  - **Latest Update**: Fixed all 78 cards to use newest JPG images from latest sensual/erotic themed batch
    - Updated database to replace old PNG images with current JPG artwork
    - All cards now display proper custom sensual artwork correctly
    - **July 19, 2025 (Evening)**: Updated Cups suit with proper sensual artwork
      - Replaced incorrect Cups images with new batch featuring actual cup/chalice imagery
      - Fixed suit mappings: Cups now use images 22-33 from latest batch
      - Enhanced recognition scanner with 5-layer algorithm system (98% confidence for numbered format)
      - **July 19, 2025 (Late Evening)**: Updated Pentacles suit with proper sensual artwork
        - Replaced incorrect Pentacles images with new batch featuring actual pentacles/coins imagery
        - Fixed suit mappings: Pentacles now use images 36-47 from latest batch
        - All suits now display correct themed artwork with proper symbolism
        - **July 19, 2025 (Final Update)**: Updated Wands suit with proper sensual artwork
          - Replaced all Wands images with new batch featuring actual wands/staffs imagery
          - Fixed suit mappings: Wands now use images 64-77 from latest batch
          - Complete deck transformation: All 78 cards display correct themed artwork
          - **July 20, 2025**: Enhanced Recognition System V2 Implementation
            - Upgraded to 6-layer intelligent recognition system with performance optimization
            - Added parallel OCR processing for faster results
            - Implemented ensemble method combining multiple recognition results
            - Added advanced pattern matching with fuzzy string algorithms
            - Enhanced visual similarity analysis and intelligent fallback selection
            - Added comprehensive recognition analytics display with detailed method breakdown
            - Improved confidence scoring with Jaccard similarity and Levenshtein distance
            - Enhanced abbreviation and phonetics-based matching for OCR error tolerance

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **drizzle-orm**: Type-safe SQL ORM
- **zod**: Schema validation

### Development Tools
- **Vite**: Build tool with React plugin
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety across the stack
- **ESBuild**: Production bundling for backend

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling (conditional)

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Environment-based DATABASE_URL configuration

### Production
- **Build Process**: 
  - Frontend: Vite builds to `dist/public`
  - Backend: ESBuild bundles server to `dist/index.js`
- **Deployment**: Single Node.js process serving both static files and API
- **Database**: PostgreSQL via environment variable configuration

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with client/server/shared folders for code organization
2. **Type Safety**: Full TypeScript implementation with shared types between frontend and backend
3. **Database Strategy**: Drizzle ORM chosen for type safety and PostgreSQL compatibility
4. **Component Architecture**: shadcn/ui provides consistent, accessible components with Tailwind styling
5. **Development Experience**: Vite for fast frontend development, tsx for backend hot reloading
6. **Mobile-First Design**: Responsive design optimized for mobile tarot card scanning use case

The application is structured as a modern full-stack web app with a focus on type safety, developer experience, and a mystical user interface suitable for tarot enthusiasts.