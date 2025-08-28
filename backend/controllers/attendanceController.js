const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { paginateResults } = require('../utils/pagination');
const { exportToPdf, exportToCsv } = require('../utils/export');
const mongoose = require('mongoose');

// Mark attendance for a class session
exports.markAttendance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { classId, sessionId, entries } = req.body;
    
    if (!classId || !sessionId || !entries || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const results = [];
    const date = new Date();
    
    for (const entry of entries) {
      const { studentId, status, lateMins = 0 } = entry;
      
      // Find existing attendance record
      let attendance = await Attendance.findOne({
        studentId,
        classId,
        sessionId,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        }
      });
      
      if (attendance) {
        // Update existing record
        attendance.status = status;
        attendance.lateMins = lateMins;
        attendance.markedBy = req.user._id;
        attendance.markedMethod = 'Manual';
        attendance = await attendance.save({ session });
      } else {
        // Create new record
        attendance = await Attendance.create([{
          studentId,
          courseId: req.body.courseId,
          classId,
          sessionId,
          date,
          status,
          lateMins,
          markedBy: req.user._id,
          markedMethod: 'Manual'
        }], { session });
        attendance = attendance[0];
      }
      
      results.push(attendance);
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: `Attendance marked for ${results.length} students`,
      results
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Get attendance summary for a class
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { classId, from, to } = req.query;
    
    if (!classId || !from || !to) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Get all attendance records for the class in the date range
    const attendanceRecords = await Attendance.find({
      classId,
      date: { $gte: fromDate, $lte: toDate }
    }).populate('studentId', 'name email');
    
    // Group by student
    const studentMap = {};
    
    attendanceRecords.forEach(record => {
      const studentId = record.studentId._id.toString();
      
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: {
            id: studentId,
            name: record.studentId.name,
            email: record.studentId.email
          },
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          onLeave: 0,
          total: 0,
          trustScore: 0,
          lateMins: 0
        };
      }
      
      studentMap[studentId].total++;
      
      switch (record.status) {
        case 'Present':
          studentMap[studentId].present++;
          break;
        case 'Absent':
          studentMap[studentId].absent++;
          break;
        case 'Late':
          studentMap[studentId].late++;
          studentMap[studentId].lateMins += record.lateMins;
          break;
        case 'Excused':
          studentMap[studentId].excused++;
          break;
        case 'On Leave':
          studentMap[studentId].onLeave++;
          break;
      }
    });
    
    // Calculate trust scores
    for (const studentId in studentMap) {
      studentMap[studentId].trustScore = await Attendance.calculateTrustScore(
        studentId,
        fromDate,
        toDate
      );
    }
    
    // Convert to array
    const summary = Object.values(studentMap);
    
    // Calculate class statistics
    const totalStudents = summary.length;
    const totalSessions = summary.length > 0 ? summary[0].total : 0;
    const averageTrustScore = summary.reduce((sum, s) => sum + s.trustScore, 0) / (totalStudents || 1);
    const averageAttendance = summary.reduce((sum, s) => sum + (s.present / s.total), 0) / (totalStudents || 1) * 100;
    
    res.status(200).json({
      summary,
      stats: {
        totalStudents,
        totalSessions,
        averageTrustScore,
        averageAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance anomalies
exports.getAttendanceAnomalies = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Find anomalies
    const anomalies = await Attendance.find({
      date: { $gte: fromDate, $lte: toDate },
      anomalyFlag: true
    }).populate('studentId', 'name email')
      .populate('courseId', 'name code')
      .populate('markedBy', 'name role');
    
    // Group by type
    const massBunkAnomalies = [];
    const individualAnomalies = [];
    
    anomalies.forEach(anomaly => {
      if (anomaly.anomalyReason && anomaly.anomalyReason.includes('Mass Bunk')) {
        massBunkAnomalies.push(anomaly);
      } else {
        individualAnomalies.push(anomaly);
      }
    });
    
    res.status(200).json({
      totalAnomalies: anomalies.length,
      massBunkAnomalies,
      individualAnomalies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Detect mass bunk
exports.detectMassBunk = async (req, res) => {
  try {
    const { classId, sessionId, date, threshold = 0.7 } = req.body;
    
    if (!classId || !sessionId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const sessionDate = date ? new Date(date) : new Date();
    
    // Get all attendance records for the session
    const attendanceRecords = await Attendance.find({
      classId,
      sessionId,
      date: {
        $gte: new Date(sessionDate.setHours(0, 0, 0, 0)),
        $lt: new Date(sessionDate.setHours(23, 59, 59, 999))
      }
    });
    
    // Get total students in the class
    const totalStudents = await User.countDocuments({ role: 'Student' });
    
    // Calculate absent percentage
    const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
    const absentPercentage = absentCount / totalStudents;
    
    const isMassBunk = absentPercentage >= threshold;
    
    if (isMassBunk) {
      // Flag all absent records as anomalies
      await Attendance.updateMany(
        {
          classId,
          sessionId,
          date: {
            $gte: new Date(sessionDate.setHours(0, 0, 0, 0)),
            $lt: new Date(sessionDate.setHours(23, 59, 59, 999))
          },
          status: 'Absent'
        },
        {
          $set: {
            anomalyFlag: true,
            anomalyReason: 'Mass Bunk Detected'
          }
        }
      );
    }
    
    res.status(200).json({
      isMassBunk,
      absentPercentage,
      absentCount,
      totalStudents,
      threshold
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Backfill attendance with justification
exports.backfillAttendance = async (req, res) => {
  try {
    const { studentId, classId, sessionId, date, status, justification } = req.body;
    
    if (!studentId || !classId || !sessionId || !date || !status || !justification) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Find existing attendance record
    let attendance = await Attendance.findOne({
      studentId,
      classId,
      sessionId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
    });
    
    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.justification = justification;
      attendance.markedMethod = 'Backfill';
      attendance.markedBy = req.user._id;
      attendance.approved = false; // Requires approval
      
      await attendance.save();
    } else {
      // Create new record
      attendance = await Attendance.create({
        studentId,
        courseId: req.body.courseId,
        classId,
        sessionId,
        date: new Date(date),
        status,
        justification,
        markedMethod: 'Backfill',
        markedBy: req.user._id,
        approved: false // Requires approval
      });
    }
    
    res.status(200).json({
      message: 'Attendance backfilled successfully, pending approval',
      attendance
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve backfilled attendance
exports.approveBackfill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    if (attendance.markedMethod !== 'Backfill') {
      return res.status(400).json({ message: 'This is not a backfilled record' });
    }
    
    attendance.approved = true;
    attendance.approvedBy = req.user._id;
    attendance.approvalDate = new Date();
    
    await attendance.save();
    
    res.status(200).json({
      message: 'Backfilled attendance approved',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Import attendance from biometric/API
exports.importAttendance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { source, data } = req.body;
    
    if (!source || !data || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const results = [];
    
    for (const entry of data) {
      const { studentId, classId, sessionId, date, status, lateMins = 0 } = entry;
      
      if (!studentId || !classId || !sessionId || !date || !status) {
        continue; // Skip invalid entries
      }
      
      // Find existing attendance record
      let attendance = await Attendance.findOne({
        studentId,
        classId,
        sessionId,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
        }
      });
      
      if (attendance) {
        // Update existing record
        attendance.status = status;
        attendance.lateMins = lateMins;
        attendance.markedMethod = source === 'biometric' ? 'Biometric' : 'API';
        attendance = await attendance.save({ session });
      } else {
        // Create new record
        attendance = await Attendance.create([{
          studentId,
          courseId: entry.courseId,
          classId,
          sessionId,
          date: new Date(date),
          status,
          lateMins,
          markedMethod: source === 'biometric' ? 'Biometric' : 'API'
        }], { session });
        attendance = attendance[0];
      }
      
      results.push(attendance);
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: `${results.length} attendance records imported from ${source}`,
      results
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Get class roster
exports.getClassRoster = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }
    
    // Get all students in the class
    const students = await User.find({ role: 'Student' }, 'name email program year');
    
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export attendance
exports.exportAttendance = async (req, res) => {
  try {
    const { classId, from, to, format } = req.query;
    
    if (!classId || !from || !to || !format) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Get attendance data
    const attendanceData = await Attendance.find({
      classId,
      date: { $gte: fromDate, $lte: toDate }
    }).populate('studentId', 'name email')
      .populate('courseId', 'name code')
      .sort('date');
    
    // Format data for export
    const exportData = attendanceData.map(record => ({
      Date: record.date.toISOString().split('T')[0],
      Student: record.studentId.name,
      Email: record.studentId.email,
      Course: record.courseId ? record.courseId.name : 'N/A',
      CourseCode: record.courseId ? record.courseId.code : 'N/A',
      Status: record.status,
      LateMins: record.lateMins || 0,
      Method: record.markedMethod
    }));
    
    let result;
    
    if (format.toLowerCase() === 'pdf') {
      result = await exportToPdf(exportData, 'Attendance Report', {
        watermark: 'UniSync Attendance',
        footer: `Generated on ${new Date().toISOString()} | Authorized by ${req.user.name}`
      });
    } else {
      result = await exportToCsv(exportData, 'attendance_report');
    }
    
    res.status(200).json({
      message: `Attendance exported to ${format}`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { from, to } = req.query;
    
    if (!studentId || !from || !to) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Get attendance records
    const attendanceRecords = await Attendance.find({
      studentId,
      date: { $gte: fromDate, $lte: toDate }
    }).populate('courseId', 'name code')
      .sort('date');
    
    // Calculate trust score
    const trustScore = await Attendance.calculateTrustScore(studentId, fromDate, toDate);
    
    // Calculate statistics
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'Present').length;
    const absent = attendanceRecords.filter(r => r.status === 'Absent').length;
    const late = attendanceRecords.filter(r => r.status === 'Late').length;
    const excused = attendanceRecords.filter(r => r.status === 'Excused').length;
    const onLeave = attendanceRecords.filter(r => r.status === 'On Leave').length;
    
    const presentPercentage = (present / total) * 100;
    const absentPercentage = (absent / total) * 100;
    const latePercentage = (late / total) * 100;
    
    res.status(200).json({
      records: attendanceRecords,
      stats: {
        total,
        present,
        absent,
        late,
        excused,
        onLeave,
        presentPercentage,
        absentPercentage,
        latePercentage,
        trustScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};