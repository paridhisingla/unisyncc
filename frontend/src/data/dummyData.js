// Dummy data for the Campus Management System

export const users = {
  admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  teacher: { username: 'teacher', password: 'teacher123', role: 'teacher', name: 'John Smith' },
  student: { username: 'student', password: 'student123', role: 'student', name: 'Alice Johnson' }
};

export const students = [
  { id: 1, name: 'Alice Johnson', email: 'alice@campus.edu', department: 'Computer Science', year: 2, attendance: 85, status: 'active', phone: '+1-555-0101', enrollmentDate: '2023-09-01', gpa: 3.7 },
  { id: 2, name: 'Bob Wilson', email: 'bob@campus.edu', department: 'Mathematics', year: 3, attendance: 92, status: 'active', phone: '+1-555-0102', enrollmentDate: '2022-09-01', gpa: 3.9 },
  { id: 3, name: 'Carol Davis', email: 'carol@campus.edu', department: 'Physics', year: 1, attendance: 78, status: 'active', phone: '+1-555-0103', enrollmentDate: '2024-09-01', gpa: 3.2 },
  { id: 4, name: 'David Brown', email: 'david@campus.edu', department: 'Chemistry', year: 2, attendance: 88, status: 'active', phone: '+1-555-0104', enrollmentDate: '2023-09-01', gpa: 3.5 },
  { id: 5, name: 'Emma Garcia', email: 'emma@campus.edu', department: 'Biology', year: 4, attendance: 95, status: 'active', phone: '+1-555-0105', enrollmentDate: '2021-09-01', gpa: 3.8 },
  { id: 6, name: 'Frank Miller', email: 'frank@campus.edu', department: 'Computer Science', year: 3, attendance: 82, status: 'inactive', phone: '+1-555-0106', enrollmentDate: '2022-09-01', gpa: 3.4 },
  { id: 7, name: 'Grace Lee', email: 'grace@campus.edu', department: 'Mathematics', year: 1, attendance: 90, status: 'active', phone: '+1-555-0107', enrollmentDate: '2024-09-01', gpa: 3.6 },
  { id: 8, name: 'Henry Taylor', email: 'henry@campus.edu', department: 'Physics', year: 2, attendance: 76, status: 'active', phone: '+1-555-0108', enrollmentDate: '2023-09-01', gpa: 3.1 },
  { id: 9, name: 'Isabella Rodriguez', email: 'isabella@campus.edu', department: 'Computer Science', year: 1, attendance: 88, status: 'active', phone: '+1-555-0109', enrollmentDate: '2024-09-01', gpa: 3.5 },
  { id: 10, name: 'Jack Thompson', email: 'jack@campus.edu', department: 'Biology', year: 3, attendance: 91, status: 'active', phone: '+1-555-0110', enrollmentDate: '2022-09-01', gpa: 3.7 },
  { id: 11, name: 'Kate Anderson', email: 'kate@campus.edu', department: 'Chemistry', year: 4, attendance: 87, status: 'active', phone: '+1-555-0111', enrollmentDate: '2021-09-01', gpa: 3.6 },
  { id: 12, name: 'Liam O\'Connor', email: 'liam@campus.edu', department: 'Mathematics', year: 2, attendance: 93, status: 'active', phone: '+1-555-0112', enrollmentDate: '2023-09-01', gpa: 3.8 }
];

export const teachers = [
  { id: 1, name: 'Dr. John Smith', email: 'john@campus.edu', department: 'Computer Science', courses: ['CS101', 'CS201'], phone: '+1-555-1001', avgAttendance: 87, experience: 8, status: 'active' },
  { id: 2, name: 'Dr. Sarah Johnson', email: 'sarah@campus.edu', department: 'Mathematics', courses: ['MATH101', 'MATH201'], phone: '+1-555-1002', avgAttendance: 92, experience: 12, status: 'active' },
  { id: 3, name: 'Dr. Michael Brown', email: 'michael@campus.edu', department: 'Physics', courses: ['PHY101', 'PHY201'], phone: '+1-555-1003', avgAttendance: 85, experience: 15, status: 'active' },
  { id: 4, name: 'Dr. Lisa Davis', email: 'lisa@campus.edu', department: 'Chemistry', courses: ['CHEM101', 'CHEM201'], phone: '+1-555-1004', avgAttendance: 89, experience: 10, status: 'active' },
  { id: 5, name: 'Dr. Robert Wilson', email: 'robert@campus.edu', department: 'Biology', courses: ['BIO101', 'BIO201'], phone: '+1-555-1005', avgAttendance: 91, experience: 7, status: 'active' },
  { id: 6, name: 'Dr. Emily Chen', email: 'emily@campus.edu', department: 'Computer Science', courses: ['CS301', 'CS401'], phone: '+1-555-1006', avgAttendance: 88, experience: 6, status: 'active' }
];

