const mongoose = require('mongoose');

const ATTENDANCE_STATUS = ['Present', 'Absent', 'Late', 'Excused', 'On Leave'];

const attendanceSchema = new mongoose.Schema(
	{
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
		classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
		sessionId: { type: String },
		date: { type: Date, required: true },
		status: { type: String, enum: ATTENDANCE_STATUS, required: true },
		lateMins: { type: Number, default: 0 },
		markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		markedMethod: { type: String, enum: ['Manual', 'Biometric', 'API', 'Backfill'], default: 'Manual' },
		justification: { type: String },
		approved: { type: Boolean, default: true },
		approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		approvalDate: { type: Date },
		trustScore: { type: Number, min: 0, max: 100, default: 100 },
		anomalyFlag: { type: Boolean, default: false },
		anomalyReason: { type: String },
	},
	{ timestamps: true }
);

attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, courseId: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ anomalyFlag: 1 });

// Static method to calculate trust score
attendanceSchema.statics.calculateTrustScore = async function(studentId, fromDate, toDate) {
	const attendances = await this.find({
		studentId,
		date: { $gte: fromDate, $lte: toDate }
	});
	
	if (attendances.length === 0) return 100;
	
	// Calculate presence score (% of days present)
	const presentCount = attendances.filter(a => a.status === 'Present').length;
	const presenceScore = (presentCount / attendances.length) * 100;
	
	// Calculate punctuality score (inverse of average lateness)
	const lateAttendances = attendances.filter(a => a.status === 'Late');
	let punctualityScore = 100;
	if (lateAttendances.length > 0) {
		const avgLateMins = lateAttendances.reduce((sum, a) => sum + a.lateMins, 0) / lateAttendances.length;
		punctualityScore = Math.max(0, 100 - (avgLateMins * 5)); // Deduct 5 points per minute late
	}
	
	// Calculate anomaly score (deduct for anomalies)
	const anomalyCount = attendances.filter(a => a.anomalyFlag).length;
	const anomalyScore = Math.max(0, 100 - (anomalyCount * 20)); // Deduct 20 points per anomaly
	
	// Weighted average
	return Math.round((presenceScore * 0.5) + (punctualityScore * 0.3) + (anomalyScore * 0.2));
};

module.exports = mongoose.model('Attendance', attendanceSchema);
module.exports.ATTENDANCE_STATUS = ATTENDANCE_STATUS;


