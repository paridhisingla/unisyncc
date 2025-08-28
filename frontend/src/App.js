import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EnhancedDashboard from './pages/admin/EnhancedDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminNotices from './pages/admin/AdminNotices';
import Analytics from './pages/admin/Analytics';
import Calendar from './pages/admin/Calendar';
import Finance from './pages/admin/Finance';
import Library from './pages/admin/Library';
import Hostel from './pages/admin/Hostel';
import Transport from './pages/admin/Transport';
import AdminAttendance from './pages/admin/Attendance';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Attendance from './pages/teacher/Attendance';
import TeacherCourses from './pages/teacher/TeacherCourses';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Timetable from './pages/student/Timetable';
import StudentNotices from './pages/student/StudentNotices';

// Common Pages
import Profile from './pages/common/Profile';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <div className="app">
          <Sidebar 
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            userRole={user.role}
            onLogout={handleLogout}
          />
          <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
            <Navbar 
              userRole={user.role}
              userName={user.name}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="content">
              <Routes>
                {/* Admin Routes */}
                {user.role === 'Admin' && (
                  <>
                    <Route path="/admin" element={<EnhancedDashboard />} />
                    <Route path="/admin/students" element={<ManageStudents />} />
                    <Route path="/admin/teachers" element={<ManageTeachers />} />
                    <Route path="/admin/staff" element={<ManageStudents />} />
                    <Route path="/admin/courses" element={<AdminCourses />} />
                    <Route path="/admin/attendance" element={<AdminAttendance />} />
                    <Route path="/admin/timetable" element={<Calendar />} />
                    <Route path="/admin/exams" element={<Analytics />} />
                    <Route path="/admin/finance" element={<Finance />} />
                    <Route path="/admin/library" element={<Library />} />
                    <Route path="/admin/hostel" element={<Hostel />} />
                    <Route path="/admin/transport" element={<Transport />} />
                    <Route path="/admin/events" element={<AdminNotices />} />
                    <Route path="/admin/complaints" element={<Analytics />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
                    <Route path="/admin/reports" element={<Analytics />} />
                    <Route path="/admin/settings" element={<Profile user={user} />} />
                    <Route path="/admin/profile" element={<Profile user={user} />} />
                  </>
                )}

                {/* Teacher Routes */}
                {user.role === 'teacher' && (
                  <>
                    <Route path="/teacher" element={<TeacherDashboard />} />
                    <Route path="/teacher/attendance" element={<Attendance />} />
                    <Route path="/teacher/courses" element={<TeacherCourses />} />
                    <Route path="/teacher/notices" element={<StudentNotices />} />
                    <Route path="/teacher/profile" element={<Profile user={user} />} />
                  </>
                )}

                {/* Student Routes */}
                {user.role === 'student' && (
                  <>
                    <Route path="/student" element={<StudentDashboard />} />
                    <Route path="/student/timetable" element={<Timetable />} />
                    <Route path="/student/notices" element={<StudentNotices />} />
                    <Route path="/student/profile" element={<Profile user={user} />} />
                  </>
                )}

                {/* Redirect to role-specific dashboard */}
                <Route path="/" element={<Navigate to={`/${user.role}`} replace />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to={`/${user.role}`} replace />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
