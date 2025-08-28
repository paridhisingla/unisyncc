const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Notice = require('../models/Notice');
const User = require('../models/User');

async function myCourses(req, res, next) {
	try {
		const courses = await Course.find({ students: req.user.id }).populate('teacherId', 'name email');
		res.json({ items: courses });
	} catch (err) {
		next(err);
	}
}

async function myAttendance(req, res, next) {
	try {
		const records = await Attendance.find({ studentId: req.user.id }).populate('courseId', 'name code');
		res.json({ items: records });
	} catch (err) {
		next(err);
	}
}

async function myGrades(req, res, next) {
	try {
		const records = await Grade.find({ studentId: req.user.id }).populate('courseId', 'name code');
		res.json({ items: records });
	} catch (err) {
		next(err);
	}
}

async function timetable(req, res, next) {
	try {
		// Placeholder timetable: derive from course codes/dummy schedule
		const courses = await Course.find({ students: req.user.id }).select('name code');
		const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
		const schedule = courses.map((c, i) => ({ day: days[i % days.length], slot: `Slot-${(i % 4) + 1}`, course: c.name, code: c.code }));
		res.json({ items: schedule });
	} catch (err) {
		next(err);
	}
}

async function notices(req, res, next) {
	try {
		const items = await Notice.find().sort({ createdAt: -1 });
		res.json({ items });
	} catch (err) {
		next(err);
	}
}

async function updateProfile(req, res, next) {
	try {
		const updates = { name: req.body.name, department: req.body.department, year: req.body.year };
		const updated = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

module.exports = { myCourses, myAttendance, myGrades, timetable, notices, updateProfile };


