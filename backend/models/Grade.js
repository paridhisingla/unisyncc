const mongoose = require('mongoose');

// Schema for individual assessment components
const assessmentComponentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Quiz', 'Assignment', 'MidTerm', 'FinalExam', 'Project', 'Presentation', 'Participation', 'Other'],
    required: true
  },
  maxMarks: { type: Number, required: true },
  weightage: { type: Number, required: true, min: 0, max: 100 },
  obtainedMarks: { type: Number, default: 0 },
  submissionDate: { type: Date },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date },
  feedback: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Submitted', 'Late', 'Graded', 'Disputed', 'Resolved'],
    default: 'Pending'
  },
  outcomeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningOutcome' }
});

// Schema for grade appeals
const gradeAppealSchema = new mongoose.Schema({
  componentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Resolved'],
    default: 'Pending'
  },
  originalMarks: { type: Number, required: true },
  requestedMarks: { type: Number, required: true },
  resolvedMarks: { type: Number },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  comments: { type: String }
}, { timestamps: true });

const gradeSchema = new mongoose.Schema(
	{
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
    components: [assessmentComponentSchema],
    finalGrade: { type: Number },
    letterGrade: { type: String },
    gradePoints: { type: Number },
    isPublished: { type: Boolean, default: false },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
    appeals: [gradeAppealSchema],
    comments: { type: String },
    lastUpdated: { type: Date, default: Date.now }
	},
	{ timestamps: true }
);

// Create a compound index for student and course
gradeSchema.index({ studentId: 1, courseId: 1, academicYear: 1, semester: 1 }, { unique: true });

// Method to calculate final grade
gradeSchema.methods.calculateFinalGrade = function() {
  if (!this.components || this.components.length === 0) {
    return 0;
  }
  
  let totalWeightedScore = 0;
  let totalWeightage = 0;
  
  this.components.forEach(component => {
    if (component.status === 'Graded' || component.status === 'Resolved') {
      const percentageScore = (component.obtainedMarks / component.maxMarks) * 100;
      const weightedScore = percentageScore * (component.weightage / 100);
      totalWeightedScore += weightedScore;
      totalWeightage += component.weightage;
    }
  });
  
  // If no components are graded yet or total weightage is 0
  if (totalWeightage === 0) {
    return 0;
  }
  
  // Scale the score based on the total weightage processed
  const scaledScore = (totalWeightedScore / totalWeightage) * 100;
  return Math.round(scaledScore * 100) / 100; // Round to 2 decimal places
};

// Method to assign letter grade based on final grade
gradeSchema.methods.assignLetterGrade = function(gradeScale) {
  const finalGrade = this.calculateFinalGrade();
  this.finalGrade = finalGrade;
  
  // Default grade scale if not provided
  const defaultGradeScale = [
    { min: 90, letter: 'A', points: 4.0 },
    { min: 80, letter: 'B', points: 3.0 },
    { min: 70, letter: 'C', points: 2.0 },
    { min: 60, letter: 'D', points: 1.0 },
    { min: 0, letter: 'F', points: 0.0 }
  ];
  
  const scale = gradeScale || defaultGradeScale;
  
  // Find the appropriate grade
  for (const grade of scale) {
    if (finalGrade >= grade.min) {
      this.letterGrade = grade.letter;
      this.gradePoints = grade.points;
      break;
    }
  }
  
  return {
    finalGrade: this.finalGrade,
    letterGrade: this.letterGrade,
    gradePoints: this.gradePoints
  };
};

// Static method to calculate GPA for a student
gradeSchema.statics.calculateGPA = async function(studentId, academicYear, semester) {
  const filter = { 
    studentId,
    isPublished: true
  };
  
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;
  
  const grades = await this.find(filter)
    .populate('courseId', 'credits');
  
  if (grades.length === 0) {
    return {
      gpa: 0,
      totalCredits: 0,
      coursesCount: 0
    };
  }
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  grades.forEach(grade => {
    if (grade.gradePoints !== undefined && grade.courseId && grade.courseId.credits) {
      totalPoints += grade.gradePoints * grade.courseId.credits;
      totalCredits += grade.courseId.credits;
    }
  });
  
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  
  return {
    gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
    totalCredits,
    coursesCount: grades.length
  };
};

// Static method to get grade distribution for a course
gradeSchema.statics.getGradeDistribution = async function(courseId, academicYear, semester) {
  const filter = { 
    courseId,
    isPublished: true
  };
  
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;
  
  const grades = await this.find(filter);
  
  const distribution = {
    A: 0, B: 0, C: 0, D: 0, F: 0,
    totalStudents: grades.length,
    averageGrade: 0
  };
  
  let totalGrade = 0;
  
  grades.forEach(grade => {
    if (grade.letterGrade) {
      // Count by first letter only (A includes A+, A-, etc.)
      const letterGradeBase = grade.letterGrade.charAt(0);
      distribution[letterGradeBase] = (distribution[letterGradeBase] || 0) + 1;
    }
    
    if (grade.finalGrade !== undefined) {
      totalGrade += grade.finalGrade;
    }
  });
  
  distribution.averageGrade = grades.length > 0 ? 
    Math.round((totalGrade / grades.length) * 100) / 100 : 0;
  
  return distribution;
};

module.exports = mongoose.model('Grade', gradeSchema);


