const mongoose = require('mongoose');

// Fee Structure Schema
const feeStructureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  category: { type: String, enum: ['Tuition', 'Accommodation', 'Library', 'Laboratory', 'Sports', 'Other'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  dueDate: { type: Date, required: true },
  latePaymentFee: { type: Number, default: 0 },
  description: { type: String },
  applicableTo: {
    department: { type: String },
    program: { type: String },
    year: { type: String }
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Payment Schema
const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Bank Transfer', 'Online Payment', 'Scholarship', 'Waiver', 'Other'], required: true },
  transactionId: { type: String },
  receiptNumber: { type: String },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  notes: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  items: [{
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number },
  status: { type: String, enum: ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'], default: 'Draft' },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Financial Aid Schema
const financialAidSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String },
  type: { type: String, enum: ['Scholarship', 'Grant', 'Loan', 'Waiver', 'Work Study', 'Other'], required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['Applied', 'Approved', 'Rejected', 'Disbursed', 'Terminated'], default: 'Applied' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: { type: Date },
  disbursementSchedule: [{
    date: { type: Date },
    amount: { type: Number },
    status: { type: String, enum: ['Scheduled', 'Disbursed', 'Delayed', 'Cancelled'], default: 'Scheduled' }
  }],
  documents: [{
    name: { type: String },
    fileUrl: { type: String },
    uploadDate: { type: Date, default: Date.now }
  }],
  notes: { type: String }
}, { timestamps: true });

// Budget Schema
const budgetSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  department: { type: String, required: true },
  category: { type: String, required: true },
  allocatedAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  expenses: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  remainingAmount: { type: Number },
  status: { type: String, enum: ['Active', 'Exhausted', 'Closed'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Pre-save middleware for Invoice to calculate balance
invoiceSchema.pre('save', function(next) {
  this.balance = this.total - this.amountPaid;
  
  // Update status based on payment
  if (this.balance <= 0) {
    this.status = 'Paid';
  } else if (this.amountPaid > 0) {
    this.status = 'Partially Paid';
  } else if (this.dueDate < new Date() && this.status !== 'Paid') {
    this.status = 'Overdue';
  }
  
  next();
});

// Pre-save middleware for Budget to calculate remaining amount
budgetSchema.pre('save', function(next) {
  const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  this.remainingAmount = this.allocatedAmount - totalExpenses;
  
  if (this.remainingAmount <= 0) {
    this.status = 'Exhausted';
  }
  
  next();
});

// Create models
const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const FinancialAid = mongoose.model('FinancialAid', financialAidSchema);
const Budget = mongoose.model('Budget', budgetSchema);

module.exports = {
  FeeStructure,
  Payment,
  Invoice,
  FinancialAid,
  Budget
};