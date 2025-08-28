const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Notice = require('../models/Notice');
const { getPaginationParams } = require('../utils/pagination');
const { buildSearchQuery } = require('../utils/query');
const { exportToCSV, exportToExcel, resolveExportPath } = require('../utils/export');
const CalendarEvent = require('../models/CalendarEvent');
const XLSX = require('xlsx');
const fs = require('fs');

async function stats(req, res, next) {
	try {
		const [students, teachers, courses, notices] = await Promise.all([
			User.countDocuments({ role: 'Student' }),
			User.countDocuments({ role: 'Teacher' }),
			Course.countDocuments(),
			Notice.countDocuments(),
		]);
		return res.json({ students, teachers, courses, notices });
	} catch (err) {
		return next(err);
	}
}

async function listUsers(role, req, res, next) {
	try {
		const { page, limit, skip } = getPaginationParams(req.query);
		const searchQuery = buildSearchQuery(req.query.search, ['name', 'email', 'department']);
		const query = { role, ...searchQuery };
		const [items, total] = await Promise.all([
			User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
			User.countDocuments(query),
		]);
		res.json({ items, total, page, limit });
	} catch (err) {
		next(err);
	}
}

function userValidators() {
	return [
		body('name').notEmpty(),
		body('email').isEmail(),
		body('password').optional().isLength({ min: 6 }),
		body('department').optional().isString(),
		body('year').optional().isInt({ min: 1, max: 6 }),
	];
}

