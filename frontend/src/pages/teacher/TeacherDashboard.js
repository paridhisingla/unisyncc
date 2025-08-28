import React from 'react';
import Card from '../../components/Card';
import Chart from '../../components/Chart';
import { BookOpen, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { attendanceData } from '../../data/dummyData';

const TeacherDashboard = () => {
  const stats = [
    {
      title: 'Assigned Courses',
      value: 2,
      icon: BookOpen,
      trend: 'stable',
      trendValue: '0%'
    },
    {
      title: 'Total Students',
      value: 83,
      icon: Users,
      trend: 'up',
      trendValue: '+5%'
    },
    {
      title: 'Pending Attendance',
      value: 3,
      icon: ClipboardList,
      trend: 'down',
      trendValue: '-2'
    },
    {
      title: 'Avg Class Attendance',
      value: '89%',
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+4%'
    }
  ];

  const attendanceTrendData = attendanceData.map(item => ({
    name: item.week,
    value: item.attendance
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p>Manage your courses and track student progress.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-col-full">
            <Chart
              type="line"
              data={attendanceTrendData}
              title="Attendance Trend Over Weeks"
            />
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card glass">
            <h3>Take Attendance</h3>
            <p>Mark today's attendance for your classes</p>
            <button className="action-btn primary">Take Attendance</button>
          </div>
          <div className="action-card glass">
            <h3>Grade Assignments</h3>
            <p>Review and grade pending assignments</p>
            <button className="action-btn secondary">View Assignments</button>
          </div>
          <div className="action-card glass">
            <h3>Post Notice</h3>
            <p>Share important updates with students</p>
            <button className="action-btn tertiary">Create Notice</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
