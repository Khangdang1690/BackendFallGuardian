const express = require('express');
const router = express.Router();
const passport = require('passport');

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
    session: true // Ensure session is enabled
  }),
  (req, res) => {
    // Double-check user is in the request
    if (!req.user) {
      console.error('User missing from request after authentication');
      return res.redirect('/api/auth/google?error=user_missing');
    }
    
    console.log('User authenticated, ID:', req.user._id, 'Session ID:', req.sessionID);
    
    // Force session save and wait for it to complete before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session save failed');
      }
      
      console.log('Session successfully saved, redirecting to dashboard');
      
      // Redirect with session ID in query parameter for debugging
      res.redirect(`/api/auth/dashboard?source=google_callback&sid=${req.sessionID}`);
    });
  }
);

// @route   GET api/auth/dashboard
// @desc    User dashboard after authentication
// @access  Private
router.get('/dashboard', ensureAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

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
    res.redirect('/');
  });
});

// Middleware to ensure user is authenticated
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized - Please log in' });
}

module.exports = router; 