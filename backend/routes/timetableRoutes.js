const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Base routes with authentication
router.use(authenticate);

// Timetable composition
router.post('/compose', authorize(['Admin']), timetableController.composeTimetable);

// Get timetables
router.get('/class/:id', authorize(['Admin', 'Teacher', 'Student']), timetableController.getTimetableByClass);
router.get('/teacher/:id', authorize(['Admin', 'Teacher']), timetableController.getTimetableByTeacher);
router.get('/room/:id', authorize(['Admin', 'Teacher']), timetableController.getTimetableByRoom);

// What-if simulation
router.post('/simulate', authorize(['Admin']), timetableController.runSimulation);

// Export to ICS
router.get('/:id/export-ics', authorize(['Admin', 'Teacher', 'Student']), timetableController.exportToICS);

// Room management
router.post('/rooms', authorize(['Admin']), timetableController.createRoom);
router.get('/rooms', authorize(['Admin', 'Teacher']), timetableController.getRooms);

module.exports = router;