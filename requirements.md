# Software Requirements – Web Email Messaging App

## 1. Purpose

Provide a web-based interface for sending and receiving email messages using Gmail accounts. Users authenticate with Google OAuth. Contacts are synced from Google and used to simplify message composition.

## 2. Scope

- **Frontend:** Next.js SPA
- **Backend:** Fastify API server
- **Email transport:** SMTP for sending, IMAP for receiving
- **Authentication:** Google OAuth 2.0
- **Contacts:** Google People API integration

## 3. Functional Requirements

### 3.1 Authentication

- Implement Google OAuth 2.0 login
- Request scopes: `email`, `profile`, `https://www.googleapis.com/auth/contacts.readonly`
- Store refresh tokens securely to keep user sessions active
- Logout endpoint to revoke tokens

### 3.2 Contact Management

- Fetch contacts from Google People API after login
- Cache contacts server-side for performance
- Provide autocomplete endpoint for frontend when composing messages

### 3.3 Messaging

- **Send:**
  - Accept message payload (to, subject, body, attachments) via API
  - Send via Gmail SMTP using user OAuth token
- **Receive:**
  - Connect to Gmail IMAP with OAuth token
  - Retrieve inbox, group messages by thread
  - Support pagination and search by sender, subject, or body

### 3.4 Notifications

- Use Web Push API to notify users of new messages
- Backend triggers push events when IMAP IDLE detects new mail

### 3.5 Security

- HTTPS/TLS for all requests
- JWT for session tokens, encrypted at rest
- Sanitize and validate all input to prevent injection attacks

## 4. Non-Functional Requirements

- **Performance:** API response time < 300 ms for cached data
- **Scalability:** Support 50k concurrent users
- **Reliability:** 99.9% uptime target
- **Compliance:** Follow Google OAuth policies and privacy requirements

## 5. Constraints

- Web only, no native mobile app
- Requires Google account; no support for other email providers (future feature)
- No offline message sync except what browser cache allows

## 6. Future Enhancements

- PWA offline support
- End-to-end encryption for messages
- Multi-provider support (Outlook, custom SMTP/IMAP)
