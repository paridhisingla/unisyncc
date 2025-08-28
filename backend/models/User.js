const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const USER_ROLES = ['Admin', 'Teacher', 'Student'];
const RISK_LEVELS = ['None', 'Low', 'Medium', 'High'];

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  dateAwarded: { type: Date, default: Date.now },
  category: { type: String, enum: ['Academic', 'Sports', 'Leadership', 'Community', 'Other'] }
});

const sentimentPulseSchema = new mongoose.Schema({
  value: { type: Number, min: 1, max: 5, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const relationshipSchema = new mongoose.Schema({
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relationshipType: { type: String, enum: ['Mentor', 'Mentee', 'Colleague', 'Family', 'Other'] },
  strength: { type: Number, min: 1, max: 10 }
});

const consentSchema = new mongoose.Schema({
  purpose: { type: String, required: true },
  granted: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  details: { type: String }
});

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, minlength: 6, select: false },
		role: { type: String, enum: USER_ROLES, default: 'Student', required: true },
		department: { type: String, trim: true },
		year: { type: Number, min: 1, max: 6 },
		active: { type: Boolean, default: true },
    // Enhanced People Ops fields
    profileImage: { type: String },
    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
    address: { type: String },
    dateOfBirth: { type: Date },
    program: { type: String },
    riskLevel: { type: String, enum: RISK_LEVELS, default: 'None' },
    duesStatus: { type: Boolean, default: false },
    badges: [badgeSchema],
    sentimentPulse: [sentimentPulseSchema],
    relationships: [relationshipSchema],
    consents: [consentSchema],
    achievements: [{ type: String }],
    skills: [{ type: String }],
    notes: [{ 
      text: { type: String },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now }
    }],
    lastLogin: { type: Date },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	const saltRounds = 10;
	this.password = await bcrypt.hash(this.password, saltRounds);
	return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.USER_ROLES = USER_ROLES;
module.exports.RISK_LEVELS = RISK_LEVELS;


