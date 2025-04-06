const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Auth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google?error=authentication_failed' }),
  (req, res, next) => {
    // Explicitly save the session before continuing
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      next();
    });
  },
  authController.handleGoogleCallback
);

// Dashboard route - requires authentication
router.get('/dashboard', isAuthenticated, authController.dashboard);

// Logout
router.get('/logout', authController.logout);

module.exports = router; 