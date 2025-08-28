require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const connectDB = require('../config/db');

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB(process.env.MONGO_URI);
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create sample users
    const users = [
      {
        name: 'System Administrator',
        email: 'admin@campus.edu',
        password: 'admin123',
        role: 'Admin',
        department: 'Administration'
      },
      {
        name: 'Dr. John Smith',
        email: 'teacher@campus.edu',
        password: 'teacher123',
        role: 'Teacher',
        department: 'Computer Science'
      },
      {
        name: 'Alice Johnson',
        email: 'student@campus.edu',
        password: 'student123',
        role: 'Student',
        department: 'Computer Science',
        year: 2
      },
      // Additional sample users
      {
        name: 'Prof. Sarah Wilson',
        email: 'sarah.wilson@campus.edu',
        password: 'teacher123',
        role: 'Teacher',
        department: 'Mathematics'
      },
      {
        name: 'Bob Miller',
        email: 'bob.miller@campus.edu',
        password: 'student123',
        role: 'Student',
        department: 'Computer Science',
        year: 3
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@campus.edu',
        password: 'student123',
        role: 'Student',
        department: 'Mathematics',
        year: 1
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users successfully`);

    // Create sample courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    const courses = [
      {
        name: 'Data Structures and Algorithms',
        code: 'CS101',
        description: 'Introduction to fundamental data structures and algorithms',
        department: 'Computer Science',
        credits: 4,
        semester: 'Fall 2024',
        teacherId: createdUsers.find(u => u.email === 'teacher@campus.edu')._id,
        students: [
          createdUsers.find(u => u.email === 'student@campus.edu')._id,
          createdUsers.find(u => u.email === 'bob.miller@campus.edu')._id
        ]
      },
      {
        name: 'Calculus I',
        code: 'MATH101',
        description: 'Introduction to differential and integral calculus',
        department: 'Mathematics',
        credits: 3,
        semester: 'Fall 2024',
        instructor: createdUsers.find(u => u.email === 'sarah.wilson@campus.edu')._id,
        students: [
          createdUsers.find(u => u.email === 'emma.davis@campus.edu')._id
        ]
      },
      {
        name: 'Web Development',
        code: 'CS201',
        description: 'Modern web development with React and Node.js',
        department: 'Computer Science',
        credits: 4,
        semester: 'Fall 2024',
        teacherId: createdUsers.find(u => u.email === 'teacher@campus.edu')._id,
        students: [
          createdUsers.find(u => u.email === 'bob.miller@campus.edu')._id
        ]
      }
    ];

    const createdCourses = await Course.create(courses);
    console.log(`Created ${createdCourses.length} courses successfully`);

    console.log('\n=== Sample Login Credentials ===');
    console.log('Admin: admin@campus.edu / admin123');
    console.log('Teacher: teacher@campus.edu / teacher123');
    console.log('Student: student@campus.edu / student123');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
