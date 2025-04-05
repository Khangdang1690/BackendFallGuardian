const express = require('express');
const router = express.Router();

// Import routes
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const fallDetectionRoutes = require('./fallDetectionRoutes');
const nurseRoutes = require('./nurseRoutes');
const patientRoutes = require('./patientRoutes');
const aiRoutes = require('./aiRoutes');
const formRoutes = require('./formRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
// router.use('/monitoring', fallDetectionRoutes);
router.use('/nurse', nurseRoutes);
router.use('/patient', patientRoutes);
router.use('/ai', aiRoutes);
router.use('/forms', formRoutes);

module.exports = router; 