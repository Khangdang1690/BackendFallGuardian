const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const passport = require('./config/passport');
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./docs/swagger');

const app = express();

// Trust proxy - important for Azure which uses proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP temporarily if you have issues with swagger
}));

// HTTP request logger
app.use(morgan("common"));

// Configure CORS to allow cookies/credentials
app.use(cors({
  origin: ["https://fallguardian-api.azurewebsites.net", "http://localhost:3000"],
  credentials: true
}));

// Essential for cookie parsing
app.use(cookieParser(process.env.SESSION_SECRET || 'keyboard cat'));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Session middleware
app.use(
  session({
      secret: process.env.SESSION_SECRET || 'keyboard_cat',
      resave: true,
      saveUninitialized: true,
      cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" && process.env.DISABLE_SECURE_COOKIE !== 'true',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, //24h
      }
  })
);

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

// Debug session route
app.get('/api/debug/session', (req, res) => {
    const sessionInfo = {
        isAuthenticated: req.isAuthenticated(),
        sessionID: req.sessionID,
        user: req.user ? {
            id: req.user._id,
            name: req.user.name,
            role: req.user.role
        } : null,
        cookies: req.headers.cookie
    };
    
    console.log('SESSION DEBUG:', sessionInfo);
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