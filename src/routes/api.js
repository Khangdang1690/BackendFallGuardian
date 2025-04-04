const express = require('express');
const router = express.Router();

// Import routes
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const fallDetectionRoutes = require('./fallDetectionRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/monitoring', fallDetectionRoutes);

module.exports = router; 