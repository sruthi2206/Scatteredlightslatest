# Scattered Lights - AI-Powered Inner Healing Platform

## Overview

Scattered Lights is a full-stack web application focused on emotional healing, chakra assessment, and spiritual growth through AI-powered coaching and journaling. The platform combines modern web technologies with spiritual wellness concepts to provide personalized healing experiences.

## Recent Changes (January 18, 2025)

✓ Successfully migrated from Replit Agent to standard Replit environment
✓ Updated database connection from Neon to external PostgreSQL server
✓ Fixed React hook errors and component imports
✓ Verified all API keys are working (OpenAI, Stripe)
✓ Database schema successfully deployed to production PostgreSQL
✓ Application builds and runs without errors
✓ Production preview URL works perfectly: https://b4e1e631-e520-48e3-9731-81078ea79eaf.kirk.prod.repl.run/
✓ Migrated from SendGrid to SMTP-based email service using Nodemailer
✓ Implemented secure password reset flow with email tokens
✓ Added welcome emails for new user registrations
❌ Email service configured with user's SMTP server (email.storyweb.in:587) - connection timeout from Replit infrastructure
📝 SMTP Issue: Server responds normally but authentication times out - likely IP restrictions or firewall blocking Replit

**Note**: Development mode shows React context errors due to Vite hot-reload conflicts, but production build works flawlessly. Use production preview for testing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

This is a monorepo structure with a **client-server separation** using:
- **Frontend**: React with TypeScript, using Wouter for routing
- **Backend**: Express.js with TypeScript 
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite for frontend bundling
- **Styling**: Tailwind CSS with Radix UI components

### Directory Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript schemas and types
├── migrations/      # Database migration files
└── attached_assets/ # Documentation and reference files
```

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Wouter** for lightweight client-side routing instead of React Router
- **Radix UI** components for accessible, customizable UI primitives
- **Framer Motion** for smooth animations and transitions
- **TanStack Query** for server state management and caching
- **ShadCN/UI** design system built on top of Radix UI
- **Tailwind CSS** for utility-first styling

### Backend Architecture
- **Express.js** server with TypeScript
- **Passport.js** for authentication (Local and Google OAuth strategies)
- **Session-based authentication** with PostgreSQL session store
- **RESTful API** design with comprehensive route handlers
- **File upload handling** with Multer for media management

### Database Design
- **PostgreSQL** as the primary database (migrated from Neon to custom PostgreSQL server)
- **Drizzle ORM** for type-safe database operations and migrations
- **Custom PostgreSQL server** at 217.76.58.143:5432
- Comprehensive schema covering users, chakra profiles, journal entries, emotion tracking, coach conversations, healing rituals, and community features

## Data Flow

### User Journey
1. **Authentication**: Users can sign up/login via email or Google OAuth
2. **Onboarding**: New users take a chakra assessment questionnaire
3. **Dashboard**: Central hub showing progress, recommendations, and quick actions
4. **Core Features**: 
   - Journal entries with AI analysis
   - AI coach conversations (4 different coach types)
   - Emotion tracking and visualization
   - Healing rituals and courses
   - Community posts and interactions

### AI Integration
- **OpenAI GPT-4** integration for:
  - Journal entry sentiment analysis
  - Personalized AI coaching conversations
  - Emotional pattern recognition
  - Chakra-based recommendations
- **Token usage tracking** to manage API costs and user quotas
- **Rate limiting** to prevent abuse

### Data Processing Pipeline
1. User inputs (journal entries, chat messages, assessments)
2. AI analysis and emotion extraction
3. Storage in PostgreSQL with metadata
4. Real-time updates via TanStack Query
5. Dashboard aggregation and visualization

## External Dependencies

### Payment Processing
- **Stripe** integration for premium membership subscriptions
- Webhook handling for payment events

### Email Services  
- **SendGrid** for transactional emails

### Cloud Storage
- Local file storage with Express static serving
- Prepared for cloud storage migration

### AI Services
- **OpenAI API** for natural language processing
- **Anthropic SDK** (configured but not actively used)

### Analytics
- **Google Tag Manager** for user analytics tracking

## Deployment Strategy

### Development Environment
- **Vite** development server with hot module replacement
- **TypeScript** compilation checking
- **Environment variables** for configuration management

### Production Build
- **Vite** builds the React frontend to static assets
- **ESBuild** bundles the Express server for Node.js deployment
- **Database migrations** managed through Drizzle Kit
- **Session storage** uses PostgreSQL instead of memory

### Environment Configuration
The application expects these environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: For AI features  
- `STRIPE_SECRET_KEY`: For payment processing
- `SENDGRID_API_KEY`: For email sending
- `SESSION_SECRET`: For session security
- `GOOGLE_CLIENT_ID/SECRET`: For OAuth

### Performance Optimizations
- **Caching headers** for static assets
- **Database indexing** on frequently queried fields
- **Query optimization** with Drizzle ORM
- **Component lazy loading** and code splitting

### Security Measures
- **CSRF protection** through session management
- **Input validation** with Zod schemas
- **Rate limiting** on AI endpoints
- **Secure session handling** with httpOnly cookies
- **Environment variable protection** for sensitive data