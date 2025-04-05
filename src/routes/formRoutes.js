const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { isAuthenticated, isPatient, isNurse, isAdmin, isNurseOrAdmin } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Create a new form (patient only)
router.post('/', isPatient, formController.createForm);

// Get all forms for the currently authenticated user
router.get('/me', formController.getMyForms);

// Get unresolved forms for the currently authenticated user
router.get('/me/unresolved', formController.getUnresolvedForms);

// Get form statistics for dashboard
router.get('/stats', formController.getFormStats);

// Get a specific form by ID
router.get('/:id', formController.getForm);

// Add a message to a form
router.post('/:id/messages', formController.addMessage);

// Mark a form as resolved
router.post('/:id/resolve', formController.resolveForm);

module.exports = router; 