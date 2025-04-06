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

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false, // Don't create session until something is stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // Session TTL in seconds (1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production' && process.env.DISABLE_SECURE_COOKIE !== 'true',
    httpOnly: true, // Helps protect against XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // Cookie max age in milliseconds (1 day)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Required for cross-site cookies
  }
}));

// Passport middleware - must be after session middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log authentication status
app.use((req, res, next) => {
  // Simple authentication logger
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - isAuthenticated: ${req.isAuthenticated()}`);
  if (req.isAuthenticated()) {
    console.log(`User: ${req.user.name}, ID: ${req.user._id}`);
  }
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