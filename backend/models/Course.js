const mongoose = require('mongoose');

// Material schema for course content
const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['File', 'Link', 'Text'], required: true },
  content: { type: String, required: true }, // File path, URL, or text content
  description: { type: String },
  tags: [{ type: String }],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

// Syllabus node schema for hierarchical syllabus structure
const syllabusNodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  materials: [materialSchema],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusNode' }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusNode', default: null },
  outcomes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningOutcome' }]
});

// Learning outcome schema
const learningOutcomeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assessmentMethods: [{ 
    type: { type: String, enum: ['Quiz', 'Assignment', 'Exam', 'Project', 'Presentation', 'Other'] },
    weight: { type: Number, min: 0, max: 100 }
  }],
  minimumProficiency: { type: Number, min: 0, max: 100, default: 70 }
});

// Syllabus version schema for tracking changes
const syllabusVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changes: [{ 
    type: { type: String, enum: ['Add', 'Update', 'Delete'] },
    path: { type: String },
    description: { type: String }
  }],
  isActive: { type: Boolean, default: false }
});

const courseSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		code: { type: String, required: true, unique: true, uppercase: true, trim: true },
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Enhanced fields for Course Hub
    description: { type: String },
    credits: { type: Number, required: true, default: 3 },
    department: { type: String },
    semester: { type: String },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    corequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    syllabus: [syllabusNodeSchema],
    outcomes: [learningOutcomeSchema],
    syllabusVersions: [syllabusVersionSchema],
    currentSyllabusVersion: { type: Number, default: 1 },
    materials: [materialSchema],
    readinessThreshold: { type: Number, min: 0, max: 100, default: 70 }
	},
	{ timestamps: true }
);

// Method to calculate student readiness for this course
courseSchema.methods.calculateReadiness = async function(studentId) {
  // Get prerequisites
  const prereqs = await this.model('Course').find({ _id: { $in: this.prerequisites } });
  
  if (prereqs.length === 0) {
    return { readinessIndex: 100, missingPrerequisites: [], remedialContent: [] };
  }
  
  // Get student grades for prerequisites
  const grades = await this.model('Grade').find({ 
    studentId,
    courseId: { $in: this.prerequisites }
  });
  
  // Map grades by course
  const gradeMap = {};
  grades.forEach(grade => {
    gradeMap[grade.courseId.toString()] = grade.finalGrade;
  });
  
  // Calculate readiness
  let totalReadiness = 0;
  const missingPrerequisites = [];
  const remedialContent = [];
  
  for (const prereq of prereqs) {
    const prereqId = prereq._id.toString();
    
    if (gradeMap[prereqId]) {
      // Student has taken this prerequisite
      const grade = gradeMap[prereqId];
      const readinessContribution = Math.min(100, (grade / 100) * 100);
      totalReadiness += readinessContribution;
      
      // If grade is below threshold, suggest remedial content
      if (grade < this.readinessThreshold) {
        // Find relevant materials from the prerequisite
        const relevantMaterials = prereq.materials
          .filter(m => m.tags && m.tags.includes('remedial'))
          .map(m => ({
            courseCode: prereq.code,
            courseName: prereq.name,
            material: m
          }));
        
        remedialContent.push(...relevantMaterials);
      }
    } else {
      // Student has not taken this prerequisite
      missingPrerequisites.push({
        courseId: prereq._id,
        code: prereq.code,
        name: prereq.name
      });
    }
  }
  
  // Calculate average readiness
  const readinessIndex = prereqs.length > 0 ? 
    (totalReadiness / prereqs.length) * (1 - (missingPrerequisites.length / prereqs.length)) : 
    100;
  
  return {
    readinessIndex: Math.round(readinessIndex),
    missingPrerequisites,
    remedialContent
  };
};

// Create models
const SyllabusNode = mongoose.model('SyllabusNode', syllabusNodeSchema);
const LearningOutcome = mongoose.model('LearningOutcome', learningOutcomeSchema);
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
module.exports.SyllabusNode = SyllabusNode;
module.exports.LearningOutcome = LearningOutcome;


