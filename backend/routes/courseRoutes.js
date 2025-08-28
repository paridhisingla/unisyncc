const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Course CRUD operations
router.get('/', authenticate, courseController.getCourses);
router.get('/:id', authenticate, courseController.getCourseById);
router.post('/', authenticate, authorize(['Admin', 'Teacher']), courseController.createCourse);
router.put('/:id', authenticate, authorize(['Admin', 'Teacher']), courseController.updateCourse);
router.delete('/:id', authenticate, authorize(['Admin']), courseController.deleteCourse);

// Student enrollment
router.post('/:id/enroll', authenticate, authorize(['Admin', 'Teacher']), courseController.enrollStudents);
router.post('/:id/unenroll', authenticate, authorize(['Admin', 'Teacher']), courseController.unenrollStudents);
router.get('/:id/students', authenticate, courseController.getEnrolledStudents);

// Syllabus management
router.post('/:courseId/syllabus', authenticate, authorize(['Admin', 'Teacher']), courseController.manageSyllabusNode);
router.put('/:courseId/syllabus', authenticate, authorize(['Admin', 'Teacher']), courseController.manageSyllabusNode);
router.delete('/:courseId/syllabus/:nodeId', authenticate, authorize(['Admin', 'Teacher']), courseController.deleteSyllabusNode);
router.get('/:courseId/syllabus/versions', authenticate, courseController.getSyllabusVersions);
router.post('/:courseId/syllabus/versions/:versionNumber/activate', authenticate, authorize(['admin', 'teacher']), courseController.activateSyllabusVersion);

// Learning outcomes
router.post('/:courseId/outcomes', authenticate, authorize(['Admin', 'Teacher']), courseController.manageLearningOutcome);
router.put('/:courseId/outcomes', authenticate, authorize(['Admin', 'Teacher']), courseController.manageLearningOutcome);
router.delete('/:courseId/outcomes/:outcomeId', authenticate, authorize(['Admin', 'Teacher']), courseController.deleteLearningOutcome);

// Course materials
router.post('/:courseId/materials', authenticate, authorize(['Admin', 'Teacher']), courseController.addCourseMaterial);
router.delete('/:courseId/materials/:materialId', authenticate, authorize(['Admin', 'Teacher']), courseController.deleteCourseMaterial);

// Student readiness
router.get('/:courseId/readiness/:studentId', authenticate, courseController.calculateStudentReadiness);

// Export functionality
router.get('/:courseId/export', authenticate, courseController.exportSyllabus);

// Bulk operations
router.post('/bulk-import', authenticate, authorize(['Admin']), courseController.bulkImportCourses);

module.exports = router;