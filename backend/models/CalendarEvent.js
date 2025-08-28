const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String },
		type: { type: String, enum: ['Holiday', 'Exam', 'Event'], default: 'Event' },
		startDate: { type: Date, required: true },
		endDate: { type: Date, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);


