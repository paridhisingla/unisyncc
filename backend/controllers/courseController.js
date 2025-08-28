const Course = require('../models/Course');
const { SyllabusNode, LearningOutcome } = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

// Helper function to validate course data
const validateCourseData = (data) => {
  const errors = [];
  if (!data.name) errors.push('Course name is required');
  if (!data.code) errors.push('Course code is required');
  if (!data.teacherId) errors.push('Teacher ID is required');
  if (!data.credits) errors.push('Credits are required');
  
  return errors;
};

// Get all courses with filtering and pagination
exports.getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      department, 
      semester, 
      teacherId,
      search 
    } = req.query;
    
    // Build filter
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (teacherId) filter.teacherId = teacherId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const courses = await Course.find(filter)
      .populate('teacherId', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ code: 1 });
    
    // Get total count
    const total = await Course.countDocuments(filter);
    
    res.status(200).json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// Get course by ID with full details
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id)
      .populate('teacherId', 'firstName lastName email')
      .populate('prerequisites', 'name code')
      .populate('corequisites', 'name code')
      .populate({
        path: 'students',
        select: 'firstName lastName email studentId'
      });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const courseData = req.body;
    
    // Validate course data
    const errors = validateCourseData(courseData);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: courseData.code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    
    // Check if teacher exists
    const teacher = await User.findById(courseData.teacherId);
    if (!teacher) {
      return res.status(400).json({ message: 'Teacher not found' });
    }
    
    // Create course
    const course = new Course(courseData);
    await course.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({ 
      message: 'Course created successfully', 
      course 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // If code is being updated, check for uniqueness
    if (updateData.code && updateData.code !== course.code) {
      const existingCourse = await Course.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (existingCourse) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
    }
    
    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      message: 'Course updated successfully', 
      course: updatedCourse 
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is a prerequisite for other courses
    const dependentCourses = await Course.find({ 
      $or: [
        { prerequisites: id },
        { corequisites: id }
      ]
    });
    
    if (dependentCourses.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course as it is a prerequisite or corequisite for other courses',
        dependentCourses: dependentCourses.map(c => ({ id: c._id, name: c.name, code: c.code }))
      });
    }
    
    // Delete course
    await Course.findByIdAndDelete(id, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

// Add students to a course
exports.enrollStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs are required' });
    }
    
    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Verify all students exist
    const students = await User.find({ 
      _id: { $in: studentIds },
      role: 'student'
    });
    
    if (students.length !== studentIds.length) {
      return res.status(400).json({ 
        message: 'One or more student IDs are invalid or not students' 
      });
    }
    
    // Add students to course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );
    
    res.status(200).json({ 
      message: 'Students enrolled successfully', 
      course: updatedCourse 
    });
  } catch (error) {
    console.error('Error enrolling students:', error);
    res.status(500).json({ message: 'Error enrolling students', error: error.message });
  }
};

// Remove students from a course
exports.unenrollStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs are required' });
    }
    
    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove students from course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $pullAll: { students: studentIds } },
      { new: true }
    );
    
    res.status(200).json({ 
      message: 'Students unenrolled successfully', 
      course: updatedCourse 
    });
  } catch (error) {
    console.error('Error unenrolling students:', error);
    res.status(500).json({ message: 'Error unenrolling students', error: error.message });
  }
};

// Get enrolled students for a course
exports.getEnrolledStudents = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id)
      .populate({
        path: 'students',
        select: 'firstName lastName email studentId'
      });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(200).json({
      courseCode: course.code,
      courseName: course.name,
      students: course.students
    });
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ message: 'Error fetching enrolled students', error: error.message });
  }
};

// SYLLABUS MANAGEMENT

