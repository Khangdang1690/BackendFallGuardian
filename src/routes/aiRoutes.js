const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Text generation endpoint
router.post('/generate', aiController.generateText);

// Image generation endpoint
router.post('/image', aiController.generateImage);

module.exports = router; 