import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
};

// Admin API
export const adminAPI = {
  // Dashboard & Stats
  getStats: () => API.get('/admin/stats'),
  
  // Students
  getStudents: () => API.get('/admin/students'),
  createStudent: (data) => API.post('/admin/students', data),
  updateStudent: (id, data) => API.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => API.delete(`/admin/students/${id}`),
  toggleStudentStatus: (id) => API.patch(`/admin/students/${id}/status`),
  exportStudents: () => API.get('/admin/export/students'),
  
  // Teachers
  getTeachers: () => API.get('/admin/teachers'),
  createTeacher: (data) => API.post('/admin/teachers', data),
  updateTeacher: (id, data) => API.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => API.delete(`/admin/teachers/${id}`),
  assignCoursesToTeacher: (id, courseIds) => API.put(`/admin/teachers/${id}/assign-courses`, { courseIds }),
  getTeacherPerformance: (id) => API.get(`/admin/teachers/${id}/performance`),
  
  // Courses
  getCourses: () => API.get('/admin/courses'),
  createCourse: (data) => API.post('/admin/courses', data),
  updateCourse: (id, data) => API.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => API.delete(`/admin/courses/${id}`),
  assignStudentsToCourse: (id, studentIds) => API.put(`/admin/courses/${id}/assign-students`, { studentIds }),
  assignTeacherToCourse: (id, teacherId) => API.put(`/admin/courses/${id}/assign-teacher`, { teacherId }),
  
  // Notices
  getNotices: () => API.get('/admin/notices'),
  createNotice: (data) => API.post('/admin/notices', data),
  updateNotice: (id, data) => API.put(`/admin/notices/${id}`, data),
  deleteNotice: (id) => API.delete(`/admin/notices/${id}`),
  pinNotice: (id) => API.patch(`/admin/notices/${id}/pin`),
  
  // Analytics
  getStudentsPerCourse: () => API.get('/admin/analytics/students-per-course'),
  getAttendanceDistribution: () => API.get('/admin/analytics/attendance-distribution'),
  getPerformanceTrends: () => API.get('/admin/analytics/performance-trends'),
  getStudentsByDepartment: () => API.get('/admin/analytics/students-by-department'),
  getStudentGrowth: () => API.get('/admin/analytics/growth'),
  getPerformanceRadial: () => API.get('/admin/analytics/performance'),
  getAttendanceByDepartment: () => API.get('/admin/attendance/department'),
  getAttendanceByCourse: (id) => API.get(`/admin/attendance/course/${id}`),
  getPerformanceByCourse: (id) => API.get(`/admin/performance/course/${id}`),
  getPerformanceByDepartment: () => API.get('/admin/performance/department'),
  
  // Attendance (teacher/admin)
  markAttendance: (payload) => API.post('/attendance/mark', payload),
  getClassRoster: (classId) => API.get(`/attendance/class/${classId}/roster`),
  
  // Calendar
  getCalendarEvents: () => API.get('/admin/calendar'),
  createCalendarEvent: (data) => API.post('/admin/calendar', data),
  updateCalendarEvent: (id, data) => API.put(`/admin/calendar/${id}`, data),
  deleteCalendarEvent: (id) => API.delete(`/admin/calendar/${id}`),
  
  // Profile & Settings
  getAdminProfile: () => API.get('/admin/profile'),
  updateAdminProfile: (data) => API.put('/admin/profile', data),
  addAdmin: (data) => API.post('/admin/add-admin', data),
  removeAdmin: (id) => API.delete(`/admin/remove-admin/${id}`),

  // Fee & Finance Management
  getFinanceStats: () => API.get('/admin/finance/stats'),
  getFeeRecords: (params) => API.get('/admin/finance/fees', { params }),
  createFeeRecord: (data) => API.post('/admin/finance/fees', data),
  updateFeeRecord: (id, data) => API.put(`/admin/finance/fees/${id}`, data),
  deleteFeeRecord: (id) => API.delete(`/admin/finance/fees/${id}`),
  recordPayment: (id, data) => API.post(`/admin/finance/fees/${id}/payment`, data),
  getPaymentHistory: (studentId) => API.get(`/admin/finance/payments/${studentId}`),
  generateFeeReport: (params) => API.get('/admin/finance/reports', { params }),

  // Library Management
  getBooks: (params) => API.get('/admin/library/books', { params }),
  createBook: (data) => API.post('/admin/library/books', data),
  updateBook: (id, data) => API.put(`/admin/library/books/${id}`, data),
  deleteBook: (id) => API.delete(`/admin/library/books/${id}`),
  issueBook: (data) => API.post('/admin/library/issue', data),
  returnBook: (issueId, data) => API.put(`/admin/library/return/${issueId}`, data),
  getIssueHistory: (params) => API.get('/admin/library/issues', { params }),
  calculateFine: (issueId) => API.get(`/admin/library/fine/${issueId}`),

  // Hostel Management
  getHostels: () => API.get('/admin/hostel/hostels'),
  createHostel: (data) => API.post('/admin/hostel/hostels', data),
  updateHostel: (id, data) => API.put(`/admin/hostel/hostels/${id}`, data),
  deleteHostel: (id) => API.delete(`/admin/hostel/hostels/${id}`),
  getRooms: (hostelId) => API.get(`/admin/hostel/rooms/${hostelId}`),
  createRoom: (data) => API.post('/admin/hostel/rooms', data),
  allocateRoom: (data) => API.post('/admin/hostel/allocate', data),
  vacateRoom: (allocationId) => API.put(`/admin/hostel/vacate/${allocationId}`),
  getHostelReports: () => API.get('/admin/hostel/reports'),

  // Transport Management
  getRoutes: () => API.get('/admin/transport/routes'),
  createRoute: (data) => API.post('/admin/transport/routes', data),
  updateRoute: (id, data) => API.put(`/admin/transport/routes/${id}`, data),
  deleteRoute: (id) => API.delete(`/admin/transport/routes/${id}`),
  getVehicles: () => API.get('/admin/transport/vehicles'),
  createVehicle: (data) => API.post('/admin/transport/vehicles', data),
  updateVehicle: (id, data) => API.put(`/admin/transport/vehicles/${id}`, data),
  getSubscriptions: (params) => API.get('/admin/transport/subscriptions', { params }),
  createSubscription: (data) => API.post('/admin/transport/subscriptions', data),
  getTransportAttendance: (params) => API.get('/admin/transport/attendance', { params }),

  // Complaint Management
  getComplaints: (params) => API.get('/admin/complaints', { params }),
  createComplaint: (data) => API.post('/admin/complaints', data),
  updateComplaint: (id, data) => API.put(`/admin/complaints/${id}`, data),
  assignComplaint: (id, data) => API.put(`/admin/complaints/${id}/assign`, data),
  resolveComplaint: (id, data) => API.put(`/admin/complaints/${id}/resolve`, data),
  getComplaintComments: (id) => API.get(`/admin/complaints/${id}/comments`),
  addComplaintComment: (id, data) => API.post(`/admin/complaints/${id}/comments`, data),

  // Attendance & Timetable
  getAttendanceStats: (params) => API.get('/admin/attendance/stats', { params }),
  markBulkAttendance: (data) => API.post('/admin/attendance/bulk', data),
  getTimetables: (params) => API.get('/admin/timetable', { params }),
  createTimetable: (data) => API.post('/admin/timetable', data),
  updateTimetable: (id, data) => API.put(`/admin/timetable/${id}`, data),

  // Reports & Analytics
  generateReport: (type, params) => API.get(`/admin/reports/${type}`, { params }),
  exportData: (type, format, params) => API.get(`/admin/export/${type}/${format}`, { params }),
  getSystemStats: () => API.get('/admin/system/stats'),
};

// Teacher API
export const teacherAPI = {
  getCourses: () => API.get('/teacher/courses'),
  getStudentsInCourse: (courseId) => API.get(`/teacher/students/${courseId}`),
  markAttendance: (data) => API.post('/teacher/attendance', data),
  getAttendance: (courseId) => API.get(`/teacher/attendance/${courseId}`),
  submitGrades: (data) => API.post('/teacher/grades', data),
  getGrades: (courseId) => API.get(`/teacher/grades/${courseId}`),
};

// Student API
export const studentAPI = {
  getCourses: () => API.get('/student/courses'),
  getAttendance: () => API.get('/student/attendance'),
  getGrades: () => API.get('/student/grades'),
  getTimetable: () => API.get('/student/timetable'),
  getNotices: () => API.get('/student/notices'),
  updateProfile: (data) => API.put('/student/profile', data),
};

export default API;
