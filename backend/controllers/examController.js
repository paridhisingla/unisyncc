const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');

// Get grades for a course
exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { academicYear, semester } = req.query;
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Build filter
    const filter = { courseId };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    
    // Get grades
    const grades = await Grade.find(filter)
      .populate('studentId', 'firstName lastName email studentId')
      .sort({ 'studentId.lastName': 1, 'studentId.firstName': 1 });
    
    // Get grade distribution
    const distribution = await Grade.getGradeDistribution(courseId, academicYear, semester);
    
    res.status(200).json({
      course: {
        id: course._id,
        code: course.code,
        name: course.name
      },
      grades,
      distribution
    });
  } catch (error) {
    console.error('Error fetching course grades:', error);
    res.status(500).json({ message: 'Error fetching course grades', error: error.message });
  }
};

// Get student grades
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;
    
    // Validate student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Build filter
    const filter = { 
      studentId,
      isPublished: true // Only return published grades to students
    };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    
    // Get grades
    const grades = await Grade.find(filter)
      .populate('courseId', 'code name credits')
      .sort({ academicYear: -1, semester: -1 });
    
    // Calculate GPA
    const gpa = await Grade.calculateGPA(studentId, academicYear, semester);
    
    res.status(200).json({
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        studentId: student.studentId
      },
      grades,
      gpa
    });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Error fetching student grades', error: error.message });
  }
};

// Create or update grade
exports.manageGrade = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { studentId, courseId } = req.params;
    const gradeData = req.body;
    
    // Validate student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if grade already exists
    let grade = await Grade.findOne({ 
      studentId, 
      courseId,
      academicYear: gradeData.academicYear,
      semester: gradeData.semester
    });
    
    let isNewGrade = false;
    
    if (!grade) {
      // Create new grade
      grade = new Grade({
        studentId,
        courseId,
        academicYear: gradeData.academicYear,
        semester: gradeData.semester,
        components: gradeData.components || [],
        comments: gradeData.comments
      });
      isNewGrade = true;
    } else {
      // Update existing grade
      if (gradeData.components) grade.components = gradeData.components;
      if (gradeData.comments !== undefined) grade.comments = gradeData.comments;
    }
    
    // Calculate final grade if components exist
    if (grade.components && grade.components.length > 0) {
      const gradeResult = grade.assignLetterGrade();
      grade.finalGrade = gradeResult.finalGrade;
      grade.letterGrade = gradeResult.letterGrade;
      grade.gradePoints = gradeResult.gradePoints;
    }
    
    grade.lastUpdated = new Date();
    
    // Save grade
    await grade.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(isNewGrade ? 201 : 200).json({
      message: isNewGrade ? 'Grade created successfully' : 'Grade updated successfully',
      grade
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error managing grade:', error);
    res.status(500).json({ message: 'Error managing grade', error: error.message });
  }
};

// Add or update assessment component
exports.manageAssessmentComponent = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const componentData = req.body;
    const { componentId } = req.query; // If updating existing component
    
    // Validate grade exists
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    let message;
    
    if (componentId) {
      // Update existing component
      const componentIndex = grade.components.findIndex(comp => comp._id.toString() === componentId);
      
      if (componentIndex === -1) {
        return res.status(404).json({ message: 'Assessment component not found' });
      }
      
      // Update component
      grade.components[componentIndex] = { 
        ...grade.components[componentIndex].toObject(), 
        ...componentData,
        _id: grade.components[componentIndex]._id // Preserve ID
      };
      
      message = 'Assessment component updated successfully';
    } else {
      // Create new component
      const newComponent = {
        ...componentData,
        _id: new mongoose.Types.ObjectId()
      };
      
      grade.components.push(newComponent);
      message = 'Assessment component added successfully';
    }
    
    // Recalculate final grade
    const gradeResult = grade.assignLetterGrade();
    grade.finalGrade = gradeResult.finalGrade;
    grade.letterGrade = gradeResult.letterGrade;
    grade.gradePoints = gradeResult.gradePoints;
    
    grade.lastUpdated = new Date();
    
    // Save grade
    await grade.save();
    
    res.status(200).json({
      message,
      grade
    });
  } catch (error) {
    console.error('Error managing assessment component:', error);
    res.status(500).json({ message: 'Error managing assessment component', error: error.message });
  }
};

