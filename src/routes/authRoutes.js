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
        // Force session save before redirect
        console.log(`Auth successful, user ID: ${req.user._id}, session ID: ${req.sessionID}`);
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect(process.env.FRONTEND_URL_DEV);
            }
            
            console.log(`Session saved, redirecting with session ID: ${req.sessionID}`);
            
            // Determine redirect URL based on user status and role
            let redirectUrl;
            
            if (req.user.isNewUser) {
                // New user - redirect to user info page to collect additional details
                redirectUrl = `${process.env.FRONTEND_URL_DEV}/user-info`;
                console.log(`New user detected, redirecting to: ${redirectUrl}`);
            } else {
                // Existing user - redirect based on role
                if (req.user.role === 'nurse' || req.user.role === 'admin') {
                    redirectUrl = `${process.env.FRONTEND_URL_DEV}/staff/dashboard`;
                    console.log(`Nurse/admin user, redirecting to: ${redirectUrl}`);
                } else {
                    // Default to patient dashboard
                    redirectUrl = `${process.env.FRONTEND_URL_DEV}/patient/dashboard`;
                    console.log(`Patient user, redirecting to: ${redirectUrl}`);
                }
            }
            
            res.redirect(redirectUrl);
        });
    }
);

module.exports = router; 