const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
    feeType: { 
      type: String, 
      enum: ['tuition', 'hostel', 'transport', 'library', 'exam', 'miscellaneous'], 
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'overdue', 'partial'], 
      default: 'pending' 
    },
    paidAmount: { type: Number, default: 0 },
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'card', 'online', 'bank_transfer', 'cheque'] 
    },
    transactionId: { type: String },
    receiptNumber: { type: String },
    description: { type: String },
    lateFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Index for better query performance
feeSchema.index({ studentId: 1, academicYear: 1, semester: 1 });
feeSchema.index({ status: 1, dueDate: 1 });

// Virtual for remaining amount
feeSchema.virtual('remainingAmount').get(function() {
  return this.amount - this.paidAmount;
});

// Method to check if fee is overdue
feeSchema.methods.isOverdue = function() {
  return this.status === 'pending' && new Date() > this.dueDate;
};

module.exports = mongoose.model('Fee', feeSchema);
