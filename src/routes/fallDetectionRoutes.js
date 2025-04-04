const express = require('express');
const router = express.Router();
const fallDetectionController = require('../controllers/fallDetectionController');
const { isAuthenticated, isAdmin, isNurse, isNurseOrAdmin } = require('../middleware/authMiddleware');

// Routes for the web application (secured by session)
// Protected routes - require authentication
router.use(isAuthenticated);

// Fall detection notification route - receives reports from frontend
router.post('/patients/:patientId/fall', fallDetectionController.recordFallEvent);

// Status management
router.post('/patients/:patientId/reset', isNurseOrAdmin, fallDetectionController.resetFallStatus);
router.get('/falls/active', fallDetectionController.getActiveFalls);

// Testing route - for development only
router.post('/patients/:patientId/simulate-fall', isNurseOrAdmin, fallDetectionController.simulateFallEvent);

// Nurse-patient assignment routes
router.get('/nurses/me/patients', isNurse, fallDetectionController.getMyPatients);
router.post('/nurses/me/patients/:patientId/assign', isNurse, fallDetectionController.assignPatientToMe);
router.delete('/nurses/me/patients/:patientId', isNurse, fallDetectionController.removePatientFromMe);

// Admin routes for patient management
router.get('/admin/nurses/:nurseId/patients', isAdmin, fallDetectionController.getNursePatients);
router.post('/admin/nurses/:nurseId/patients/:patientId/assign', isAdmin, fallDetectionController.assignPatient);
router.delete('/admin/nurses/:nurseId/patients/:patientId', isAdmin, fallDetectionController.unassignPatient);

module.exports = router; 