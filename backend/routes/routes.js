const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const authMiddleware = require('../middleware/auth');

// Protect all routes with authentication
router.use(authMiddleware);

// Calculate route
router.post('/calculate', routeController.calculateRoute);

// Get route history
router.get('/history', routeController.getRouteHistory);

// Delete route
router.delete('/:routeId', routeController.deleteRoute);

module.exports = router; 