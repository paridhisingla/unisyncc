const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, unique: true, sparse: true },
    category: { type: String, required: true },
    publisher: { type: String },
    publishedYear: { type: Number },
    edition: { type: String },
    language: { type: String, default: 'English' },
    totalCopies: { type: Number, required: true, min: 1 },
    availableCopies: { type: Number, required: true, min: 0 },
    location: { type: String }, // Shelf location
    description: { type: String },
    price: { type: Number, min: 0 },
    status: { 
      type: String, 
      enum: ['active', 'damaged', 'lost', 'maintenance'], 
      default: 'active' 
    }
  },
  { timestamps: true }
);

const issueSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: { 
      type: String, 
      enum: ['issued', 'returned', 'overdue', 'lost'], 
      default: 'issued' 
    },
    fineAmount: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

// Indexes
bookSchema.index({ title: 'text', author: 'text', category: 1 });
issueSchema.index({ studentId: 1, status: 1 });
issueSchema.index({ dueDate: 1, status: 1 });

// Virtual for issued copies
bookSchema.virtual('issuedCopies').get(function() {
  return this.totalCopies - this.availableCopies;
});

// Method to check availability
bookSchema.methods.isAvailable = function() {
  return this.availableCopies > 0 && this.status === 'active';
};

// Method to calculate fine
issueSchema.methods.calculateFine = function() {
  if (this.status === 'returned' || !this.dueDate) return 0;
  
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  
  if (today <= dueDate) return 0;
  
  const overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
  return overdueDays * 2; // ₹2 per day fine
};

const Book = mongoose.model('Book', bookSchema);
const LibraryIssue = mongoose.model('LibraryIssue', issueSchema);

module.exports = { Book, LibraryIssue };
