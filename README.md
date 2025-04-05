# FallGuardian Backend

A Node.js backend for the FallGuardian system - a healthcare application that connects patients with nurses, featuring fall detection and communication tools.

## Features

- **User Management**: Patient, nurse, and admin roles
- **Patient-Nurse Communication**: Secure message threads through forms
- **Fall Detection**: Alert system for patient falls
- **AI Integration**: Text generation and support

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Google OAuth credentials
- Docker (for containerized deployment)

## Environment Variables

Create a `.env` file in the root directory with:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development  # Use 'production' in production environments

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Session
SESSION_SECRET=your_session_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
LOGOUT_REDIRECT_URL=/

# SMS/Notifications
TELESIGN_CUSTOMER_ID=your_telesign_customer_id
TELESIGN_API_KEY=your_telesign_api_key

# AI API
NEBIUS_API_KEY=your_nebius_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run dev
   ```

## Docker Setup

### Build and Run Locally with Docker

```bash
# Build the Docker image
docker build -t fallguardian-backend .

# Run the container
docker run -p 3000:3000 --env-file .env fallguardian-backend
```

### CI/CD with GitHub Actions

The project includes GitHub Actions workflows for:
- Automated testing
- Building and pushing Docker images
- Deployment to Azure Container Instances

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## API Documentation

Swagger API documentation is available at `/api-docs` when the server is running.

## Data Models

### User

```javascript
{
  name: String,            // User's full name
  email: String,           // Email address (unique)
  googleId: String,        // Google OAuth ID
  age: Number,             // User's age (0-120)
  role: String,            // 'patient', 'nurse', or 'admin'
  phoneNumber: String,     // Phone number (E.164 format)
  nurseId: ObjectId,       // For patients: assigned nurse
  assignedPatients: [ObjectId], // For nurses: list of patients
  createdAt: Date          // Account creation timestamp
}
```

### Form

```javascript
{
  title: String,           // Form title
  patient: ObjectId,       // Patient reference
  nurse: ObjectId,         // Nurse reference
  status: String,          // 'pending', 'in-progress', 'resolved', 'cancelled'
  resolved: Boolean,       // Whether form is resolved
  resolvedBy: ObjectId,    // User who resolved the form
  resolvedAt: Date,        // When the form was resolved
  messages: [{
    sender: ObjectId,      // Message sender
    body: String,          // Message content
    attachment: String,    // Optional attachment URL
    createdAt: Date        // Message timestamp
  }],
  createdAt: Date,         // Form creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

## Key API Endpoints

### Authentication
- `GET /api/auth/google`: Google OAuth login
- `GET /api/auth/dashboard`: Authentication dashboard
- `GET /api/auth/logout`: Logout

### Users
- `GET /api/users`: Get all users
- `GET /api/users/me`: Get current user profile
- `PUT /api/users/me`: Update current user profile

### Nurses
- `GET /api/nurse/me/patients`: Get nurse's patients
- `POST /api/nurse/me/patients/:patientId/assign`: Assign patient to nurse
- `DELETE /api/nurse/me/patients/:patientId`: Remove patient from nurse

### Patients
- `GET /api/patient/me/nurse`: Get patient's nurse
- `POST /api/patient/me/fall`: Alert nurse about patient fall

### Forms
- `POST /api/forms`: Create new form
- `GET /api/forms/me`: Get user's forms
- `GET /api/forms/:id`: Get specific form
- `POST /api/forms/:id/messages`: Add message to form
- `POST /api/forms/:id/resolve`: Mark form as resolved

## Architecture

The application follows a layered architecture:
- **Models**: Database schemas (MongoDB/Mongoose)
- **Services**: Business logic
- **Controllers**: Request handling
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, validation, error handling

## License

[MIT License](LICENSE) 