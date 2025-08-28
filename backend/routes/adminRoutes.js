const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
	stats,
	listStudents,
	createStudent,
	updateUser,
	deleteUser,
	userValidators,
	listTeachers,
	createTeacher,
	listCourses,
	createCourse,
	updateCourse,
	deleteCourse,
	courseValidators,
	createNotice,
	listNotices,
	studentsPerCourse,
	attendanceDistribution,
	performanceTrends,
	studentsByDepartment,
	studentGrowth,
	performanceRadial,
	exportStudents,
	exportAttendance,
	toggleStudentStatus,
	importStudentsFromFile,
	assignCoursesToTeacher,
	teacherPerformance,
	assignStudentsToCourse,
	assignTeacherToCourse,
	updateNotice,
	deleteNotice,
	pinNotice,
	attendanceByDepartment,
	attendanceByCourse,
	performanceByCourse,
	performanceByDepartment,
	listCalendar,
	createCalendar,
	updateCalendar,
	deleteCalendar,
	adminProfile,
	updateAdminProfile,
	addAdmin,
	removeAdmin,
} = require('../controllers/adminController');

router.use(auth, authorize('Admin'));

router.get('/stats', stats);

// Students
router.get('/students', listStudents);
router.post('/students', userValidators(), createStudent);
router.put('/students/:id', updateUser);
router.delete('/students/:id', deleteUser);

// Teachers
router.get('/teachers', listTeachers);
router.post('/teachers', userValidators(), createTeacher);
router.put('/teachers/:id', updateUser);
router.delete('/teachers/:id', deleteUser);

// Courses
router.get('/courses', listCourses);
router.post('/courses', courseValidators, createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Notices
router.post('/notices', createNotice);
router.get('/notices', listNotices);
router.put('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);
router.patch('/notices/:id/pin', pinNotice);

// Analytics
router.get('/analytics/students-per-course', studentsPerCourse);
router.get('/analytics/attendance-distribution', attendanceDistribution);
router.get('/analytics/performance-trends', performanceTrends);
router.get('/analytics/students-by-department', studentsByDepartment);
router.get('/analytics/attendance', attendanceDistribution);
router.get('/analytics/growth', studentGrowth);
router.get('/analytics/performance', performanceRadial);

// Exports
router.get('/export/students', exportStudents);
router.get('/export/attendance', exportAttendance);

// Student Management extras
router.patch('/students/:id/status', toggleStudentStatus);
router.post('/students/import', upload.single('file'), (req, res, next) => {
	if (!req.file) return res.status(400).json({ message: 'File required' });
	return importStudentsFromFile(req.file.path, res, next);
});

// Teacher Management extras
router.put('/teachers/:id/assign-courses', assignCoursesToTeacher);
router.get('/teachers/:id/performance', teacherPerformance);

// Course Management extras
router.put('/courses/:id/assign-students', assignStudentsToCourse);
router.put('/courses/:id/assign-teacher', assignTeacherToCourse);

// Attendance & Performance stats
router.get('/attendance/department', attendanceByDepartment);
router.get('/attendance/course/:id', attendanceByCourse);
router.get('/performance/course/:id', performanceByCourse);
router.get('/performance/department', performanceByDepartment);

// Calendar
router.get('/calendar', listCalendar);
router.post('/calendar', createCalendar);
router.put('/calendar/:id', updateCalendar);
router.delete('/calendar/:id', deleteCalendar);

// Settings & Roles
router.get('/profile', adminProfile);
router.put('/profile', updateAdminProfile);
router.post('/add-admin', addAdmin);
router.delete('/remove-admin/:id', removeAdmin);

module.exports = router;


