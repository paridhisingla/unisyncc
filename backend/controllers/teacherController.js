const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

async function myCourses(req, res, next) {
	try {
		const courses = await Course.find({ teacherId: req.user.id }).sort({ createdAt: -1 });
		res.json({ items: courses });
	} catch (err) {
		next(err);
	}
}

async function studentsInCourse(req, res, next) {
	try {
		const { courseId } = req.params;
		const course = await Course.findOne({ _id: courseId, teacherId: req.user.id }).populate('students', 'name email department year');
		if (!course) return res.status(404).json({ message: 'Course not found' });
		res.json({ items: course.students });
	} catch (err) {
		next(err);
	}
}

const attendanceValidators = [
	body('records').isArray({ min: 1 }),
	body('records.*.studentId').notEmpty(),
	body('records.*.courseId').notEmpty(),
	body('records.*.date').isISO8601(),
	body('records.*.status').isIn(['Present', 'Absent']),
];

async function markAttendance(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { records } = req.body;
		const ops = records.map((r) => ({
			updateOne: {
				filter: { studentId: r.studentId, courseId: r.courseId, date: new Date(r.date) },
				update: { $set: { status: r.status } },
				upsert: true,
			},
		}));
		await Attendance.bulkWrite(ops);
		res.status(201).json({ message: 'Attendance updated' });
	} catch (err) {
		next(err);
	}
}

async function viewAttendance(req, res, next) {
	try {
		const { courseId } = req.params;
		const records = await Attendance.find({ courseId }).populate('studentId', 'name email');
		res.json({ items: records });
	} catch (err) {
		next(err);
	}
}

const gradeValidators = [
	body('grades').isArray({ min: 1 }),
	body('grades.*.studentId').notEmpty(),
	body('grades.*.courseId').notEmpty(),
	body('grades.*.marks').isInt({ min: 0, max: 100 }),
];

async function submitGrades(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { grades } = req.body;
		const ops = grades.map((g) => ({
			updateOne: {
				filter: { studentId: g.studentId, courseId: g.courseId },
				update: { $set: { marks: g.marks } },
				upsert: true,
			},
		}));
		await Grade.bulkWrite(ops);
		res.status(201).json({ message: 'Grades submitted' });
	} catch (err) {
		next(err);
	}
}

async function viewGrades(req, res, next) {
	try {
		const { courseId } = req.params;
		const records = await Grade.find({ courseId }).populate('studentId', 'name email');
		res.json({ items: records });
	} catch (err) {
		next(err);
	}
}

module.exports = {
	myCourses,
	studentsInCourse,
	attendanceValidators,
	markAttendance,
	viewAttendance,
	gradeValidators,
	submitGrades,
	viewGrades,
};


