const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', userController.getAllUsers);

// Define '/me' routes first (before '/:id')
// Protected routes for authenticated users
router.get('/me', isAuthenticated, userController.getMe);
router.put('/me', isAuthenticated, userController.updateMe);

// This generic route should come after specific routes
router.get('/:id', userController.getUser);

// Admin-only routes - apply admin middleware to all routes below
router.use(isAdmin);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 