const mongoose = require('mongoose');

const userAuditSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['Create', 'Update', 'Delete', 'Login', 'Logout', 'PasswordChange', 'ConsentChange'], required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    details: { type: Object },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

// Index for faster queries
userAuditSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserAudit', userAuditSchema);