// Delete assessment component
exports.deleteAssessmentComponent = async (req, res) => {
  try {
    const { gradeId, componentId } = req.params;
    
    // Validate grade exists
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    // Find component index
    const componentIndex = grade.components.findIndex(comp => comp._id.toString() === componentId);
    
    if (componentIndex === -1) {
      return res.status(404).json({ message: 'Assessment component not found' });
    }
    
    // Remove component
    grade.components.splice(componentIndex, 1);
    
    // Recalculate final grade
    const gradeResult = grade.assignLetterGrade();
    grade.finalGrade = gradeResult.finalGrade;
    grade.letterGrade = gradeResult.letterGrade;
    grade.gradePoints = gradeResult.gradePoints;
    
    grade.lastUpdated = new Date();
    
    // Save grade
    await grade.save();
    
    res.status(200).json({
      message: 'Assessment component deleted successfully',
      grade
    });
  } catch (error) {
    console.error('Error deleting assessment component:', error);
    res.status(500).json({ message: 'Error deleting assessment component', error: error.message });
  }
};

// Publish grades
exports.publishGrades = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId } = req.params;
    const { academicYear, semester, gradeIds } = req.body;
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Build filter
    const filter = { courseId };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (gradeIds && Array.isArray(gradeIds) && gradeIds.length > 0) {
      filter._id = { $in: gradeIds };
    }
    
    // Update grades
    const updateResult = await Grade.updateMany(
      filter,
      {
        $set: {
          isPublished: true,
          publishedBy: req.user._id,
          publishedAt: new Date()
        }
      },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: 'Grades published successfully',
      count: updateResult.modifiedCount
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error publishing grades:', error);
    res.status(500).json({ message: 'Error publishing grades', error: error.message });
  }
};

// Submit grade appeal
exports.submitGradeAppeal = async (req, res) => {
  try {
    const { gradeId, componentId } = req.params;
    const { reason, requestedMarks } = req.body;
    
    // Validate grade exists
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    // Find component
    const component = grade.components.find(comp => comp._id.toString() === componentId);
    
    if (!component) {
      return res.status(404).json({ message: 'Assessment component not found' });
    }
    
    // Check if component is already graded
    if (component.status !== 'Graded') {
      return res.status(400).json({ message: 'Cannot appeal a component that is not graded' });
    }
    
    // Check if appeal already exists
    const existingAppeal = grade.appeals.find(appeal => 
      appeal.componentId.toString() === componentId && 
      ['Pending', 'Approved'].includes(appeal.status)
    );
    
    if (existingAppeal) {
      return res.status(400).json({ message: 'An appeal for this component is already pending or approved' });
    }
    
    // Create appeal
    const appeal = {
      componentId: component._id,
      reason,
      originalMarks: component.obtainedMarks,
      requestedMarks,
      status: 'Pending'
    };
    
    // Update component status
    component.status = 'Disputed';
    
    // Add appeal to grade
    grade.appeals.push(appeal);
    
    // Save grade
    await grade.save();
    
    res.status(201).json({
      message: 'Grade appeal submitted successfully',
      appeal
    });
  } catch (error) {
    console.error('Error submitting grade appeal:', error);
    res.status(500).json({ message: 'Error submitting grade appeal', error: error.message });
  }
};

