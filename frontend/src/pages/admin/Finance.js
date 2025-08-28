import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Download, Filter, Search, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Finance = () => {
  const [financeData, setFinanceData] = useState({});
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchFinanceData();
  }, [selectedPeriod]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      // const response = await adminAPI.getFinanceData();
      // setFinanceData(response.data || {});
      
      // Demo data
      setFinanceData({
        totalCollection: 2850000,
        pendingAmount: 450000,
        overdueAmount: 125000,
        monthlyTarget: 3000000,
        collectionRate: 86.3,
        totalStudents: 1247,
        paidStudents: 1076,
        pendingStudents: 171
      });

      setFeeRecords([
        { id: 1, studentId: 'STU001', name: 'John Doe', class: '12-A', feeType: 'Tuition', amount: 25000, paid: 25000, status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-10' },
        { id: 2, studentId: 'STU002', name: 'Jane Smith', class: '11-B', feeType: 'Hostel', amount: 15000, paid: 0, status: 'pending', dueDate: '2024-08-20', paidDate: null },
        { id: 3, studentId: 'STU003', name: 'Mike Johnson', class: '10-C', feeType: 'Transport', amount: 8000, paid: 4000, status: 'partial', dueDate: '2024-08-18', paidDate: '2024-08-12' },
        { id: 4, studentId: 'STU004', name: 'Sarah Wilson', class: '12-A', feeType: 'Tuition', amount: 25000, paid: 0, status: 'overdue', dueDate: '2024-08-10', paidDate: null }
      ]);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Collection',
      value: `₹${(financeData.totalCollection / 100000).toFixed(1)}L`,
      icon: DollarSign,
      trend: 'up',
      trendValue: '+15%',
      color: '#00d4ff'
    },
    {
      title: 'Pending Amount',
      value: `₹${(financeData.pendingAmount / 100000).toFixed(1)}L`,
      icon: Clock,
      trend: 'down',
      trendValue: '-8%',
      color: '#feca57'
    },
    {
      title: 'Overdue Amount',
      value: `₹${(financeData.overdueAmount / 100000).toFixed(1)}L`,
      icon: AlertTriangle,
      trend: 'up',
      trendValue: '+3%',
      color: '#ff6b6b'
    },
    {
      title: 'Collection Rate',
      value: `${financeData.collectionRate}%`,
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+2%',
      color: '#4ecdc4'
    }
  ];

  const monthlyCollectionData = [
    { month: 'Jan', collected: 2200000, target: 2500000 },
    { month: 'Feb', collected: 2350000, target: 2500000 },
    { month: 'Mar', collected: 2450000, target: 2600000 },
    { month: 'Apr', collected: 2600000, target: 2700000 },
    { month: 'May', collected: 2850000, target: 3000000 }
  ];

  const feeTypeDistribution = [
    { name: 'Tuition Fee', value: 65, amount: 1852500, color: '#00d4ff' },
    { name: 'Hostel Fee', value: 20, amount: 570000, color: '#4ecdc4' },
    { name: 'Transport Fee', value: 10, amount: 285000, color: '#feca57' },
    { name: 'Other Fees', value: 5, amount: 142500, color: '#ff6b6b' }
  ];

  const paymentStatusData = [
    { name: 'Paid', value: financeData.paidStudents, color: '#00d4ff' },
    { name: 'Pending', value: financeData.pendingStudents, color: '#feca57' },
    { name: 'Overdue', value: 45, color: '#ff6b6b' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#00d4ff';
      case 'pending': return '#feca57';
      case 'partial': return '#4ecdc4';
      case 'overdue': return '#ff6b6b';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'partial': return <Clock size={16} />;
      case 'overdue': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading finance data...</p>
      </div>
    );
  }

  return (
    <div className="finance-page">
      <div className="page-header">
        <div className="header-content">
          <h1><DollarSign size={24} /> Fee & Finance Management</h1>
          <p>Comprehensive financial overview and fee collection management</p>
        </div>
        <div className="header-actions">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card glass">
            <div className="stat-header">
              <div className="stat-icon" style={{ color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className={`stat-trend ${stat.trend}`}>
                {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{stat.trendValue}</span>
              </div>
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={selectedTab === 'overview' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button 
          className={selectedTab === 'collections' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('collections')}
        >
          Collections
        </button>
        <button 
          className={selectedTab === 'pending' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('pending')}
        >
          Pending Fees
        </button>
        <button 
          className={selectedTab === 'reports' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('reports')}
        >
          Reports
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Monthly Collection vs Target</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyCollectionData}>
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
                    <Bar dataKey="collected" fill="#00d4ff" name="Collected" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#4ecdc4" name="Target" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Fee Type Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={feeTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {feeTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {feeTypeDistribution.map((entry, index) => (
                    <div key={entry.name} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                      <span>{entry.name}: ₹{(entry.amount / 100000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Payment Status Overview</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="summary-panel glass">
                <h3>Financial Summary</h3>
                <div className="summary-items">
                  <div className="summary-item">
                    <span>Total Students</span>
                    <strong>{financeData.totalStudents}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Paid Students</span>
                    <strong style={{color: '#00d4ff'}}>{financeData.paidStudents}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Pending Students</span>
                    <strong style={{color: '#feca57'}}>{financeData.pendingStudents}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Collection Rate</span>
                    <strong style={{color: '#4ecdc4'}}>{financeData.collectionRate}%</strong>
                  </div>
                  <div className="summary-item">
                    <span>Monthly Target</span>
                    <strong>₹{(financeData.monthlyTarget / 100000).toFixed(1)}L</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'collections' && (
        <div className="tab-content">
          <div className="table-controls">
            <div className="search-filter-section">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <button className="btn btn-primary">
              <Plus size={16} />
              Add Fee Record
            </button>
          </div>

          <div className="fee-records-table glass">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.studentId}</td>
                    <td>{record.name}</td>
                    <td>{record.class}</td>
                    <td>{record.feeType}</td>
                    <td>₹{record.amount.toLocaleString()}</td>
                    <td>₹{record.paid.toLocaleString()}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(record.status)}20`,
                          color: getStatusColor(record.status),
                          border: `1px solid ${getStatusColor(record.status)}`
                        }}
                      >
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td>{record.dueDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" title="Edit">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Other tab contents would go here */}
    </div>
  );
};

export default Finance;
