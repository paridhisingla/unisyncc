import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, BookOpen, GraduationCap, TrendingUp, Calendar, Bell, 
  DollarSign, UserCheck, CheckCircle, Activity, Wifi, Shield,
  Settings, Download, Filter, Plus, ChevronRight, TrendingDown, BarChart3,
  Award, Clock, AlertTriangle, Target, Eye, CreditCard, RefreshCw
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Chart data
  const attendanceData = [
    { name: 'Present', value: 85, color: '#00d4ff' },
    { name: 'Absent', value: 10, color: '#ff6b6b' },
    { name: 'Late', value: 5, color: '#feca57' }
  ];

  // Performance data for the area chart
  const performanceData = [
    { name: 'Mon', students: 1200, teachers: 85, courses: 150 },
    { name: 'Tue', students: 1220, teachers: 87, courses: 152 },
    { name: 'Wed', students: 1240, teachers: 88, courses: 154 },
    { name: 'Thu', students: 1245, teachers: 89, courses: 155 },
    { name: 'Fri', students: 1247, teachers: 89, courses: 156 },
    { name: 'Sat', students: 1240, teachers: 88, courses: 155 },
    { name: 'Sun', students: 1235, teachers: 87, courses: 154 }
  ];

  const recentActivities = [
    { id: 1, type: 'student', message: 'New student Rahul Kumar registered for Computer Science', time: '2h ago', icon: Users },
    { id: 2, type: 'fee', message: 'Fee payment of ₹45,000 received from Priya Sharma', time: '4h ago', icon: DollarSign },
    { id: 3, type: 'exam', message: 'Mid-semester exam results published for Engineering', time: '6h ago', icon: Award },
    { id: 4, type: 'complaint', message: 'Library complaint resolved - AC maintenance completed', time: '8h ago', icon: CheckCircle },
    { id: 5, type: 'event', message: 'Annual sports meet scheduled for next month', time: '1d ago', icon: Calendar },
    { id: 6, type: 'teacher', message: 'New teacher Dr. Meena Patel joined Mathematics department', time: '1d ago', icon: GraduationCap }
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
    fetchDashboardData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Auto-refresh data every 5 minutes
    const dataInterval = setInterval(() => {
      fetchDashboardData();
    }, 300000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!loading) setRefreshing(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await adminAPI.getStats();
      if (response.data) {
        setDashboardData(prev => ({
          ...prev,
          ...response.data,
        }));
        setSuccessMessage('Dashboard data updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Using demo data.');
      
      // Set comprehensive demo data with real-time variations
      const baseData = {
        totalStudents: 1247 + Math.floor(Math.random() * 10),
        totalTeachers: 89,
        totalStaff: 45,
        totalCourses: 156,
        feesCollected: 2850000 + Math.floor(Math.random() * 50000),
        pendingFees: 450000 - Math.floor(Math.random() * 10000),
        todayAttendance: 87.5 + Math.random() * 5,
        libraryBooks: 15420,
        hostelOccupancy: 78 + Math.floor(Math.random() * 5),
        transportRoutes: 12,
        activeComplaints: 8 - Math.floor(Math.random() * 3),
        resolvedComplaints: 142 + Math.floor(Math.random() * 5),
        upcomingEvents: 5,
        systemHealth: 98.5,
        networkStatus: 'Excellent',
        serverLoad: 45 + Math.random() * 20
      };
      setDashboardData(baseData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'addStudent':
        console.log('Navigating to Manage Students page...');
        window.location.href = '/admin/manage-students';
        break;
      case 'addStaff':
        console.log('Navigating to Manage Teachers page...');
        window.location.href = '/admin/manage-teachers';
        break;
      case 'newCourse':
        console.log('Navigating to Courses page...');
        window.location.href = '/admin/courses';
        break;
      case 'sendNotice':
        console.log('Navigating to Notices page...');
        window.location.href = '/admin/notices';
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  const handleNotificationClick = () => {
    setNotifications(0);
    // Could navigate to notifications page
    console.log('Notifications clicked');
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    // Could fetch data for specific timeframe
    console.log('Timeframe changed to:', timeframe);
    // In a real app, you would fetch data for the selected timeframe
    // fetchDashboardData(timeframe);
  };

  const handleViewAllActivities = () => {
    // Navigate to activities page or show more activities
    console.log('View all activities clicked');
    // For now, just show a message. You can implement a modal or navigate to a page
    alert('View all activities feature - This would show more detailed activity logs');
  };

  const handleDownloadData = () => {
    // Download dashboard data as CSV/Excel
    console.log('Downloading dashboard data...');
    // In a real app, you would trigger a download
  };

  const handleSettingsClick = () => {
    // Open dashboard settings
    console.log('Opening dashboard settings...');
    // In a real app, you would open a settings modal
  };

  const handleFilterClick = () => {
    // Open attendance filter
    console.log('Opening attendance filter...');
    // In a real app, you would open a filter modal
  };

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
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="success-banner">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

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
              onClick={() => handleTimeframeChange('day')}
            >
              Day
            </button>
            <button 
              className={selectedTimeframe === 'week' ? 'active' : ''}
              onClick={() => handleTimeframeChange('week')}
            >
              Week
            </button>
            <button 
              className={selectedTimeframe === 'month' ? 'active' : ''}
              onClick={() => handleTimeframeChange('month')}
            >
              Month
            </button>
          </div>
          
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button 
            className="notifications" 
            onClick={handleNotificationClick}
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
        {loading ? (
          // Loading skeleton for stats
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-card" style={{ opacity: 0.6 }}>
              <div className="stat-icon" style={{ background: 'var(--gray-200)' }}>
                <div style={{ width: 24, height: 24, background: 'var(--gray-300)', borderRadius: '4px' }} />
          </div>
          <div className="stat-content">
                <div style={{ width: '60%', height: '1.5rem', background: 'var(--gray-200)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div style={{ width: '80%', height: '0.875rem', background: 'var(--gray-200)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div style={{ width: '40%', height: '0.75rem', background: 'var(--gray-200)', borderRadius: '4px' }} />
            </div>
          </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
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
                <button className="btn-icon" aria-label="Download" onClick={handleDownloadData}>
                  <Download size={16} />
                </button>
                <button className="btn-icon" aria-label="Settings" onClick={handleSettingsClick}>
                  <Settings size={16} />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                {loading ? (
                  <div style={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--border-radius)'
                  }}>
                    <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                      <div style={{ width: 40, height: 40, border: '3px solid var(--gray-200)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                      Loading chart data...
                    </div>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="students" 
                        stroke={colors.primary} 
                        fill={colors.primary} 
                        fillOpacity={0.1}
                        name="Students"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="teachers" 
                        stroke={colors.secondary} 
                        fill={colors.secondary} 
                        fillOpacity={0.1}
                        name="Teachers"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="courses" 
                        stroke={colors.accent} 
                        fill={colors.accent} 
                        fillOpacity={0.1}
                        name="Courses"
                      />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              <button className="btn-text" onClick={handleViewAllActivities}>View All</button>
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
                <button className="btn-icon" aria-label="Filter" onClick={handleFilterClick}>
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
                  {loading ? (
                    <div style={{ 
                      height: 200, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)'
                    }}>
                      <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                        <div style={{ width: 40, height: 40, border: '3px solid var(--gray-200)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                        Loading attendance data...
                      </div>
                    </div>
                  ) : (
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
                  )}
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
                <button 
                  className="action-btn primary"
                  onClick={() => handleQuickAction('addStudent')}
                >
                  <Plus size={18} />
                  <span>Add Student</span>
                </button>
                <button 
                  className="action-btn success"
                  onClick={() => handleQuickAction('addStaff')}
                >
                  <UserCheck size={18} />
                  <span>Add Staff</span>
                </button>
                <button 
                  className="action-btn warning"
                  onClick={() => handleQuickAction('newCourse')}
                >
                  <BookOpen size={18} />
                  <span>New Course</span>
                </button>
                <button 
                  className="action-btn danger"
                  onClick={() => handleQuickAction('sendNotice')}
                >
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
