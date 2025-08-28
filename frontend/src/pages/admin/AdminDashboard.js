import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, BookOpen, GraduationCap, Bell, TrendingUp, Calendar, UserCheck, UserPlus, AlertCircle, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Chart from '../../components/Chart';
import { adminAPI } from '../../services/api';
import { 
  departments, 
  recentActivities, 
  studentGrowthData, 
  examPerformanceData 
} from '../../data/dummyData';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total Students', value: 0, icon: Users, trend: 'up', trendValue: '' },
    { title: 'Total Teachers', value: 0, icon: GraduationCap, trend: 'up', trendValue: '' },
    { title: 'Total Courses', value: 0, icon: BookOpen, trend: 'stable', trendValue: '' },
    { title: 'Active Notices', value: 0, icon: Bell, trend: 'up', trendValue: '' },
    { title: 'Avg Attendance', value: '—', icon: TrendingUp, trend: 'up', trendValue: '' }
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getStats();
        const { students, teachers, courses, notices } = res.data || {};
        setStats((prev) => [
          { ...prev[0], value: students ?? 0 },
          { ...prev[1], value: teachers ?? 0 },
          { ...prev[2], value: courses ?? 0 },
          { ...prev[3], value: notices ?? 0 },
          prev[4],
        ]);
      } catch (e) {
        // leave defaults
      }
    })();
  }, []);

  // Recent student registrations (kept from dummy for now)
  const recentStudents = [];

  const studentColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department' },
    { key: 'registrationDate', header: 'Registration Date' }
  ];

  // Chart data
  const studentsPerDepartment = departments.map(dept => ({
    name: dept.name,
    value: dept.students
  }));

  const attendanceData = [
    { name: 'Excellent (90-100%)', value: 35 },
    { name: 'Good (80-89%)', value: 40 },
    { name: 'Average (70-79%)', value: 20 },
    { name: 'Poor (<70%)', value: 5 }
  ];

  const studentGrowthChartData = studentGrowthData.map(item => ({
    name: item.month,
    value: item.students
  }));

  const examPerformanceChartData = examPerformanceData.map(item => ({
    name: item.subject,
    excellent: item.excellent,
    good: item.good,
    average: item.average,
    poor: item.poor
  }));

  const getActivityIcon = (iconName) => {
    const icons = {
      UserPlus,
      Bell,
      BookOpen,
      UserCheck
    };
    return icons[iconName] || Clock;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening at your campus today.</p>
      </div>

      {/* Enhanced Statistics Cards */}
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

      {/* Enhanced Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-col">
            <Chart
              type="bar"
              data={studentsPerDepartment}
              title="Students per Department"
            />
          </div>
          <div className="chart-col">
            <Chart
              type="pie"
              data={attendanceData}
              title="Attendance Distribution"
            />
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-col">
            <Chart
              type="line"
              data={studentGrowthChartData}
              title="Student Growth Over Time"
            />
          </div>
          <div className="chart-col">
            <Chart
              type="radial"
              data={[{ name: 'Overall Performance', value: 85 }]}
              title="Exam Performance Trends"
            />
          </div>
        </div>
      </div>

      <div className="dashboard-content-row">
        {/* Recent Activity Timeline */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-timeline glass">
            {recentActivities.map(activity => {
              const IconComponent = getActivityIcon(activity.icon);
              return (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <IconComponent size={16} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="table-section">
          <h2>Recent Student Registrations</h2>
          <Table
            columns={studentColumns}
            data={recentStudents}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
