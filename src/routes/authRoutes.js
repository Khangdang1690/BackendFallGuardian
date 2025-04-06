const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// @route   GET api/auth/google
// @desc    Auth with Google
// @access  Public
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google?error=authentication_failed',
    session: true
  }),
  (req, res) => {
    if (!req.user) {
      console.error('User missing from request after authentication');
      return res.redirect('/api/auth/google?error=user_missing');
    }
    
    // Store critical information directly in session
    req.session.userId = req.user._id;
    req.session.userRole = req.user.role; 
    req.session.userName = req.user.name;
    req.session.userEmail = req.user.email;
    req.session.isAuthenticated = true;
    req.session.authTime = new Date().toISOString();
    
    console.log('User authenticated, ID:', req.user._id, 'Session ID BEFORE save:', req.sessionID);
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session save failed');
      }
      
      console.log('Session successfully saved, Session ID AFTER save:', req.sessionID);
      
      // Important: use a simpler route without query parameters
      res.redirect('/api/auth/dashboard');
    });
  }
);

// @route   GET api/auth/dashboard
// @desc    User dashboard after authentication
// @access  Private
router.get('/dashboard', isAuthenticated, authController.dashboard);

// @route   GET api/auth/logout
// @desc    Logout user
// @access  Public
router.get('/logout', (req, res) => {
  // Handle logout for Passport.js >= 0.6.0
  req.logout(function(err) {
    if (err) { 
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.redirect('/');
    });
  });
});

module.exports = router; 