// Resolve grade appeal
exports.resolveGradeAppeal = async (req, res) => {
  try {
    const { gradeId, appealId } = req.params;
    const { status, resolvedMarks, comments } = req.body;
    
    if (!['Approved', 'Rejected', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Validate grade exists
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    // Find appeal
    const appealIndex = grade.appeals.findIndex(appeal => appeal._id.toString() === appealId);
    
    if (appealIndex === -1) {
      return res.status(404).json({ message: 'Appeal not found' });
    }
    
    const appeal = grade.appeals[appealIndex];
    
    // Check if appeal is already resolved
    if (appeal.status !== 'Pending') {
      return res.status(400).json({ message: 'Appeal is already resolved' });
    }
    
    // Update appeal
    appeal.status = status;
    appeal.resolvedBy = req.user._id;
    appeal.resolvedAt = new Date();
    appeal.comments = comments;
    
    if (status === 'Approved') {
      appeal.resolvedMarks = resolvedMarks || appeal.requestedMarks;
      
      // Find component and update marks
      const componentIndex = grade.components.findIndex(comp => 
        comp._id.toString() === appeal.componentId.toString()
      );
      
      if (componentIndex !== -1) {
        grade.components[componentIndex].obtainedMarks = appeal.resolvedMarks;
        grade.components[componentIndex].status = 'Resolved';
      }
      
      // Recalculate final grade
      const gradeResult = grade.assignLetterGrade();
      grade.finalGrade = gradeResult.finalGrade;
      grade.letterGrade = gradeResult.letterGrade;
      grade.gradePoints = gradeResult.gradePoints;
    } else if (status === 'Rejected') {
      // Reset component status
      const componentIndex = grade.components.findIndex(comp => 
        comp._id.toString() === appeal.componentId.toString()
      );
      
      if (componentIndex !== -1) {
        grade.components[componentIndex].status = 'Graded';
      }
    }
    
    grade.lastUpdated = new Date();
    
    // Save grade
    await grade.save();
    
    res.status(200).json({
      message: 'Grade appeal resolved successfully',
      appeal: grade.appeals[appealIndex]
    });
  } catch (error) {
    console.error('Error resolving grade appeal:', error);
    res.status(500).json({ message: 'Error resolving grade appeal', error: error.message });
  }
};

// Get grade appeals for a course
exports.getCourseAppeals = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { academicYear, semester, status } = req.query;
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Build filter
    const filter = { courseId };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    
    // Get grades with appeals
    const grades = await Grade.find(filter)
      .populate('studentId', 'firstName lastName email studentId');
    
    // Extract appeals
    const appeals = [];
    
    grades.forEach(grade => {
      if (grade.appeals && grade.appeals.length > 0) {
        grade.appeals.forEach(appeal => {
          // Filter by status if provided
          if (status && appeal.status !== status) {
            return;
          }
          
          // Find component
          const component = grade.components.find(comp => 
            comp._id.toString() === appeal.componentId.toString()
          );
          
          appeals.push({
            appealId: appeal._id,
            gradeId: grade._id,
            student: {
              id: grade.studentId._id,
              name: `${grade.studentId.firstName} ${grade.studentId.lastName}`,
              email: grade.studentId.email,
              studentId: grade.studentId.studentId
            },
            component: component ? {
              id: component._id,
              name: component.name,
              type: component.type,
              maxMarks: component.maxMarks
            } : null,
            originalMarks: appeal.originalMarks,
            requestedMarks: appeal.requestedMarks,
            resolvedMarks: appeal.resolvedMarks,
            status: appeal.status,
            reason: appeal.reason,
            comments: appeal.comments,
            createdAt: appeal.createdAt,
            resolvedAt: appeal.resolvedAt
          });
        });
      }
    });
    
    res.status(200).json({
      course: {
        id: course._id,
        code: course.code,
        name: course.name
      },
      appeals
    });
  } catch (error) {
    console.error('Error fetching course appeals:', error);
    res.status(500).json({ message: 'Error fetching course appeals', error: error.message });
  }
};