// Add or update syllabus node
exports.manageSyllabusNode = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId } = req.params;
    const nodeData = req.body;
    const { nodeId } = req.query; // If updating existing node
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    let updatedCourse;
    let message;
    
    if (nodeId) {
      // Update existing node
      const nodeIndex = course.syllabus.findIndex(node => node._id.toString() === nodeId);
      
      if (nodeIndex === -1) {
        return res.status(404).json({ message: 'Syllabus node not found' });
      }
      
      // Update node
      course.syllabus[nodeIndex] = { 
        ...course.syllabus[nodeIndex].toObject(), 
        ...nodeData,
        _id: course.syllabus[nodeIndex]._id // Preserve ID
      };
      
      message = 'Syllabus node updated successfully';
    } else {
      // Create new node
      const newNode = {
        ...nodeData,
        _id: new mongoose.Types.ObjectId()
      };
      
      course.syllabus.push(newNode);
      message = 'Syllabus node added successfully';
    }
    
    // Create a new syllabus version
    const newVersion = {
      version: course.currentSyllabusVersion + 1,
      createdAt: new Date(),
      createdBy: req.user._id,
      changes: [{
        type: nodeId ? 'Update' : 'Add',
        path: nodeId ? `syllabus.${nodeId}` : 'syllabus.new',
        description: nodeId ? 'Updated syllabus node' : 'Added new syllabus node'
      }],
      isActive: true
    };
    
    // Update previous active version
    if (course.syllabusVersions && course.syllabusVersions.length > 0) {
      const activeVersionIndex = course.syllabusVersions.findIndex(v => v.isActive);
      if (activeVersionIndex !== -1) {
        course.syllabusVersions[activeVersionIndex].isActive = false;
      }
    }
    
    course.syllabusVersions.push(newVersion);
    course.currentSyllabusVersion += 1;
    
    // Save course
    await course.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    // Get updated course
    updatedCourse = await Course.findById(courseId);
    
    res.status(200).json({
      message,
      syllabus: updatedCourse.syllabus,
      currentVersion: updatedCourse.currentSyllabusVersion
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error managing syllabus node:', error);
    res.status(500).json({ message: 'Error managing syllabus node', error: error.message });
  }
};

// Delete syllabus node
exports.deleteSyllabusNode = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId, nodeId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find node index
    const nodeIndex = course.syllabus.findIndex(node => node._id.toString() === nodeId);
    
    if (nodeIndex === -1) {
      return res.status(404).json({ message: 'Syllabus node not found' });
    }
    
    // Remove node
    course.syllabus.splice(nodeIndex, 1);
    
    // Create a new syllabus version
    const newVersion = {
      version: course.currentSyllabusVersion + 1,
      createdAt: new Date(),
      createdBy: req.user._id,
      changes: [{
        type: 'Delete',
        path: `syllabus.${nodeId}`,
        description: 'Deleted syllabus node'
      }],
      isActive: true
    };
    
    // Update previous active version
    if (course.syllabusVersions && course.syllabusVersions.length > 0) {
      const activeVersionIndex = course.syllabusVersions.findIndex(v => v.isActive);
      if (activeVersionIndex !== -1) {
        course.syllabusVersions[activeVersionIndex].isActive = false;
      }
    }
    
    course.syllabusVersions.push(newVersion);
    course.currentSyllabusVersion += 1;
    
    // Save course
    await course.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: 'Syllabus node deleted successfully',
      syllabus: course.syllabus,
      currentVersion: course.currentSyllabusVersion
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error deleting syllabus node:', error);
    res.status(500).json({ message: 'Error deleting syllabus node', error: error.message });
  }
};

// Get syllabus versions
exports.getSyllabusVersions = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .select('code name syllabusVersions currentSyllabusVersion');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(200).json({
      courseCode: course.code,
      courseName: course.name,
      versions: course.syllabusVersions,
      currentVersion: course.currentSyllabusVersion
    });
  } catch (error) {
    console.error('Error fetching syllabus versions:', error);
    res.status(500).json({ message: 'Error fetching syllabus versions', error: error.message });
  }
};

