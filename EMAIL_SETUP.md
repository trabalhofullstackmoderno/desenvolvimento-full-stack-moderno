# Email Messaging App Setup Guide

This document provides detailed setup instructions for the Gmail email messaging functionality.

## Features Implemented

- **Google OAuth Integration**: Secure authentication with Gmail access
- **Contact Management**: Sync and search Google contacts
- **Email Operations**: Send, receive, and organize emails with threading
- **Push Notifications**: Real-time notifications for new emails
- **Search**: Search emails by sender, subject, or content
- **Security**: Encrypted token storage and secure handling

## New Dependencies Added

### Backend
- `googleapis`: Google APIs client library
- `nodemailer`: Email sending library
- `imap`: IMAP client for receiving emails
- `mailparser`: Email parsing utility
- `web-push`: Web push notifications

### Type Definitions
- `@types/nodemailer`
- `@types/imap`
- `@types/web-push`

## Database Schema Changes

The Prisma schema has been updated with new models:

- **User**: Extended with `accessToken` and `refreshToken` fields
- **GoogleContact**: For synced Google contacts
- **EmailThread**: Email conversation threads
- **Email**: Individual email messages
- **PushSubscription**: Push notification subscriptions

## Environment Variables

Add these to your backend `.env` file:

```env
# Database (updated to PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/email_app_db"

# JWT
JWT_SECRET="your-jwt-secret-key-here"

# Google OAuth (existing, but now with additional scopes)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Encryption for secure token storage
ENCRYPTION_SECRET="your-encryption-secret-for-tokens"

# Push Notifications (VAPID keys)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_EMAIL="admin@yourdomain.com"

# Environment
NODE_ENV="development"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Gmail API
   - Google People API
3. Update OAuth scopes to include:
   - `https://www.googleapis.com/auth/contacts.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`

## New API Endpoints

### Email Management
- `POST /emails/send` - Send email
- `GET /emails/threads` - Get email threads with pagination
- `GET /emails/threads/:threadId` - Get specific thread details
- `POST /emails/sync` - Sync emails from Gmail
- `GET /emails/search` - Search emails
- `PUT /emails/:emailId/read` - Mark email as read

### Contact Management
- `POST /contacts/sync` - Sync Google contacts
- `GET /contacts/search` - Search contacts with autocomplete

### Push Notifications
- `GET /push/vapid-public-key` - Get VAPID public key
- `POST /push/subscribe` - Subscribe to push notifications
- `DELETE /push/unsubscribe` - Unsubscribe from notifications

## Frontend Components

### New Pages
- `/email` - Main email interface
- `/chat` - Legacy chat interface (moved from root)

### New Components
- `EmailInbox` - Main inbox view with thread list
- `EmailThread` - Thread view with message list
- `EmailComposer` - Email composition dialog
- `NotificationSetup` - Push notification setup

### Service Worker
- `public/sw.js` - Service worker for push notifications

## Security Features

### Token Encryption
Tokens are encrypted using AES-256-GCM before storage in the database.

### Input Validation
All API endpoints use Zod for request validation.

### Authentication Middleware
JWT-based authentication required for all email endpoints.

## Usage Instructions

1. **Setup Database**: Run `npx prisma migrate deploy` to apply schema changes
2. **Start Services**: Start both backend and frontend servers
3. **Authenticate**: Click "Open Email" and authenticate with Google
4. **Sync Data**: Use sync buttons to import contacts and emails
5. **Enable Notifications**: Allow push notifications for real-time alerts
6. **Compose Emails**: Use the floating action button to compose new emails

## Troubleshooting

### Common Issues

1. **OAuth Scope Errors**: Ensure all required scopes are enabled in Google Cloud Console
2. **Database Errors**: Verify PostgreSQL connection and run migrations
3. **Token Encryption**: Set ENCRYPTION_SECRET environment variable
4. **Push Notifications**: Generate and configure VAPID keys

### Generate VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── email-service.ts
│   │   ├── google-contacts-service.ts
│   │   └── push-notification-service.ts
│   ├── http/controllers/
│   │   ├── emails/
│   │   └── push/
│   └── prisma/schema.prisma

frontend/
├── src/
│   ├── components/
│   │   ├── email/
│   │   └── notifications/
│   ├── services/
│   │   └── push-notification-service.ts
│   └── app/
│       ├── email/page.tsx
│       └── chat/page.tsx
└── public/
    └── sw.js
```

This implementation follows SOLID principles on the backend with proper separation of concerns and secure handling of OAuth tokens, contacts, and email data.