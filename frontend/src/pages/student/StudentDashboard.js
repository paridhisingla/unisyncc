import React from 'react';
import Card from '../../components/Card';
import Chart from '../../components/Chart';
import { BookOpen, TrendingUp, Calendar, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const stats = [
    {
      title: 'Enrolled Courses',
      value: 5,
      icon: BookOpen,
      trend: 'stable',
      trendValue: '0%'
    },
    {
      title: 'Attendance Rate',
      value: '85%',
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+2%'
    },
    {
      title: 'Upcoming Exams',
      value: 3,
      icon: Calendar,
      trend: 'neutral',
      trendValue: 'This month'
    },
    {
      title: 'Study Hours',
      value: '24h',
      icon: Clock,
      trend: 'up',
      trendValue: '+6h'
    }
  ];

  const progressData = [
    { name: 'CS101', value: 85 },
    { name: 'MATH101', value: 92 },
    { name: 'PHY101', value: 78 },
    { name: 'CHEM101', value: 88 },
    { name: 'ENG101', value: 90 }
  ];

  const performanceData = [
    { name: 'Excellent', value: 40 },
    { name: 'Good', value: 35 },
    { name: 'Average', value: 20 },
    { name: 'Needs Improvement', value: 5 }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Track your academic progress and stay updated with campus activities.</p>
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
          <div className="chart-col">
            <Chart
              type="bar"
              data={progressData}
              title="Course Progress"
            />
          </div>
          <div className="chart-col">
            <Chart
              type="radial"
              data={[{ name: 'Overall Performance', value: 85 }]}
              title="Overall Performance"
            />
          </div>
        </div>
      </div>

      <div className="upcoming-section">
        <h2>Upcoming Events</h2>
        <div className="event-cards">
          <div className="event-card glass">
            <div className="event-date">
              <span className="day">15</span>
              <span className="month">Mar</span>
            </div>
            <div className="event-info">
              <h3>Mid-term Exam - CS101</h3>
              <p>Programming Fundamentals</p>
              <span className="event-time">9:00 AM - 12:00 PM</span>
            </div>
          </div>
          <div className="event-card glass">
            <div className="event-date">
              <span className="day">18</span>
              <span className="month">Mar</span>
            </div>
            <div className="event-info">
              <h3>Assignment Due - MATH101</h3>
              <p>Calculus Problem Set 3</p>
              <span className="event-time">11:59 PM</span>
            </div>
          </div>
          <div className="event-card glass">
            <div className="event-date">
              <span className="day">20</span>
              <span className="month">Mar</span>
            </div>
            <div className="event-info">
              <h3>Lab Session - PHY101</h3>
              <p>Optics Experiment</p>
              <span className="event-time">2:00 PM - 5:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
