const express = require('express');
const router = express.Router();

// Import routes
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const nurseRoutes = require('./nurseRoutes');
const patientRoutes = require('./patientRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/nurse', nurseRoutes);
router.use('/patient', patientRoutes);

module.exports = router; 