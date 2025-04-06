const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const passport = require('./config/passport');
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./docs/swagger');

const app = express();

// Trust proxy - important for Azure which uses proxies
app.set('trust proxy', 1);

// Configure CORS to allow cookies/credentials
app.use(cors({
  origin: ["https://fallguardian-api.azurewebsites.net", "http://localhost:3000"],
  credentials: true
}));

// Essential for cookie parsing
app.use(cookieParser(process.env.SESSION_SECRET || 'keyboard cat'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: true, // Changed to true to ensure session is saved
  saveUninitialized: true, // Create session right away
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
    touchAfter: 10 * 60,
    stringify: false,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: false, // Important: set to false initially to debug
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none', // Always use 'none' when in production
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.azurewebsites.net' : undefined
  },
  name: 'fallguardian.sid',
  proxy: true // Important for Azure
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

// Debug route to check session state directly
app.get('/api/debug/session', (req, res) => {
  const sessionInfo = {
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    sessionContent: req.session,
    cookies: req.cookies,
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    } : null,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent']
    }
  };
  console.log('SESSION DEBUG:', JSON.stringify(sessionInfo, null, 2));
  res.json(sessionInfo);
});

// Health check route - important for Azure
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app; 