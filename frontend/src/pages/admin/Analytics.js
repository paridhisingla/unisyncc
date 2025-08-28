import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, Users, BookOpen, Calendar, Download, Filter } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Analytics = () => {
  const [studentsPerCourse, setStudentsPerCourse] = useState([
    { name: 'CS101', students: 45 },
    { name: 'MATH101', students: 32 },
    { name: 'CS201', students: 28 },
    { name: 'PHY101', students: 38 }
  ]);
  const [attendanceData, setAttendanceData] = useState([
    { name: 'Present', value: 75, color: '#00d4ff' },
    { name: 'Absent', value: 15, color: '#ff6b6b' },
    { name: 'Late', value: 10, color: '#feca57' }
  ]);
  const [performanceData, setPerformanceData] = useState([
    { month: 'Jan', average: 78 },
    { month: 'Feb', average: 82 },
    { month: 'Mar', average: 85 },
    { month: 'Apr', average: 79 },
    { month: 'May', average: 88 }
  ]);
  const [departmentData, setDepartmentData] = useState([
    { name: 'Computer Science', students: 120 },
    { name: 'Mathematics', students: 85 },
    { name: 'Physics', students: 65 },
    { name: 'Chemistry', students: 70 }
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const COLORS = ['#00d4ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [studentsRes, attendanceRes, performanceRes, departmentRes] = await Promise.all([
        adminAPI.getStudentsPerCourse(),
        adminAPI.getAttendanceDistribution(),
        adminAPI.getPerformanceTrends(),
        adminAPI.getStudentsByDepartment()
      ]);

      const spc = (studentsRes.data?.data || []).map(item => ({
        name: item.name || item.code || item.course || 'N/A',
        students: item.studentsCount ?? item.count ?? 0,
      }));

      const att = (attendanceRes.data?.data || []).map((item, index) => ({
        name: item.status || 'Unknown',
        value: item.percent ?? item.count ?? 0,
        color: COLORS[index % COLORS.length],
      }));

      // Backend returns per-course averages; map as a categorical line chart for simplicity
      const perf = (performanceRes.data?.data || []).map(item => ({
        month: item.course || item.name || 'Course',
        average: Math.round(item.avgMarks ?? item.avg ?? 0),
      }));

      const dept = (departmentRes.data?.data || []).map(item => ({
        name: item.department || item.name || 'Unknown',
        students: item.count ?? 0,
      }));

      setStudentsPerCourse(spc);
      setAttendanceData(att);
      setPerformanceData(perf);
      setDepartmentData(dept);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set dummy data for demo
      setStudentsPerCourse([
        { name: 'CS101', students: 45 },
        { name: 'MATH101', students: 32 },
        { name: 'CS201', students: 28 },
        { name: 'PHY101', students: 38 }
      ]);
      setAttendanceData([
        { name: 'Present', value: 75, color: '#00d4ff' },
        { name: 'Absent', value: 15, color: '#ff6b6b' },
        { name: 'Late', value: 10, color: '#feca57' }
      ]);
      setPerformanceData([
        { month: 'Jan', average: 78 },
        { month: 'Feb', average: 82 },
        { month: 'Mar', average: 85 },
        { month: 'Apr', average: 79 },
        { month: 'May', average: 88 }
      ]);
      setDepartmentData([
        { name: 'Computer Science', students: 120 },
        { name: 'Mathematics', students: 85 },
        { name: 'Physics', students: 65 },
        { name: 'Chemistry', students: 70 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type) => {
    try {
      if (type === 'students') {
        await adminAPI.exportStudents();
      }
      // Add more export types as needed
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <div className="header-actions">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary" onClick={() => exportData('students')}>
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Students per Course Chart */}
        <div className="analytics-card glass">
          <div className="card-header">
            <h3><BookOpen size={20} /> Students per Course</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsPerCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid #00d4ff',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="students" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution */}
        <div className="analytics-card glass">
          <div className="card-header">
            <h3><Users size={20} /> Attendance Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            {attendanceData.map((entry, index) => (
              <div key={entry.name} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                ></div>
                <span>{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="analytics-card glass">
          <div className="card-header">
            <h3><TrendingUp size={20} /> Performance Trends</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid #00d4ff',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#00d4ff" 
                  strokeWidth={3}
                  dot={{ fill: '#00d4ff', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="analytics-card glass">
          <div className="card-header">
            <h3><Calendar size={20} /> Students by Department</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={departmentData}>
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background
                  clockWise
                  dataKey="students"
                  fill="#00d4ff"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-summary">
        <div className="stat-card glass">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <p>{departmentData.reduce((sum, dept) => sum + dept.students, 0)}</p>
          </div>
        </div>
        
        <div className="stat-card glass">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Courses</h3>
            <p>{studentsPerCourse.length}</p>
          </div>
        </div>
        
        <div className="stat-card glass">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Avg Performance</h3>
            <p>{performanceData.length > 0 ? Math.round(performanceData.reduce((sum, p) => sum + p.average, 0) / performanceData.length) : 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
