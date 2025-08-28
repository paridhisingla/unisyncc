const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		message: { type: String, required: true },
		category: { type: String, trim: true },
		createdAt: { type: Date, default: Date.now },
		pinned: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);