// Activate a specific syllabus version
exports.activateSyllabusVersion = async (req, res) => {
  try {
    const { courseId, versionNumber } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find version
    const versionIndex = course.syllabusVersions.findIndex(v => v.version === parseInt(versionNumber));
    
    if (versionIndex === -1) {
      return res.status(404).json({ message: 'Syllabus version not found' });
    }
    
    // Update active versions
    course.syllabusVersions.forEach((version, index) => {
      version.isActive = index === versionIndex;
    });
    
    // Save course
    await course.save();
    
    res.status(200).json({
      message: `Syllabus version ${versionNumber} activated successfully`,
      versions: course.syllabusVersions
    });
  } catch (error) {
    console.error('Error activating syllabus version:', error);
    res.status(500).json({ message: 'Error activating syllabus version', error: error.message });
  }
};

// LEARNING OUTCOMES MANAGEMENT

// Add or update learning outcome
exports.manageLearningOutcome = async (req, res) => {
  try {
    const { courseId } = req.params;
    const outcomeData = req.body;
    const { outcomeId } = req.query; // If updating existing outcome
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    let message;
    
    if (outcomeId) {
      // Update existing outcome
      const outcomeIndex = course.outcomes.findIndex(outcome => outcome._id.toString() === outcomeId);
      
      if (outcomeIndex === -1) {
        return res.status(404).json({ message: 'Learning outcome not found' });
      }
      
      // Update outcome
      course.outcomes[outcomeIndex] = { 
        ...course.outcomes[outcomeIndex].toObject(), 
        ...outcomeData,
        _id: course.outcomes[outcomeIndex]._id // Preserve ID
      };
      
      message = 'Learning outcome updated successfully';
    } else {
      // Create new outcome
      const newOutcome = {
        ...outcomeData,
        _id: new mongoose.Types.ObjectId()
      };
      
      course.outcomes.push(newOutcome);
      message = 'Learning outcome added successfully';
    }
    
    // Save course
    await course.save();
    
    res.status(200).json({
      message,
      outcomes: course.outcomes
    });
  } catch (error) {
    console.error('Error managing learning outcome:', error);
    res.status(500).json({ message: 'Error managing learning outcome', error: error.message });
  }
};

// Delete learning outcome
exports.deleteLearningOutcome = async (req, res) => {
  try {
    const { courseId, outcomeId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find outcome index
    const outcomeIndex = course.outcomes.findIndex(outcome => outcome._id.toString() === outcomeId);
    
    if (outcomeIndex === -1) {
      return res.status(404).json({ message: 'Learning outcome not found' });
    }
    
    // Remove outcome
    course.outcomes.splice(outcomeIndex, 1);
    
    // Save course
    await course.save();
    
    res.status(200).json({
      message: 'Learning outcome deleted successfully',
      outcomes: course.outcomes
    });
  } catch (error) {
    console.error('Error deleting learning outcome:', error);
    res.status(500).json({ message: 'Error deleting learning outcome', error: error.message });
  }
};

// COURSE MATERIALS MANAGEMENT

// Add course material
exports.addCourseMaterial = async (req, res) => {
  try {
    const { courseId } = req.params;
    const materialData = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Add material
    const newMaterial = {
      ...materialData,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };
    
    course.materials.push(newMaterial);
    
    // Save course
    await course.save();
    
    res.status(201).json({
      message: 'Course material added successfully',
      material: newMaterial
    });
  } catch (error) {
    console.error('Error adding course material:', error);
    res.status(500).json({ message: 'Error adding course material', error: error.message });
  }
};

// Delete course material
exports.deleteCourseMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find material index
    const materialIndex = course.materials.findIndex(material => material._id.toString() === materialId);
    
    if (materialIndex === -1) {
      return res.status(404).json({ message: 'Course material not found' });
    }
    
    // Remove material
    course.materials.splice(materialIndex, 1);
    
    // Save course
    await course.save();
    
    res.status(200).json({
      message: 'Course material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course material:', error);
    res.status(500).json({ message: 'Error deleting course material', error: error.message });
  }
};