async function createUser(role, req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const data = { ...req.body, role };
		const exists = await User.findOne({ email: data.email });
		if (exists) return res.status(409).json({ message: 'Email already exists' });
		const created = await User.create(data);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

async function updateUser(req, res, next) {
	try {
		const { id } = req.params;
		const updates = { ...req.body };
		delete updates.password; // block direct password change here
		const updated = await User.findByIdAndUpdate(id, updates, { new: true });
		if (!updated) return res.status(404).json({ message: 'User not found' });
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

async function deleteUser(req, res, next) {
	try {
		const { id } = req.params;
		const deleted = await User.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ message: 'User not found' });
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
}

async function listCourses(req, res, next) {
	try {
		const { page, limit, skip } = getPaginationParams(req.query);
		const searchQuery = buildSearchQuery(req.query.search, ['name', 'code']);
		const [items, total] = await Promise.all([
			Course.find(searchQuery).populate('teacherId', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 }),
			Course.countDocuments(searchQuery),
		]);
		res.json({ items, total, page, limit });
	} catch (err) {
		next(err);
	}
}

const courseValidators = [
	body('name').notEmpty(),
	body('code').notEmpty(),
	body('teacherId').notEmpty(),
];

async function createCourse(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const exists = await Course.findOne({ code: req.body.code });
		if (exists) return res.status(409).json({ message: 'Course code already exists' });
		const created = await Course.create(req.body);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

async function updateCourse(req, res, next) {
	try {
		const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ message: 'Course not found' });
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

async function deleteCourse(req, res, next) {
	try {
		const deleted = await Course.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: 'Course not found' });
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
}

async function createNotice(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const created = await Notice.create(req.body);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

async function listNotices(req, res, next) {
	try {
		const { page, limit, skip } = getPaginationParams(req.query);
		const filter = {};
		if (req.query.category) filter.category = req.query.category;
		const searchQuery = buildSearchQuery(req.query.search, ['title', 'message', 'category']);
		const query = { ...filter, ...searchQuery };
		const [items, total] = await Promise.all([
			Notice.find(query).skip(skip).limit(limit).sort({ pinned: -1, createdAt: -1 }),
			Notice.countDocuments(query),
		]);
		res.json({ items, total, page, limit });
	} catch (err) {
		next(err);
	}
}

// Analytics
async function studentsPerCourse(req, res, next) {
	try {
		const data = await Course.aggregate([
			{ $project: { name: 1, code: 1, studentsCount: { $size: '$students' } } },
		]);
		res.json({ data });
	} catch (err) {
		next(err);
	}
}

async function attendanceDistribution(req, res, next) {
	try {
		const data = await Attendance.aggregate([
			{ $group: { _id: '$status', count: { $sum: 1 } } },
			{ $project: { status: '$_id', count: 1, _id: 0 } },
		]);
		const total = data.reduce((s, d) => s += d.count, 0) || 1;
		res.json({ data: data.map(d => ({ ...d, percent: Math.round((d.count * 100) / total) })) });
	} catch (err) {
		next(err);
	}
}

async function performanceTrends(req, res, next) {
	try {
		const data = await Grade.aggregate([
			{ $group: { _id: '$courseId', avgMarks: { $avg: '$marks' } } },
			{ $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
			{ $unwind: '$course' },
			{ $project: { course: '$course.name', avgMarks: 1 } },
		]);
		res.json({ data });
	} catch (err) {
		next(err);
	}
}

// New analytics
async function studentsByDepartment(req, res, next) {
	try {
		const data = await User.aggregate([
			{ $match: { role: 'Student' } },
			{ $group: { _id: '$department', count: { $sum: 1 } } },
			{ $project: { department: '$_id', count: 1, _id: 0 } },
			{ $sort: { count: -1 } },
		]);
		res.json({ data });
	} catch (err) { next(err); }
}

async function studentGrowth(req, res, next) {
	try {
		const data = await User.aggregate([
			{ $match: { role: 'Student' } },
			{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
			{ $project: { month: '$_id', count: 1, _id: 0 } },
			{ $sort: { month: 1 } },
		]);
		res.json({ data });
	} catch (err) { next(err); }
}

async function performanceRadial(req, res, next) {
	try {
		const data = await Grade.aggregate([
			{ $group: { _id: null, avg: { $avg: '$marks' }, max: { $max: '$marks' }, min: { $min: '$marks' } } },
			{ $project: { _id: 0, avg: 1, max: 1, min: 1 } },
		]);
		res.json({ data: data[0] || { avg: 0, max: 0, min: 0 } });
	} catch (err) { next(err); }
}

// Exports
async function exportStudents(req, res, next) {
	try {
		const students = await User.find({ role: 'Student' }).lean();
		const records = students.map((s) => ({ id: s._id, name: s.name, email: s.email, department: s.department, year: s.year }));
		if ((req.query.format || '').toLowerCase() === 'excel') {
			const filePath = resolveExportPath('students.xlsx');
			exportToExcel(filePath, [{ name: 'Students', data: records }]);
			return res.download(filePath);
		} else {
			const filePath = resolveExportPath('students.csv');
			await exportToCSV(filePath, [
				{ id: 'id', title: 'ID' },
				{ id: 'name', title: 'Name' },
				{ id: 'email', title: 'Email' },
				{ id: 'department', title: 'Department' },
				{ id: 'year', title: 'Year' },
			], records);
			return res.download(filePath);
		}
	} catch (err) {
		next(err);
	}
}

async function exportAttendance(req, res, next) {
	try {
		const attendance = await Attendance.find().populate('studentId', 'name email').populate('courseId', 'name code').lean();
		const records = attendance.map((a) => ({
			student: a.studentId?.name,
			email: a.studentId?.email,
			course: a.courseId?.name,
			code: a.courseId?.code,
			date: new Date(a.date).toISOString().slice(0, 10),
			status: a.status,
		}));
		const filePath = resolveExportPath('attendance.xlsx');
		exportToExcel(filePath, [{ name: 'Attendance', data: records }]);
		res.download(filePath);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	// stats
	stats,
	// students
	listStudents: (req, res, next) => listUsers('Student', req, res, next),
	createStudent: (req, res, next) => createUser('Student', req, res, next),
	updateUser,
	deleteUser,
	userValidators,
	// teachers
	listTeachers: (req, res, next) => listUsers('Teacher', req, res, next),
	createTeacher: (req, res, next) => createUser('Teacher', req, res, next),
	// courses
	listCourses,
	createCourse,
	updateCourse,
	deleteCourse,
	courseValidators,
	// notices
	createNotice,
	listNotices,
	// analytics
	studentsPerCourse,
	attendanceDistribution,
	performanceTrends,
	studentsByDepartment,
	studentGrowth,
	performanceRadial,
	// exports
	exportStudents,
	exportAttendance,
};

// Additional Admin APIs

async function toggleStudentStatus(req, res, next) {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user || user.role !== 'Student') return res.status(404).json({ message: 'Student not found' });
		user.active = !user.active;
		await user.save();
		res.json({ id: user._id, active: user.active });
	} catch (err) { next(err); }
}

async function importStudentsFromFile(filePath, res, next) {
	try {
		const wb = XLSX.readFile(filePath);
		const ws = wb.Sheets[wb.SheetNames[0]];
		const rows = XLSX.utils.sheet_to_json(ws);
		let created = 0, skipped = 0;
		for (const r of rows) {
			if (!r.email || !r.name || !r.password) { skipped++; continue; }
			const exists = await User.findOne({ email: String(r.email).toLowerCase() });
			if (exists) { skipped++; continue; }
			await User.create({
				name: r.name,
				email: String(r.email).toLowerCase(),
				password: r.password,
				role: 'Student',
				department: r.department || '',
				year: r.year ? Number(r.year) : undefined,
				active: r.active !== undefined ? Boolean(r.active) : true,
			});
			created++;
		}
		return res.json({ created, skipped, total: rows.length });
	} catch (err) { return next(err); }
	finally {
		try { fs.unlinkSync(filePath); } catch (e) {}
	}
}

async function assignCoursesToTeacher(req, res, next) {
	try {
		const { id } = req.params; // teacher id
		const { courseIds } = req.body;
		await Course.updateMany({ _id: { $in: courseIds } }, { $set: { teacherId: id } });
		res.json({ message: 'Courses assigned' });
	} catch (err) { next(err); }
}

async function teacherPerformance(req, res, next) {
	try {
		const { id } = req.params; // teacher id
		const courses = await Course.find({ teacherId: id }).select('_id name');
		const stats = await Grade.aggregate([
			{ $match: { } },
			{ $group: { _id: '$courseId', avg: { $avg: '$marks' } } },
		]);
		const byCourse = courses.map(c => ({ courseId: c._id, course: c.name, avg: (stats.find(s => String(s._id) === String(c._id)) || {}).avg || 0 }));
		res.json({ items: byCourse });
	} catch (err) { next(err); }
}

async function assignStudentsToCourse(req, res, next) {
	try {
		const { id } = req.params; // course id
		const { studentIds } = req.body;
		const updated = await Course.findByIdAndUpdate(id, { $addToSet: { students: { $each: studentIds } } }, { new: true });
		if (!updated) return res.status(404).json({ message: 'Course not found' });
		res.json(updated);
	} catch (err) { next(err); }
}

async function assignTeacherToCourse(req, res, next) {
	try {
		const { id } = req.params; // course id
		const { teacherId } = req.body;
		const updated = await Course.findByIdAndUpdate(id, { $set: { teacherId } }, { new: true });
		if (!updated) return res.status(404).json({ message: 'Course not found' });
		res.json(updated);
	} catch (err) { next(err); }
}

async function updateNotice(req, res, next) {
	try {
		const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ message: 'Notice not found' });
		res.json(updated);
	} catch (err) { next(err); }
}

async function deleteNotice(req, res, next) {
	try {
		const deleted = await Notice.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: 'Notice not found' });
		res.json({ message: 'Deleted' });
	} catch (err) { next(err); }
}