export const courses = [
  { id: 'CS101', name: 'Introduction to Programming', teacher: 'Dr. John Smith', students: 45, credits: 3 },
  { id: 'CS201', name: 'Data Structures', teacher: 'Dr. John Smith', students: 38, credits: 4 },
  { id: 'MATH101', name: 'Calculus I', teacher: 'Dr. Sarah Johnson', students: 52, credits: 3 },
  { id: 'MATH201', name: 'Linear Algebra', teacher: 'Dr. Sarah Johnson', students: 35, credits: 3 },
  { id: 'PHY101', name: 'General Physics', teacher: 'Dr. Michael Brown', students: 42, credits: 4 },
  { id: 'PHY201', name: 'Quantum Physics', teacher: 'Dr. Michael Brown', students: 28, credits: 4 },
  { id: 'CHEM101', name: 'General Chemistry', teacher: 'Dr. Lisa Davis', students: 48, credits: 3 },
  { id: 'CHEM201', name: 'Organic Chemistry', teacher: 'Dr. Lisa Davis', students: 32, credits: 4 }
];

export const notices = [
  { id: 1, title: 'Mid-term Examinations', content: 'Mid-term exams will be conducted from March 15-20, 2024.', date: '2024-03-01', type: 'exam', isPinned: true, expiryDate: '2024-03-25', author: 'Admin User' },
  { id: 2, title: 'Library Hours Extended', content: 'Library will remain open until 10 PM during exam period.', date: '2024-03-05', type: 'general', isPinned: false, expiryDate: '2024-04-01', author: 'Admin User' },
  { id: 3, title: 'Sports Day Registration', content: 'Register for annual sports day events by March 10, 2024.', date: '2024-02-28', type: 'event', isPinned: true, expiryDate: '2024-03-15', author: 'Admin User' },
  { id: 4, title: 'Fee Payment Reminder', content: 'Semester fees must be paid by March 31, 2024.', date: '2024-03-10', type: 'important', isPinned: false, expiryDate: '2024-04-05', author: 'Admin User' },
  { id: 5, title: 'Winter Break', content: 'Campus will be closed from December 20, 2024 to January 5, 2025.', date: '2024-12-01', type: 'holiday', isPinned: false, expiryDate: '2025-01-10', author: 'Admin User' },
  { id: 6, title: 'New Course Registration', content: 'Registration for summer courses opens on April 1, 2024.', date: '2024-03-15', type: 'general', isPinned: false, expiryDate: '2024-04-15', author: 'Admin User' }
];

// Additional data for enhanced features
export const departments = [
  { id: 1, name: 'Computer Science', students: 4, teachers: 2, courses: 4 },
  { id: 2, name: 'Mathematics', students: 2, teachers: 1, courses: 2 },
  { id: 3, name: 'Physics', students: 2, teachers: 1, courses: 2 },
  { id: 4, name: 'Chemistry', students: 2, teachers: 1, courses: 2 },
  { id: 5, name: 'Biology', students: 2, teachers: 1, courses: 2 }
];

export const recentActivities = [
  { id: 1, type: 'student_registration', message: 'Isabella Rodriguez enrolled in Computer Science', timestamp: '2024-03-15T10:30:00Z', icon: 'UserPlus' },
  { id: 2, type: 'notice_posted', message: 'New notice: Mid-term Examinations posted', timestamp: '2024-03-15T09:15:00Z', icon: 'Bell' },
  { id: 3, type: 'course_created', message: 'New course CS301 created', timestamp: '2024-03-14T16:45:00Z', icon: 'BookOpen' },
  { id: 4, type: 'teacher_assigned', message: 'Dr. Emily Chen assigned to CS301', timestamp: '2024-03-14T14:20:00Z', icon: 'UserCheck' },
  { id: 5, type: 'student_registration', message: 'Liam O\'Connor enrolled in Mathematics', timestamp: '2024-03-13T11:00:00Z', icon: 'UserPlus' }
];

