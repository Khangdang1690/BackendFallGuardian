const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { isAuthenticated, isAdmin, isPatient } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Routes for patients to access their own data
// Prefix: /patient/me/...
router.get('/me/nurse', isPatient, patientController.getMyNurse);
router.post('/me/fall', isPatient, patientController.alertMyFall);

// Admin routes to manage patients
// Prefix: /patient/:id/...
router.post('/:id/fall', isAdmin, patientController.alertPatientFall);

module.exports = router; 