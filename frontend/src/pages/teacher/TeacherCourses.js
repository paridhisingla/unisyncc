import React from 'react';
import Card from '../../components/Card';
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';

const TeacherCourses = () => {
  const myCourses = [
    {
      id: 'CS101',
      name: 'Introduction to Programming',
      students: 45,
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      room: 'Room 101',
      attendance: 87,
      assignments: 3
    },
    {
      id: 'CS201',
      name: 'Data Structures',
      students: 38,
      schedule: 'Tue, Thu - 10:00 AM',
      room: 'Room 102',
      attendance: 92,
      assignments: 2
    }
  ];

  return (
    <div className="teacher-courses">
      <div className="page-header">
        <h1>My Courses</h1>
        <p>Manage your assigned courses and track student progress</p>
      </div>

      <div className="courses-grid">
        {myCourses.map(course => (
          <div key={course.id} className="course-card glass">
            <div className="course-header">
              <div className="course-info">
                <h3 className="course-title">{course.name}</h3>
                <p className="course-id">{course.id}</p>
              </div>
              <div className="course-icon">
                <BookOpen size={24} />
              </div>
            </div>
            
            <div className="course-stats">
              <div className="stat-item">
                <Users size={16} />
                <span>{course.students} Students</span>
              </div>
              <div className="stat-item">
                <Clock size={16} />
                <span>{course.schedule}</span>
              </div>
              <div className="stat-item">
                <TrendingUp size={16} />
                <span>{course.attendance}% Attendance</span>
              </div>
            </div>
            
            <div className="course-details">
              <p><strong>Room:</strong> {course.room}</p>
              <p><strong>Pending Assignments:</strong> {course.assignments}</p>
            </div>
            
            <div className="course-actions">
              <button className="action-btn primary">Take Attendance</button>
              <button className="action-btn secondary">View Students</button>
              <button className="action-btn tertiary">Assignments</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCourses;
