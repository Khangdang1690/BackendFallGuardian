# Express MongoDB Backend

A Node.js backend application using Express.js and MongoDB with Google OAuth authentication.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed locally or a MongoDB Atlas connection string
- npm or yarn
- Google OAuth credentials (see Authentication section)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your environment variables:
```
# Server configuration
PORT=3000

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/myapp

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Session configuration
SESSION_SECRET=your-strong-session-secret-key-here

# Redirect URL after logout (optional)
LOGOUT_REDIRECT_URL=/
```

3. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000 (or the port specified in your .env file)

## Authentication

This application uses Google OAuth 2.0 for authentication. To set it up:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the consent screen if prompted
6. Select "Web application" as the application type
7. Add "http://localhost:3000/api/auth/google/callback" to the Authorized redirect URIs
8. Copy the Client ID and Client Secret to your .env file

## API Documentation

API documentation is available through Swagger UI at `/api-docs` when the server is running.

## Project Structure

```
src/
  ├── controllers/    # Route controllers
  ├── docs/           # API documentation
  ├── middleware/     # Express middleware
  ├── models/         # MongoDB models
  ├── routes/         # API routes
  ├── services/       # Business logic services
  ├── app.js          # Express application setup
  └── server.js       # Main application entry point
```

## API Endpoints

- GET `/`: Welcome message
- GET `/api-docs`: API documentation (Swagger UI)
- GET `/api/users`: Get all users
- GET `/api/users/me`: Get current user profile (requires authentication)
- GET `/api/auth/google`: Login with Google
- GET `/api/auth/dashboard`: Authentication dashboard (requires authentication)
- GET `/api/auth/logout`: Logout current user 