// STUDENT READINESS

// Calculate student readiness for a course
exports.calculateStudentReadiness = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Calculate readiness
    const readiness = await course.calculateReadiness(studentId);
    
    res.status(200).json({
      courseCode: course.code,
      courseName: course.name,
      studentName: `${student.firstName} ${student.lastName}`,
      readiness
    });
  } catch (error) {
    console.error('Error calculating student readiness:', error);
    res.status(500).json({ message: 'Error calculating student readiness', error: error.message });
  }
};

// EXPORT FUNCTIONALITY

// Export course syllabus to PDF
exports.exportSyllabus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { format = 'json' } = req.query;
    
    // Check if course exists
    const course = await Course.findById(courseId)
      .populate('teacherId', 'firstName lastName email')
      .populate('prerequisites', 'name code')
      .populate('corequisites', 'name code');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (format === 'json') {
      // Return JSON format
      return res.status(200).json({
        courseInfo: {
          code: course.code,
          name: course.name,
          description: course.description,
          credits: course.credits,
          department: course.department,
          semester: course.semester,
          teacher: course.teacherId ? `${course.teacherId.firstName} ${course.teacherId.lastName}` : 'Not assigned'
        },
        prerequisites: course.prerequisites.map(p => ({ code: p.code, name: p.name })),
        corequisites: course.corequisites.map(c => ({ code: c.code, name: c.name })),
        syllabus: course.syllabus,
        outcomes: course.outcomes
      });
    } else if (format === 'csv') {
      // Generate CSV
      const csvPath = path.join(__dirname, `../temp/${course.code}_syllabus.csv`);
      
      // Flatten syllabus structure for CSV
      const flatSyllabus = [];
      course.syllabus.forEach(node => {
        flatSyllabus.push({
          title: node.title,
          description: node.description,
          order: node.order,
          materials: node.materials.length
        });
      });
      
      const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: [
          { id: 'title', title: 'Title' },
          { id: 'description', title: 'Description' },
          { id: 'order', title: 'Order' },
          { id: 'materials', title: 'Materials Count' }
        ]
      });
      
      await csvWriter.writeRecords(flatSyllabus);
      
      // Send file
      res.download(csvPath, `${course.code}_syllabus.csv`, (err) => {
        if (err) {
          console.error('Error sending CSV file:', err);
        }
        
        // Delete temp file
        fs.unlink(csvPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting temp CSV file:', unlinkErr);
          }
        });
      });
    } else {
      return res.status(400).json({ message: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting syllabus:', error);
    res.status(500).json({ message: 'Error exporting syllabus', error: error.message });
  }
};

// BULK OPERATIONS

// Bulk import courses
exports.bulkImportCourses = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courses } = req.body;
    
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: 'Courses data is required' });
    }
    
    const results = {
      success: [],
      errors: []
    };
    
    // Process each course
    for (const courseData of courses) {
      // Validate course data
      const errors = validateCourseData(courseData);
      
      if (errors.length > 0) {
        results.errors.push({
          code: courseData.code,
          errors
        });
        continue;
      }
      
      // Check if course code already exists
      const existingCourse = await Course.findOne({ code: courseData.code.toUpperCase() });
      
      if (existingCourse) {
        results.errors.push({
          code: courseData.code,
          errors: ['Course code already exists']
        });
        continue;
      }
      
      // Create course
      const course = new Course(courseData);
      await course.save({ session });
      
      results.success.push({
        code: course.code,
        id: course._id
      });
    }
    
    // If no successful imports, abort transaction
    if (results.success.length === 0) {
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        message: 'No courses were imported',
        results
      });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: `Successfully imported ${results.success.length} courses with ${results.errors.length} errors`,
      results
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error importing courses:', error);
    res.status(500).json({ message: 'Error importing courses', error: error.message });
  }
};