export const studentGrowthData = [
  { month: 'Jan', students: 180 },
  { month: 'Feb', students: 195 },
  { month: 'Mar', students: 210 },
  { month: 'Apr', students: 225 },
  { month: 'May', students: 240 },
  { month: 'Jun', students: 255 }
];

export const examPerformanceData = [
  { subject: 'Computer Science', excellent: 40, good: 35, average: 20, poor: 5 },
  { subject: 'Mathematics', excellent: 45, good: 30, average: 20, poor: 5 },
  { subject: 'Physics', excellent: 35, good: 40, average: 20, poor: 5 },
  { subject: 'Chemistry', excellent: 38, good: 37, average: 20, poor: 5 },
  { subject: 'Biology', excellent: 42, good: 33, average: 20, poor: 5 }
];

export const academicCalendar = [
  { id: 1, title: 'Mid-term Exams', date: '2024-03-15', type: 'exam', color: '#ff4444' },
  { id: 2, title: 'Spring Break', date: '2024-03-25', type: 'holiday', color: '#00ff88' },
  { id: 3, title: 'Final Exams', date: '2024-05-10', type: 'exam', color: '#ff4444' },
  { id: 4, title: 'Graduation Ceremony', date: '2024-05-25', type: 'event', color: '#00d4ff' },
  { id: 5, title: 'Summer Session Begins', date: '2024-06-01', type: 'academic', color: '#ffaa00' }
];

export const timetable = [
  { day: 'Monday', time: '9:00-10:00', subject: 'CS101', room: 'Room 101' },
  { day: 'Monday', time: '10:00-11:00', subject: 'MATH101', room: 'Room 201' },
  { day: 'Monday', time: '11:00-12:00', subject: 'PHY101', room: 'Room 301' },
  { day: 'Tuesday', time: '9:00-10:00', subject: 'CS201', room: 'Room 102' },
  { day: 'Tuesday', time: '10:00-11:00', subject: 'MATH201', room: 'Room 202' },
  { day: 'Tuesday', time: '11:00-12:00', subject: 'CHEM101', room: 'Room 401' },
  { day: 'Wednesday', time: '9:00-10:00', subject: 'CS101', room: 'Room 101' },
  { day: 'Wednesday', time: '10:00-11:00', subject: 'PHY201', room: 'Room 302' },
  { day: 'Thursday', time: '9:00-10:00', subject: 'MATH101', room: 'Room 201' },
  { day: 'Thursday', time: '10:00-11:00', subject: 'CS201', room: 'Room 102' },
  { day: 'Thursday', time: '11:00-12:00', subject: 'CHEM201', room: 'Room 402' },
  { day: 'Friday', time: '9:00-10:00', subject: 'PHY101', room: 'Room 301' },
  { day: 'Friday', time: '10:00-11:00', subject: 'MATH201', room: 'Room 202' }
];

export const attendanceData = [
  { week: 'Week 1', attendance: 85 },
  { week: 'Week 2', attendance: 88 },
  { week: 'Week 3', attendance: 82 },
  { week: 'Week 4', attendance: 90 },
  { week: 'Week 5', attendance: 87 },
  { week: 'Week 6', attendance: 92 },
  { week: 'Week 7', attendance: 89 },
  { week: 'Week 8', attendance: 94 }
];

export const studentAttendance = [
  { id: 1, name: 'Alice Johnson', present: true },
  { id: 2, name: 'Bob Wilson', present: true },
  { id: 3, name: 'Carol Davis', present: false },
  { id: 4, name: 'David Brown', present: true },
  { id: 5, name: 'Emma Garcia', present: true },
  { id: 6, name: 'Frank Miller', present: false },
  { id: 7, name: 'Grace Lee', present: true },
  { id: 8, name: 'Henry Taylor', present: true }
];
