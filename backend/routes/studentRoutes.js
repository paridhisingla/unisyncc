const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { myCourses, myAttendance, myGrades, timetable, notices, updateProfile } = require('../controllers/studentController');

router.use(auth, authorize('Student', 'Admin'));

router.get('/courses', myCourses);
router.get('/attendance', myAttendance);
router.get('/grades', myGrades);
router.get('/timetable', timetable);
router.get('/notices', notices);
router.put('/profile', updateProfile);

module.exports = router;


