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
            }
            console.log(`Session saved, redirecting to dashboard with session ID: ${req.sessionID}`);
            res.redirect('/api/auth/dashboard');
        });
    }
);

module.exports = router; 