async function pinNotice(req, res, next) {
	try {
		const { id } = req.params;
		const notice = await Notice.findById(id);
		if (!notice) return res.status(404).json({ message: 'Notice not found' });
		notice.pinned = !notice.pinned;
		await notice.save();
		res.json({ id: notice._id, pinned: notice.pinned });
	} catch (err) { next(err); }
}

async function attendanceByDepartment(req, res, next) {
	try {
		const data = await Attendance.aggregate([
			{ $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
			{ $unwind: '$student' },
			{ $group: { _id: { dept: '$student.department', status: '$status' }, count: { $sum: 1 } } },
			{ $group: { _id: '$_id.dept', records: { $push: { status: '$_id.status', count: '$count' } }, total: { $sum: '$count' } } },
			{ $project: { department: '$_id', present: { $sum: { $map: { input: '$records', in: { $cond: [ { $eq: ['$$this.status', 'Present'] }, '$$this.count', 0 ] } } } }, total: 1, _id: 0 } },
			{ $project: { department: 1, percent: { $cond: [ { $gt: ['$total', 0] }, { $round: [ { $multiply: [ { $divide: ['$present', '$total'] }, 100 ] }, 0 ] }, 0 ] } } },
		]);
		res.json({ data });
	} catch (err) { next(err); }
}

async function attendanceByCourse(req, res, next) {
	try {
		const { id } = req.params;
		const data = await Attendance.aggregate([
			{ $match: { courseId: new (require('mongoose').Types.ObjectId)(id) } },
			{ $group: { _id: '$status', count: { $sum: 1 } } },
			{ $project: { status: '$_id', count: 1, _id: 0 } },
		]);
		res.json({ data });
	} catch (err) { next(err); }
}

async function performanceByCourse(req, res, next) {
	try {
		const { id } = req.params;
		const data = await Grade.aggregate([
			{ $match: { courseId: new (require('mongoose').Types.ObjectId)(id) } },
			{ $project: { marks: 1 } },
			{ $group: { _id: null, avg: { $avg: '$marks' }, max: { $max: '$marks' }, min: { $min: '$marks' } } },
			{ $project: { _id: 0, avg: 1, max: 1, min: 1 } },
		]);
		res.json({ data: data[0] || { avg: 0, max: 0, min: 0 } });
	} catch (err) { next(err); }
}

async function performanceByDepartment(req, res, next) {
	try {
		const data = await Grade.aggregate([
			{ $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
			{ $unwind: '$student' },
			{ $group: { _id: '$student.department', avg: { $avg: '$marks' } } },
			{ $project: { department: '$_id', avg: 1, _id: 0 } },
		]);
		res.json({ data });
	} catch (err) { next(err); }
}

// Calendar
async function listCalendar(req, res, next) {
	try { const items = await CalendarEvent.find().sort({ startDate: 1 }); res.json({ items }); } catch (err) { next(err); }
}
async function createCalendar(req, res, next) {
	try { const created = await CalendarEvent.create(req.body); res.status(201).json(created); } catch (err) { next(err); }
}
async function updateCalendar(req, res, next) {
	try { const updated = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!updated) return res.status(404).json({ message: 'Event not found' }); res.json(updated); } catch (err) { next(err); }
}
async function deleteCalendar(req, res, next) {
	try { const deleted = await CalendarEvent.findByIdAndDelete(req.params.id); if (!deleted) return res.status(404).json({ message: 'Event not found' }); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
}

// Admin profile and role management
async function adminProfile(req, res, next) {
	try { const me = await User.findById(req.user.id); res.json({ user: me }); } catch (err) { next(err); }
}
async function updateAdminProfile(req, res, next) {
	try { const updated = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }); res.json(updated); } catch (err) { next(err); }
}
async function addAdmin(req, res, next) {
	try {
		const { name, email, password, department } = req.body;
		const exists = await User.findOne({ email });
		if (exists) return res.status(409).json({ message: 'Email already exists' });
		const created = await User.create({ name, email, password, role: 'Admin', department });
		res.status(201).json(created);
	} catch (err) { next(err); }
}
async function removeAdmin(req, res, next) {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user || user.role !== 'Admin') return res.status(404).json({ message: 'Admin not found' });
		await User.findByIdAndDelete(id);
		res.json({ message: 'Removed' });
	} catch (err) { next(err); }
}

module.exports.toggleStudentStatus = toggleStudentStatus;
module.exports.importStudentsFromFile = importStudentsFromFile;
module.exports.assignCoursesToTeacher = assignCoursesToTeacher;
module.exports.teacherPerformance = teacherPerformance;
module.exports.assignStudentsToCourse = assignStudentsToCourse;
module.exports.assignTeacherToCourse = assignTeacherToCourse;
module.exports.updateNotice = updateNotice;
module.exports.deleteNotice = deleteNotice;
module.exports.pinNotice = pinNotice;
module.exports.attendanceByDepartment = attendanceByDepartment;
module.exports.attendanceByCourse = attendanceByCourse;
module.exports.performanceByCourse = performanceByCourse;
module.exports.performanceByDepartment = performanceByDepartment;
module.exports.listCalendar = listCalendar;
module.exports.createCalendar = createCalendar;
module.exports.updateCalendar = updateCalendar;
module.exports.deleteCalendar = deleteCalendar;
module.exports.adminProfile = adminProfile;
module.exports.updateAdminProfile = updateAdminProfile;
module.exports.addAdmin = addAdmin;
module.exports.removeAdmin = removeAdmin;


