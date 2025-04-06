const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { isAuthenticated, isNurse, isAdmin } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Routes for nurses to manage their own patients
// Prefix: /nurse/me/...
router.get('/me/patients', isNurse, nurseController.getMyPatients);
router.post('/me/patients/:patientId/assign', isNurse, nurseController.assignPatientToMe);
router.post('/me/patients/bulk-assign', isNurse, nurseController.bulkAssignPatientsToMe);
router.delete('/me/patients/:patientId', isNurse, nurseController.removePatientFromMe);

// Routes for admins to manage nurse-patient assignments
// Prefix: /nurse/:nurseId/...
router.get('/:nurseId/patients', isAdmin, nurseController.getNursePatients);
router.post('/:nurseId/patients/:patientId/assign', isAdmin, nurseController.assignPatient);
router.post('/:nurseId/patients/bulk-assign', isAdmin, nurseController.bulkAssignPatients);
router.delete('/:nurseId/patients/:patientId', isAdmin, nurseController.unassignPatient);

module.exports = router; 