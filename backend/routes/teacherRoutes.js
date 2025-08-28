const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
	myCourses,
	studentsInCourse,
	attendanceValidators,
	markAttendance,
	viewAttendance,
	gradeValidators,
	submitGrades,
	viewGrades,
} = require('../controllers/teacherController');

router.use(auth, authorize('Teacher', 'Admin'));

router.get('/courses', myCourses);
router.get('/students/:courseId', studentsInCourse);
router.post('/attendance', attendanceValidators, markAttendance);
router.get('/attendance/:courseId', viewAttendance);
router.post('/grades', gradeValidators, submitGrades);
router.get('/grades/:courseId', viewGrades);

module.exports = router;


