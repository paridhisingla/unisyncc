const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    complainantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    complainantType: { type: String, enum: ['student', 'teacher', 'staff', 'parent'], required: true },
    category: { 
      type: String, 
      enum: ['academic', 'hostel', 'transport', 'library', 'canteen', 'infrastructure', 'harassment', 'other'], 
      required: true 
    },
    subcategory: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    attachments: [{ 
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String
    }],
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'resolved', 'closed', 'rejected'], 
      default: 'open' 
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedDate: { type: Date },
    expectedResolutionDate: { type: Date },
    actualResolutionDate: { type: Date },
    resolutionNotes: { type: String },
    satisfactionRating: { type: Number, min: 1, max: 5 },
    satisfactionFeedback: { type: String },
    isAnonymous: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    tags: [{ type: String }],
    relatedComplaints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }]
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorType: { type: String, enum: ['complainant', 'staff', 'admin'], required: true },
    content: { type: String, required: true },
    attachments: [{ 
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String
    }],
    isInternal: { type: Boolean, default: false }, // Internal notes not visible to complainant
    isSystemGenerated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes
complaintSchema.index({ ticketId: 1 });
complaintSchema.index({ complainantId: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ priority: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });
commentSchema.index({ complaintId: 1, createdAt: -1 });

// Pre-save middleware to generate ticket ID
complaintSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketId) {
    const count = await mongoose.model('Complaint').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.ticketId = `CMP-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for days since creation
complaintSchema.virtual('daysSinceCreation').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
complaintSchema.virtual('isOverdue').get(function() {
  if (!this.expectedResolutionDate || this.status === 'resolved' || this.status === 'closed') {
    return false;
  }
  return new Date() > this.expectedResolutionDate;
});

// Method to calculate resolution time
complaintSchema.methods.getResolutionTime = function() {
  if (!this.actualResolutionDate) return null;
  
  const created = new Date(this.createdAt);
  const resolved = new Date(this.actualResolutionDate);
  const diffInHours = Math.floor((resolved - created) / (1000 * 60 * 60));
  
  if (diffInHours < 24) return `${diffInHours} hours`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days`;
};

// Method to set expected resolution date based on priority
complaintSchema.methods.setExpectedResolutionDate = function() {
  const now = new Date();
  let daysToAdd = 7; // default
  
  switch (this.priority) {
    case 'urgent':
      daysToAdd = 1;
      break;
    case 'high':
      daysToAdd = 3;
      break;
    case 'medium':
      daysToAdd = 7;
      break;
    case 'low':
      daysToAdd = 14;
      break;
  }
  
  this.expectedResolutionDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
};

const Complaint = mongoose.model('Complaint', complaintSchema);
const ComplaintComment = mongoose.model('ComplaintComment', commentSchema);

module.exports = { Complaint, ComplaintComment };
