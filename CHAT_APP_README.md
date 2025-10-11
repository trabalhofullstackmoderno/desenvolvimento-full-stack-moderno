# WhatsApp-Style Chat Application

A real-time chat application similar to WhatsApp, built with React/Next.js frontend and Fastify backend. Users authenticate with Google OAuth to access their contacts, find other registered users, and chat in real-time.

## How It Works

1. **Authentication**: Users login with their Google account
2. **Contact Discovery**: The app syncs Google contacts and shows which contacts are also using the app
3. **Real-time Messaging**: Users can send messages to other registered users in real-time
4. **NOT Email**: This is NOT a Gmail manager - it's an internal chat system that uses Google contacts for user discovery

## Features

- **Google OAuth Authentication**: Secure login with Google accounts
- **Contact Sync**: Automatic sync of Google contacts to find friends using the app
- **Real-time Messaging**: WebSocket-based instant messaging
- **WhatsApp-style Interface**: Modern chat interface with message bubbles, typing indicators, and online status
- **Message Status**: Sent, delivered, and read indicators
- **Online Presence**: See when contacts are online or last seen
- **Typing Indicators**: See when someone is typing
- **Push Notifications**: Real-time notifications for new messages
- **Contact Search**: Find and start conversations with registered users

## Tech Stack

### Frontend
- Next.js 15 with App Router
- TypeScript
- Material-UI (MUI)
- WebSocket client for real-time communication
- Service Worker for push notifications

### Backend
- Fastify (Node.js)
- TypeScript
- WebSocket for real-time messaging
- Prisma ORM with PostgreSQL
- Google People API for contact sync
- JWT authentication
- Web Push for notifications

## Database Schema

### Core Models
- **User**: Google OAuth user information with online status
- **GoogleContact**: Synced Google contacts
- **Conversation**: One-on-one chat conversations
- **Message**: Individual chat messages with status tracking
- **TypingIndicator**: Real-time typing status
- **PushSubscription**: Push notification subscriptions

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Console project with People API enabled

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google People API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3333/login/google/callback`
5. Copy the Client ID and Client Secret

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Edit .env with your values:
# - DATABASE_URL: PostgreSQL connection string
# - JWT_SECRET: Random secret for JWT tokens
# - GOOGLE_CLIENT_ID: From Google Cloud Console
# - GOOGLE_CLIENT_SECRET: From Google Cloud Console
# - ENCRYPTION_SECRET: Random secret for token encryption

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Open http://localhost:3000 in your browser
2. Click the Google OAuth login button
3. Grant permissions for contact access
4. Sync your Google contacts to find friends using the app
5. Start conversations with registered users
6. Send real-time messages with status indicators
7. See online status and typing indicators
8. Enable push notifications for offline alerts

## API Endpoints

### Authentication
- `GET /login/google` - Start OAuth flow
- `GET /login/google/callback` - OAuth callback
- `POST /logout` - Logout user

### Conversations
- `POST /conversations` - Create new conversation
- `GET /conversations` - Get user's conversations

### Messages
- `GET /conversations/:id/messages` - Get conversation messages
- `POST /conversations/:id/messages` - Send message (also via WebSocket)
- `PUT /messages/:id/read` - Mark message as read

### Contacts
- `POST /contacts/sync` - Sync Google contacts
- `GET /contacts/search` - Search registered contacts
- `GET /contacts/registered` - Get all registered contacts

### WebSocket Events
- `message` - Send/receive chat messages
- `typing` - Typing indicators
- `read` - Message read receipts
- `online_status` - User online/offline status

## Key Features Explained

### Contact Discovery
- Users can only chat with people who are in their Google contacts AND have registered for the app
- The app filters Google contacts to show only registered users
- No random user discovery - only people you already know

### Real-time Communication
- All messages are sent via WebSocket for instant delivery
- Fallback HTTP API ensures message delivery even if WebSocket fails
- Real-time typing indicators and online status updates

### Message Status System
- **Sent**: Message sent from sender
- **Delivered**: Message received by recipient's device
- **Read**: Message opened by recipient

### Security Features
- Encrypted OAuth token storage
- JWT-based session management
- Input validation with Zod
- CORS protection
- No message content stored in plain text

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Operations
```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### WebSocket Testing
Use browser developer tools to monitor WebSocket connections and messages for debugging real-time features.

## Production Deployment

1. Set up PostgreSQL database
2. Configure production environment variables
3. Build applications:
   ```bash
   # Backend
   cd backend && npm run build

   # Frontend
   cd frontend && npm run build
   ```
4. Deploy using your preferred hosting service
5. Update OAuth redirect URIs in Google Cloud Console
6. Ensure WebSocket support in production environment

## Architecture Overview

This is a **real-time chat application** that happens to use Google OAuth for authentication and Google Contacts for user discovery. It is NOT an email client or Gmail integration.

**Flow:**
1. User logs in with Google → Gets access to their contacts
2. App syncs contacts → Finds which contacts are also registered users
3. User can start chats → Only with people in their contacts who use the app
4. Real-time messaging → Via WebSocket with message status tracking

The goal is to create a WhatsApp-like experience where you can instantly chat with people you already know (from your Google contacts) who are also using the application.