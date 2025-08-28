import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, BookOpen, GraduationCap, TrendingUp, Calendar, Bell, 
  DollarSign, UserCheck, CheckCircle, Activity, Wifi, Shield,
  Settings, Download, Filter, Plus, ChevronRight, TrendingDown, BarChart3
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './EnhancedDashboard.css';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}${entry.unit || ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend Component
const CustomLegend = ({ payload }) => (
  <div className="custom-legend">
    {payload.map((entry, index) => (
      <div key={`legend-${index}`} className="legend-item">
        <div className="legend-color" style={{ backgroundColor: entry.color }} />
        <span>{entry.value}</span>
      </div>
    ))}
  </div>
);

// Stats Card Component
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgGradient }) => (
  <div className="stat-card" style={{ background: bgGradient }}>
    <div className="stat-icon" style={{ color }}>
      <Icon size={24} />
    </div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{title}</p>
      <div className={`stat-trend ${trend}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : 
         trend === 'down' ? <TrendingDown size={14} /> : 
         <BarChart3 size={14} />}
        <span>{trendValue}</span>
      </div>
    </div>
  </div>
);

const EnhancedDashboard = () => {
  // Color scheme
  const colors = {
    primary: '#4f46e5',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    dark: '#1f2937',
    light: '#f9fafb',
  };

  // State
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 1247,
    totalTeachers: 89,
    totalStaff: 45,
    totalCourses: 156,
    feesCollected: 2850000,
    pendingFees: 450000,
    todayAttendance: 87.5,
    libraryBooks: 15420,
    hostelOccupancy: 78,
    transportRoutes: 12,
    activeComplaints: 5,
    resolvedComplaints: 142,
    upcomingEvents: 5,
    systemHealth: 98.5,
    networkStatus: 'Excellent',
    serverLoad: 45
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Chart data
  const attendanceData = [
    { name: 'Present', value: 85, color: '#00d4ff' },
    { name: 'Absent', value: 10, color: '#ff6b6b' },
    { name: 'Late', value: 5, color: '#feca57' }
  ];

  const recentActivities = [
    { id: 1, type: 'student', message: 'New student registered', time: '2h ago', icon: Users },
    { id: 2, type: 'fee', message: 'Fee payment received', time: '4h ago', icon: DollarSign },
    { id: 3, type: 'exam', message: 'Exam results published', time: '6h ago', icon: Award },
    { id: 4, type: 'complaint', message: 'Complaint resolved', time: '8h ago', icon: CheckCircle },
    { id: 5, type: 'event', message: 'Event scheduled', time: '1d ago', icon: Calendar }
  ];

  // Stats data
  const stats = [
    {
      title: 'Total Students',
      value: dashboardData.totalStudents,
      icon: Users,
      trend: 'up',
      trendValue: '+12%',
      color: '#00d4ff',
      bgGradient: 'linear-gradient(135deg, #00d4ff20, #00d4ff10)'
    },
    {
      title: 'Faculty Members',
      value: dashboardData.totalTeachers,
      icon: GraduationCap,
      trend: 'up',
      trendValue: '+5%',
      color: '#4ecdc4',
      bgGradient: 'linear-gradient(135deg, #4ecdc420, #4ecdc410)'
    },
    {
      title: 'Active Courses',
      value: dashboardData.totalCourses,
      icon: BookOpen,
      trend: 'up',
      trendValue: '+8%',
      color: '#ff6b6b',
      bgGradient: 'linear-gradient(135deg, #ff6b6b20, #ff6b6b10)'
    },
    {
      title: 'Revenue',
      value: `$${(dashboardData.feesCollected / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      trend: 'up',
      trendValue: '+15%',
      color: '#96ceb4',
      bgGradient: 'linear-gradient(135deg, #96ceb420, #96ceb410)'
    }
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getStats();
        setDashboardData(prev => ({
          ...prev,
          ...response.data,
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Format time and date helpers
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Render the dashboard
  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <div className="dashboard-nav">
        <div className="nav-left">
          <h1>Dashboard</h1>
          <div className="breadcrumb">
            <span>Home</span>
            <ChevronRight size={14} />
            <span className="active">Overview</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="timeframe-selector">
            <button 
              className={selectedTimeframe === 'day' ? 'active' : ''}
              onClick={() => setSelectedTimeframe('day')}
            >
              Day
            </button>
            <button 
              className={selectedTimeframe === 'week' ? 'active' : ''}
              onClick={() => setSelectedTimeframe('week')}
            >
              Week
            </button>
            <button 
              className={selectedTimeframe === 'month' ? 'active' : ''}
              onClick={() => setSelectedTimeframe('month')}
            >
              Month
            </button>
          </div>
          <button 
            className="notifications" 
            onClick={() => setNotifications(0)}
            aria-label={`${notifications} new notifications`}
          >
            <Bell size={20} />
            {notifications > 0 && (
              <span className="notification-badge">{notifications}</span>
            )}
          </button>
          <div className="user-profile">
            <div className="avatar">
              <UserCheck size={20} />
            </div>
            <div className="user-info">
              <span className="name">Admin User</span>
              <span className="role">Administrator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="content-left">
          {/* Performance Overview */}
          <div className="card">
            <div className="card-header">
              <h3>Performance Overview</h3>
              <div className="card-actions">
                <button className="btn-icon" aria-label="Download">
                  <Download size={16} />
                </button>
                <button className="btn-icon" aria-label="Settings">
                  <Settings size={16} />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={colors.primary} 
                      fill={colors.primary} 
                      fillOpacity={0.1} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              <button className="btn-text">View All</button>
            </div>
            <div className="card-body">
              <div className="activity-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <activity.icon size={18} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-right">
          {/* Attendance Overview */}
          <div className="card">
            <div className="card-header">
              <h3>Attendance Overview</h3>
              <div className="card-actions">
                <button className="btn-icon" aria-label="Filter">
                  <Filter size={16} />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="attendance-stats">
                <div className="attendance-figure">
                  <h2>{Math.round(dashboardData.todayAttendance)}%</h2>
                  <p>Today's Attendance</p>
                </div>
                <div className="attendance-chart">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="attendance-legend">
                {attendanceData.map((entry, index) => (
                  <div key={`legend-${index}`} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                    <span className="legend-value">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <button className="action-btn primary">
                  <Plus size={18} />
                  <span>Add Student</span>
                </button>
                <button className="action-btn success">
                  <UserCheck size={18} />
                  <span>Add Staff</span>
                </button>
                <button className="action-btn warning">
                  <BookOpen size={18} />
                  <span>New Course</span>
                </button>
                <button className="action-btn danger">
                  <Bell size={18} />
                  <span>Send Notice</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <div className="card-header">
              <h3>System Status</h3>
              <div className="status-badge online">All Systems Operational</div>
            </div>
            <div className="card-body">
              <div className="system-status">
                <div className="status-item">
                  <div className="status-icon online">
                    <Wifi size={16} />
                  </div>
                  <div className="status-info">
                    <span className="status-label">Network</span>
                    <span className="status-value">Stable</span>
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-icon online">
                    <Activity size={16} />
                  </div>
                  <div className="status-info">
                    <span className="status-label">Server</span>
                    <span className="status-value">Operational</span>
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-icon online">
                    <Shield size={16} />
                  </div>
                  <div className="status-info">
                    <span className="status-label">Security</span>
                    <span className="status-value">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
