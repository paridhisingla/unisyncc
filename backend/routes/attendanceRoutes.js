const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Base routes with authentication
router.use(authenticate);

// Mark attendance
router.post('/mark', authorize(['Admin', 'Teacher']), attendanceController.markAttendance);

// Get attendance summary
router.get('/summary', authorize(['Admin', 'Teacher']), attendanceController.getAttendanceSummary);

// Get attendance anomalies
router.get('/anomalies', authorize(['Admin', 'Teacher']), attendanceController.getAttendanceAnomalies);

// Detect mass bunk
router.post('/detect-mass-bunk', authorize(['Admin', 'Teacher']), attendanceController.detectMassBunk);

// Backfill attendance
router.post('/backfill', authorize(['Admin', 'Teacher']), attendanceController.backfillAttendance);

// Approve backfill
router.post('/backfill/:id/approve', authorize(['Admin']), attendanceController.approveBackfill);

// Import attendance
router.post('/import', authorize(['Admin']), attendanceController.importAttendance);

// Get class roster
router.get('/class/:classId/roster', authorize(['Admin', 'Teacher']), attendanceController.getClassRoster);

// Export attendance
router.get('/export', authorize(['Admin', 'Teacher']), attendanceController.exportAttendance);

// Get student attendance
router.get('/student/:studentId', authorize(['Admin', 'Teacher', 'Student']), attendanceController.getStudentAttendance);

module.exports = router;