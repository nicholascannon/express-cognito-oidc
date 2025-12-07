# Express + AWS Cognito OIDC Authentication

A learning/reference project demonstrating OAuth 2.0 / OpenID Connect authentication flow with AWS Cognito, Express backend, and React frontend.

## Overview

This project implements a complete authentication system using:

- **Backend**: Express.js server handling OIDC flows with AWS Cognito
- **Frontend**: React + Vite SPA that consumes the auth API
- **Authentication**: PKCE (Proof Key for Code Exchange) flow with token storage in HTTP-only cookies

## Architecture

### Authentication Flow

1. **Login**: User clicks login → redirected to Cognito hosted UI
2. **Callback**: Cognito redirects back with authorization code
3. **Token Exchange**: Server exchanges code for tokens using PKCE
4. **Token Storage**: Tokens stored in HTTP-only cookies (access, id, refresh)
5. **Protected Routes**: JWT verification using Cognito's JWKS endpoint
6. **Refresh**: Automatic token refresh using refresh token
7. **Logout**: Token revocation and cookie cleanup

### Project Structure

```
├── server/          # Express backend
│   ├── src/
│   │   ├── controllers/    # Auth controller (login, callback, logout, refresh)
│   │   ├── middleware/     # JWT verification middleware
│   │   ├── lib/            # OpenID client configuration
│   │   └── main.ts         # Express app setup
│   └── package.json
│
└── client/          # React frontend
    ├── src/
    │   ├── hooks/          # useMe hook for fetching user data
    │   ├── app.tsx         # Main app component
    │   └── main.tsx
    └── package.json
```

## Setup

### Prerequisites

- Node.js (v18+)
- AWS Cognito User Pool configured
- Cognito App Client with OAuth 2.0 enabled

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
COGNITO_CLIENT_SECRET=your-client-secret
COGNITO_REDIRECT_URI=http://localhost:8000/auth/callback
NODE_ENV=development
```

### Cognito Configuration

Your Cognito App Client should have:

- **Allowed OAuth flows**: Authorization code grant
- **Allowed OAuth scopes**: `openid`, `email`, `profile`
- **Allowed callback URLs**: `http://localhost:8000/auth/callback`
- **Allowed sign-out URLs**: `http://localhost:5173`
- **PKCE**: Enabled (recommended)

## Running the Project

### Backend

```bash
cd server
npm install
npm start  # Runs on http://localhost:8000
```

### Frontend

```bash
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

## API Endpoints

### Authentication Routes (`/auth`)

- `GET /auth/login` - Initiates OAuth flow, redirects to Cognito
- `GET /auth/callback` - Handles OAuth callback, exchanges code for tokens
- `POST /auth/logout` - Revokes tokens and clears cookies
- `POST /auth/refresh` - Refreshes access and ID tokens

### Protected Routes

- `GET /me` - Returns current user info (requires authentication)

## Key Features

- **PKCE Flow**: Secure authorization code flow with code verifier/challenge
- **HTTP-Only Cookies**: Tokens stored securely, not accessible to JavaScript
- **JWT Verification**: Validates tokens using Cognito's JWKS endpoint
- **Token Refresh**: Automatic refresh token handling
- **Type Safety**: Full TypeScript support
- **CORS**: Configured for local development

## Tech Stack

### Backend

- Express.js
- `openid-client` - OIDC client library
- `jose` - JWT verification
- `cookie-parser` - Cookie handling

### Frontend

- React 19
- Vite
- TypeScript

## Notes

- Tokens are stored in HTTP-only cookies for security
- Access/ID tokens expire in 1 hour
- Refresh tokens expire in 5 days
- JWT verification uses remote JWKS from Cognito
- CORS is configured for `http://localhost:5173` (update for production)
