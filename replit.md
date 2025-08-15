# Connected Civics - Bilingual Civic Engagement Platform

## Overview

Connected Civics is a modern, full-stack web application designed to enhance civic engagement by making government information more accessible and understandable. The platform allows users to track legislation, understand complex bills through AI assistance, access curated news, and engage with their representatives. The application is built with bilingual support (English and Spanish) and focuses on making democracy more accessible to all citizens.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Internationalization**: Custom i18n implementation with React hooks for English/Spanish bilingual support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API with structured route handlers and middleware
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Logging**: Custom request/response logging middleware for API monitoring

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database for structured data
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Comprehensive schema design covering users, bills, legislators, news articles, bookmarks, chat sessions, and civic events
- **Connection**: Neon Database serverless PostgreSQL for cloud-hosted database

### Database Schema Design
The schema includes several key entities:
- **Users**: Authentication, preferences, and location data
- **Bills**: Comprehensive bill tracking with progress, voting history, and multilingual summaries
- **Legislators**: Representative information with district mapping
- **News Articles**: Curated civic news with categorization
- **Bookmarks**: User-saved content for tracking
- **Chat Sessions**: AI chatbot conversation history
- **Civic Events**: Town halls, hearings, community forums with full event details, capacity limits, and scheduling
- **Event RSVPs**: Registration management with attendee information, accessibility needs, and multilingual preferences

### Authentication and Authorization
- Session-based authentication system
- User preference management including language settings
- Location-based content filtering and personalization

### AI Integration Architecture
- **OpenAI Integration**: GPT-4 for bill summarization, translation, and conversational AI
- **Chatbot Service**: "Civica" AI assistant for explaining legislation and civic processes
- **Translation Services**: Automated translation for bilingual content delivery
- **Content Generation**: AI-powered email templates and civic engagement tools

### External API Integrations
- **GovTrack API**: Federal legislation data and bill tracking
- **News APIs**: Multiple news sources for civic news aggregation
- **Geolocation Services**: Location detection for jurisdiction-specific content
- **Translation APIs**: Backup translation services for content localization

### Development and Build Architecture
- **Build Tool**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement and development server integration
- **Production**: Optimized bundling with code splitting and asset optimization
- **TypeScript**: Strict type checking across frontend, backend, and shared types

### Deployment and Infrastructure
- **Static Assets**: Frontend built for static deployment (GitHub Pages ready)
- **Server Deployment**: Express server with production-ready configuration
- **Environment**: Environment-based configuration for different deployment stages
- **Monitoring**: Request logging and error tracking for production monitoring

### Performance Optimizations
- **Caching**: TanStack Query for intelligent data caching and background updates
- **Code Splitting**: Vite-based code splitting for optimal loading performance
- **Image Optimization**: Responsive images and lazy loading strategies
- **Database**: Efficient queries with proper indexing through Drizzle ORM

## Recent Major Updates

### Town Halls & Events Feature (August 2025)
- **Complete Civic Events System**: Full-stack implementation of town hall meetings, community forums, and public hearings
- **Real TX-23 Data**: Authentic event information from Congressman Tony Gonzales, Senator Pete Flores, and local officials
- **RSVP Management**: Complete registration system with capacity tracking and bilingual support
- **Event Filtering**: Filter by federal, state, and local government levels
- **Database Integration**: PostgreSQL schema for events and RSVPs with proper relations
- **Accessibility Features**: ADA compliance information, Spanish interpretation details, and accommodation requests

## External Dependencies

### Core Framework Dependencies
- **React & TypeScript**: Modern frontend development with type safety
- **Express.js**: Backend web framework for API development
- **Drizzle ORM**: Type-safe database operations and schema management
- **TanStack Query**: Server state management and caching solution

### UI and Styling Dependencies
- **Shadcn/ui Components**: Pre-built accessible UI components
- **Radix UI**: Headless UI primitives for accessibility compliance
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### External Service Integrations
- **OpenAI API**: GPT-4 for AI-powered features including summarization and translation
- **News API**: Civic news aggregation from multiple sources
- **GovTrack API**: Federal legislation and bill tracking data
- **Neon Database**: Serverless PostgreSQL hosting

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing
- **TypeScript Compiler**: Type checking and compilation
- **ESBuild**: Fast JavaScript bundling for production

### Database and Storage
- **PostgreSQL**: Primary database for structured data storage
- **Drizzle Kit**: Database migration and schema management tools
- **Connect PG Simple**: PostgreSQL session store for authentication

### Utility Libraries
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Component variant management
- **CLSX**: Conditional CSS class management
- **Zod**: Runtime type validation and schema definition