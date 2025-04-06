const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const passport = require('./config/passport');
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./docs/swagger');

const app = express();

// Trust proxy - important for Azure which uses proxies
app.set('trust proxy', 1);

// Configure CORS to allow cookies/credentials
app.use(cors({
  origin: true, // Allow any origin or set to specific origin
  credentials: true // Allow cookies to be sent with requests
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // Session TTL (1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production' && process.env.DISABLE_SECURE_COOKIE !== 'true',
    maxAge: 24 * 60 * 60 * 1000, // Cookie max age (1 day)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    domain: undefined // Remove domain restriction entirely
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log authentication status
app.use((req, res, next) => {
  console.log(`Request path: ${req.path}, Authenticated: ${req.isAuthenticated()}, User: ${req.user ? JSON.stringify(req.user._id) : 'none'}`);
  next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express & MongoDB API' });
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app; 