require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const peopleOpsRoutes = require('./routes/peopleOpsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const courseRoutes = require('./routes/courseRoutes');
const examRoutes = require('./routes/examRoutes');
const financeRoutes = require('./routes/financeRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('dev'));
}

// Health
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Debug route module types
console.log('Route module types:', {
	authRoutes: typeof authRoutes,
	adminRoutes: typeof adminRoutes,
	teacherRoutes: typeof teacherRoutes,
	studentRoutes: typeof studentRoutes,
	peopleOpsRoutes: typeof peopleOpsRoutes,
	attendanceRoutes: typeof attendanceRoutes,
	timetableRoutes: typeof timetableRoutes,
	courseRoutes: typeof courseRoutes,
	examRoutes: typeof examRoutes,
	financeRoutes: typeof financeRoutes,
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use('/people', peopleOpsRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/timetable', timetableRoutes);
app.use('/courses', courseRoutes);
app.use('/exams', examRoutes);
app.use('/finance', financeRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_db';
const connectDB = require('./config/db');

connectDB(MONGO_URI).then(() => {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;


