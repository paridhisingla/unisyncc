const express = require('express');
const router = express.Router();
const peopleOpsController = require('../controllers/peopleOpsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Base routes with authentication
router.use(authenticate);

// User management routes
router.get('/users', authorize(['Admin']), peopleOpsController.getUsers);
router.get('/users/:id', authorize(['Admin', 'Teacher']), peopleOpsController.getUserById);
router.post('/users', authorize(['Admin']), peopleOpsController.createUser);
router.put('/users/:id', authorize(['Admin']), peopleOpsController.updateUser);
router.delete('/users/:id', authorize(['Admin']), peopleOpsController.deleteUser);

// Bulk operations
router.post('/users/bulk-import', authorize(['Admin']), peopleOpsController.bulkImportUsers);
router.post('/users/merge', authorize(['Admin']), peopleOpsController.mergeDuplicateUsers);

// Badge management
router.post('/users/:id/badges', authorize(['Admin', 'Teacher']), peopleOpsController.addBadge);

// Sentiment pulse
router.post('/users/:id/sentiment', authorize(['Admin', 'Teacher']), peopleOpsController.addSentimentPulse);

// Relationship management
router.post('/users/:id/relationships', authorize(['Admin']), peopleOpsController.addRelationship);
router.get('/relationships/graph', authorize(['Admin']), peopleOpsController.getRelationshipGraph);

// Consent management
router.post('/users/:id/consent', authorize(['Admin']), peopleOpsController.updateConsent);

// Audit logs
router.get('/users/:id/audit', authorize(['Admin']), peopleOpsController.getUserAuditLogs);

// Phone verification
router.post('/users/:id/verify-phone', authorize(['Admin']), peopleOpsController.verifyPhone);

module.exports = router;