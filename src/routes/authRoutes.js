const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Local Auth Routes
router
    .post("/register", registerUser)
    .post("/login", loginUser)
    .post("/logout", isAuthenticated, logoutUser);

// Google OAuth Routes
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get("/dashboard", isAuthenticated, (req, res) => {
    res.json({ message: "Successfully authenticated" });
});

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `/google`,
    }),
    (req, res) => {
        // Force session save before responding
        console.log(`Auth successful, user ID: ${req.user._id}, session ID: ${req.sessionID}`);
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to save session',
                    error: err.message 
                });
            }
            
            console.log(`Session saved with ID: ${req.sessionID}`);
            
            // Create auth data object
            const authData = {
                success: true,
                message: 'Authentication successful',
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    isNewUser: req.user.isNewUser || false
                },
                sessionId: req.sessionID
            };
            
            // Redirect to frontend with auth data as URL parameter
            const frontendUrl = process.env.FRONTEND_URL_DEV || 'http://localhost:5173';
            const redirectUrl = `${frontendUrl}/auth/google/callback?data=${encodeURIComponent(JSON.stringify(authData))}`;
            
            console.log(`Redirecting to frontend: ${redirectUrl}`);
            return res.redirect(redirectUrl);
        });
    }
);

module.exports = router; 