const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Course grades
router.get('/course/:courseId', authenticate, authorize('Admin','Teacher'), examController.getCourseGrades);

// Student grades
router.get('/student/:studentId', authenticate, examController.getStudentGrades);

// Grade management
router.post('/student/:studentId/course/:courseId', authenticate, authorize('Admin','Teacher'), examController.manageGrade);
router.put('/student/:studentId/course/:courseId', authenticate, authorize('Admin','Teacher'), examController.manageGrade);

// Assessment components
router.post('/grade/:gradeId/component', authenticate, authorize('Admin','Teacher'), examController.manageAssessmentComponent);
router.put('/grade/:gradeId/component', authenticate, authorize('Admin','Teacher'), examController.manageAssessmentComponent);
router.delete('/grade/:gradeId/component/:componentId', authenticate, authorize('Admin','Teacher'), examController.deleteAssessmentComponent);

// Grade publishing
router.post('/course/:courseId/publish', authenticate, authorize('Admin','Teacher'), examController.publishGrades);

// Grade appeals
router.post('/grade/:gradeId/component/:componentId/appeal', authenticate, examController.submitGradeAppeal);
router.put('/grade/:gradeId/appeal/:appealId', authenticate, authorize('Admin','Teacher'), examController.resolveGradeAppeal);
router.get('/course/:courseId/appeals', authenticate, authorize('Admin','Teacher'), examController.getCourseAppeals);

// Export functionality
router.get('/export/:id', authenticate, examController.exportGradeReport);

// Bulk operations
router.post('/course/:courseId/bulk-import', authenticate, authorize('Admin','Teacher'), examController.bulkImportGrades);

module.exports = router;