// Export grade report
exports.exportGradeReport = async (req, res) => {
  try {
    const { type } = req.query; // 'student' or 'course'
    const { id } = req.params; // studentId or courseId
    const { format = 'pdf', academicYear, semester } = req.query;
    
    let data;
    let fileName;
    
    if (type === 'student') {
      // Export student grade report
      const student = await User.findOne({ _id: id, role: 'student' });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Build filter
      const filter = { 
        studentId: id,
        isPublished: true
      };
      if (academicYear) filter.academicYear = academicYear;
      if (semester) filter.semester = semester;
      
      // Get grades
      const grades = await Grade.find(filter)
        .populate('courseId', 'code name credits');
      
      // Calculate GPA
      const gpa = await Grade.calculateGPA(id, academicYear, semester);
      
      data = {
        student: {
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          studentId: student.studentId
        },
        academicYear,
        semester,
        grades,
        gpa
      };
      
      fileName = `${student.studentId}_grade_report`;
    } else if (type === 'course') {
      // Export course grade report
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Build filter
      const filter = { courseId: id };
      if (academicYear) filter.academicYear = academicYear;
      if (semester) filter.semester = semester;
      
      // Get grades
      const grades = await Grade.find(filter)
        .populate('studentId', 'firstName lastName email studentId');
      
      // Get grade distribution
      const distribution = await Grade.getGradeDistribution(id, academicYear, semester);
      
      data = {
        course: {
          code: course.code,
          name: course.name
        },
        academicYear,
        semester,
        grades,
        distribution
      };
      
      fileName = `${course.code}_grade_report`;
    } else {
      return res.status(400).json({ message: 'Invalid export type' });
    }
    
    if (format === 'pdf') {
      // Generate PDF
      const pdfPath = path.join(__dirname, `../temp/${fileName}.pdf`);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(pdfPath);
      
      doc.pipe(stream);
      
      // Add content based on type
      if (type === 'student') {
        // Student report
        doc.fontSize(18).text('Student Grade Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Name: ${data.student.name}`);
        doc.text(`Student ID: ${data.student.studentId}`);
        doc.text(`Email: ${data.student.email}`);
        if (data.academicYear) doc.text(`Academic Year: ${data.academicYear}`);
        if (data.semester) doc.text(`Semester: ${data.semester}`);
        doc.moveDown();
        doc.text(`GPA: ${data.gpa.gpa}`);
        doc.text(`Total Credits: ${data.gpa.totalCredits}`);
        doc.moveDown();
        
        // Courses table
        doc.fontSize(14).text('Courses', { underline: true });
        doc.moveDown();
        
        // Table headers
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = [100, 200, 60, 60];
        
        doc.fontSize(10);
        doc.text('Course Code', tableLeft, tableTop);
        doc.text('Course Name', tableLeft + colWidths[0], tableTop);
        doc.text('Credits', tableLeft + colWidths[0] + colWidths[1], tableTop);
        doc.text('Grade', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
        
        let rowTop = tableTop + 20;
        
        // Table rows
        data.grades.forEach(grade => {
          doc.text(grade.courseId.code, tableLeft, rowTop);
          doc.text(grade.courseId.name, tableLeft + colWidths[0], rowTop);
          doc.text(grade.courseId.credits.toString(), tableLeft + colWidths[0] + colWidths[1], rowTop);
          doc.text(grade.letterGrade, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);
          rowTop += 20;
        });
      } else {
        // Course report
        doc.fontSize(18).text('Course Grade Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Course: ${data.course.code} - ${data.course.name}`);
        if (data.academicYear) doc.text(`Academic Year: ${data.academicYear}`);
        if (data.semester) doc.text(`Semester: ${data.semester}`);
        doc.moveDown();
        
        // Distribution
        doc.fontSize(14).text('Grade Distribution', { underline: true });
        doc.moveDown();
        doc.fontSize(10).text(`Total Students: ${data.distribution.totalStudents}`);
        doc.text(`Average Grade: ${data.distribution.averageGrade}`);
        doc.moveDown();
        
        // Distribution table
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = [50, 50];
        
        doc.text('Grade', tableLeft, tableTop);
        doc.text('Count', tableLeft + colWidths[0], tableTop);
        
        let rowTop = tableTop + 20;
        
        // Table rows
        for (const [grade, count] of Object.entries(data.distribution)) {
          if (['A', 'B', 'C', 'D', 'F'].includes(grade)) {
            doc.text(grade, tableLeft, rowTop);
            doc.text(count.toString(), tableLeft + colWidths[0], rowTop);
            rowTop += 20;
          }
        }
        
        doc.moveDown();
        doc.moveDown();
        
        // Students table
        doc.fontSize(14).text('Student Grades', { underline: true });
        doc.moveDown();
        
        // Table headers
        const studentsTableTop = doc.y;
        const studentsColWidths = [150, 100, 100, 100];
        
        doc.fontSize(10);
        doc.text('Student Name', tableLeft, studentsTableTop);
        doc.text('Student ID', tableLeft + studentsColWidths[0], studentsTableTop);
        doc.text('Final Grade', tableLeft + studentsColWidths[0] + studentsColWidths[1], studentsTableTop);
        doc.text('Letter Grade', tableLeft + studentsColWidths[0] + studentsColWidths[1] + studentsColWidths[2], studentsTableTop);
        
        rowTop = studentsTableTop + 20;
        
        // Table rows
        data.grades.forEach(grade => {
          const studentName = `${grade.studentId.firstName} ${grade.studentId.lastName}`;
          doc.text(studentName, tableLeft, rowTop);
          doc.text(grade.studentId.studentId, tableLeft + studentsColWidths[0], rowTop);
          doc.text(grade.finalGrade ? grade.finalGrade.toString() : 'N/A', tableLeft + studentsColWidths[0] + studentsColWidths[1], rowTop);
          doc.text(grade.letterGrade || 'N/A', tableLeft + studentsColWidths[0] + studentsColWidths[1] + studentsColWidths[2], rowTop);
          rowTop += 20;
        });
      }
      
      doc.end();
      
      // Wait for PDF to be created
      stream.on('finish', () => {
        // Send file
        res.download(pdfPath, `${fileName}.pdf`, (err) => {
          if (err) {
            console.error('Error sending PDF file:', err);
          }
          
          // Delete temp file
          fs.unlink(pdfPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temp PDF file:', unlinkErr);
            }
          });
        });
      });
    } else if (format === 'csv') {
      // Generate CSV
      const csvPath = path.join(__dirname, `../temp/${fileName}.csv`);
      
      let records;
      let headers;
      
      if (type === 'student') {
        // Student report
        headers = [
          { id: 'courseCode', title: 'Course Code' },
          { id: 'courseName', title: 'Course Name' },
          { id: 'credits', title: 'Credits' },
          { id: 'finalGrade', title: 'Final Grade' },
          { id: 'letterGrade', title: 'Letter Grade' }
        ];
        
        records = data.grades.map(grade => ({
          courseCode: grade.courseId.code,
          courseName: grade.courseId.name,
          credits: grade.courseId.credits,
          finalGrade: grade.finalGrade,
          letterGrade: grade.letterGrade
        }));
      } else {
        // Course report
        headers = [
          { id: 'studentName', title: 'Student Name' },
          { id: 'studentId', title: 'Student ID' },
          { id: 'finalGrade', title: 'Final Grade' },
          { id: 'letterGrade', title: 'Letter Grade' }
        ];
        
        records = data.grades.map(grade => ({
          studentName: `${grade.studentId.firstName} ${grade.studentId.lastName}`,
          studentId: grade.studentId.studentId,
          finalGrade: grade.finalGrade,
          letterGrade: grade.letterGrade
        }));
      }
      
      const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: headers
      });
      
      await csvWriter.writeRecords(records);
      
      // Send file
      res.download(csvPath, `${fileName}.csv`, (err) => {
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
    console.error('Error exporting grade report:', error);
    res.status(500).json({ message: 'Error exporting grade report', error: error.message });
  }
};

// Bulk import grades
exports.bulkImportGrades = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId } = req.params;
    const { academicYear, semester, grades } = req.body;
    
    if (!academicYear || !semester || !grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ message: 'Invalid import data' });
    }
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const results = {
      success: [],
      errors: []
    };
    
    // Process each grade
    for (const gradeData of grades) {
      const { studentId, components } = gradeData;
      
      if (!studentId || !components) {
        results.errors.push({
          studentId,
          error: 'Missing required fields'
        });
        continue;
      }
      
      // Validate student exists
      const student = await User.findOne({ 
        $or: [
          { _id: studentId },
          { studentId }
        ],
        role: 'student'
      });
      
      if (!student) {
        results.errors.push({
          studentId,
          error: 'Student not found'
        });
        continue;
      }
      
      // Check if grade already exists
      let grade = await Grade.findOne({ 
        studentId: student._id, 
        courseId,
        academicYear,
        semester
      });
      
      if (!grade) {
        // Create new grade
        grade = new Grade({
          studentId: student._id,
          courseId,
          academicYear,
          semester,
          components,
          lastUpdated: new Date()
        });
      } else {
        // Update existing grade
        grade.components = components;
        grade.lastUpdated = new Date();
      }
      
      // Calculate final grade
      const gradeResult = grade.assignLetterGrade();
      grade.finalGrade = gradeResult.finalGrade;
      grade.letterGrade = gradeResult.letterGrade;
      grade.gradePoints = gradeResult.gradePoints;
      
      // Save grade
      await grade.save({ session });
      
      results.success.push({
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        finalGrade: grade.finalGrade,
        letterGrade: grade.letterGrade
      });
    }
    
    // If no successful imports, abort transaction
    if (results.success.length === 0) {
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        message: 'No grades were imported',
        results
      });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: `Successfully imported ${results.success.length} grades with ${results.errors.length} errors`,
      results
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error importing grades:', error);
    res.status(500).json({ message: 'Error importing grades', error: error.message });
  }
};