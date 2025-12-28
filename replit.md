# CampusRent - Campus Marketplace Application

## Overview

CampusRent is a campus marketplace application that allows students to buy, sell, and rent academic materials like books, notes, calculators, and lab equipment. The application consists of three main components:

1. **Web Application** - React-based SPA in the `client/` directory
2. **Mobile Application** - React Native/Expo app in the `mobile/` directory  
3. **Backend API** - Express.js server in the `server/` directory

The platform enables peer-to-peer transactions between students at Alliance University, featuring real-time chat, listing management, and rental tracking functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture (Web)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Build Tool**: Vite with custom plugins for Replit integration
- **Form Handling**: React Hook Form with Zod validation

### Frontend Architecture (Mobile)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (stack + bottom tabs)
- **State Management**: TanStack React Query (shared patterns with web)
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Definition**: Shared schema in `shared/schema.ts` using Drizzle and Zod
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with typed contracts
- **File Uploads**: Multer for handling image/PDF/video uploads
- **CORS**: Enabled for mobile app cross-origin requests

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - contains users, listings, chats, messages, and rental returns tables
- **Migrations**: Managed via `drizzle-kit push`
- **Validation**: Zod schemas derived from Drizzle schemas using `drizzle-zod`

### Key Design Patterns
- **Shared Types**: The `shared/` directory contains schema and route definitions used by both frontend and backend
- **Type-Safe API**: Route contracts in `shared/routes.ts` define input/output types with Zod
- **MVP Authentication**: Simplified auth using a default hardcoded user (id: 1) - no login required
- **File Storage**: Local filesystem storage in `uploads/` directory

### Build & Deployment
- **Development**: `npm run dev` runs the full-stack app with Vite dev server
- **Production Build**: Custom build script bundles server with esbuild and client with Vite
- **Target Platform**: Render.com for backend deployment (free tier compatible)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database queries and schema management

### Third-Party Services
- **Render.com**: Recommended hosting platform for backend deployment
- **Expo/EAS**: Mobile app build and distribution services

### Key npm Packages
- **Frontend**: React, TanStack Query, Wouter, Tailwind CSS, Radix UI, React Hook Form, Zod
- **Backend**: Express, Drizzle ORM, pg (node-postgres), Multer, CORS
- **Shared**: Zod for validation, Drizzle-Zod for schema derivation
- **PDF Rendering**: pdfjs-dist for client-side PDF viewing

### File Upload Support
- Images (multiple per listing, 1-5)
- PDFs (for notes with configurable preview limits)
- Videos

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)