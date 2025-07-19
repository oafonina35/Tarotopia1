# Mystic Scanner - Tarot Card Recognition App

## Overview

Mystic Scanner is a web application that allows users to scan and identify tarot cards using image recognition technology. The app provides detailed information about recognized cards including meanings, symbolism, and guidance. It features a modern, mystical-themed UI with a focus on mobile-first design.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: 
  - `tarot_cards`: Stores card information (name, arcana, meaning, symbolism, guidance)
  - `card_readings`: Stores scan history with timestamps and image data
  - `users`: Basic user management (currently minimal implementation)

## Key Components

### Frontend Components
1. **CameraScanner**: Handles image capture and upload functionality
2. **CardResult**: Displays detailed card information after recognition
3. **RecentReadings**: Shows history of previously scanned cards
4. **UI Components**: Comprehensive set of reusable components from shadcn/ui

### Backend Services
1. **Storage Layer**: Abstracted storage interface with in-memory implementation for development
2. **Card Recognition**: Simulated image recognition service (placeholder for real AI integration)
3. **API Routes**: RESTful endpoints for card operations and recognition

### Shared Resources
1. **Schema Definitions**: Zod schemas and TypeScript types shared between client and server
2. **Database Schema**: Drizzle ORM table definitions

## Data Flow

1. **Card Scanning**: User captures/uploads image → Frontend sends to recognition API → Backend processes and returns card data
2. **Card Display**: Recognition results → Card details rendered → Option to save reading
3. **Reading History**: Previous scans stored in database → Retrieved and displayed in recent readings component

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