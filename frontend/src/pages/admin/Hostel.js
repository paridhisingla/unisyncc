import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Home, Users, Bed, MapPin, Plus, Edit, Trash2, Eye, Search, Filter, Download, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Hostel = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [hostelStats, setHostelStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('hostel'); // 'hostel', 'room', 'allocation'
  const [editingItem, setEditingItem] = useState(null);

  const [hostelForm, setHostelForm] = useState({
    name: '',
    type: 'boys',
    totalRooms: 0,
    totalCapacity: 0,
    warden: '',
    contactNumber: '',
    address: '',
    facilities: [],
    monthlyFee: 0,
    securityDeposit: 0,
    status: 'active'
  });

  const [roomForm, setRoomForm] = useState({
    hostelId: '',
    roomNumber: '',
    type: 'single',
    capacity: 1,
    currentOccupancy: 0,
    floor: 1,
    facilities: [],
    monthlyRent: 0,
    status: 'available'
  });

  const [allocationForm, setAllocationForm] = useState({
    studentId: '',
    hostelId: '',
    roomId: '',
    allocationDate: '',
    checkInDate: '',
    checkOutDate: '',
    monthlyFee: 0,
    securityDeposit: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      
      // Demo data
      setHostelStats({
        totalHostels: 8,
        totalRooms: 450,
        totalCapacity: 850,
        occupiedBeds: 720,
        availableBeds: 130,
        occupancyRate: 84.7,
        monthlyRevenue: 2850000,
        pendingAllocations: 15
      });

      setHostels([
        { id: 1, name: 'Sunrise Boys Hostel', type: 'boys', totalRooms: 80, totalCapacity: 160, currentOccupancy: 145, warden: 'Mr. Sharma', monthlyFee: 8000, status: 'active' },
        { id: 2, name: 'Moonlight Girls Hostel', type: 'girls', totalRooms: 70, totalCapacity: 140, currentOccupancy: 128, warden: 'Mrs. Patel', monthlyFee: 8500, status: 'active' },
        { id: 3, name: 'Green Valley Boys', type: 'boys', totalRooms: 60, totalCapacity: 120, currentOccupancy: 110, warden: 'Mr. Kumar', monthlyFee: 7500, status: 'active' },
        { id: 4, name: 'Rose Garden Girls', type: 'girls', totalRooms: 50, totalCapacity: 100, currentOccupancy: 85, warden: 'Ms. Singh', monthlyFee: 9000, status: 'active' }
      ]);

      setRooms([
        { id: 1, hostelId: 1, roomNumber: '101', type: 'double', capacity: 2, currentOccupancy: 2, floor: 1, monthlyRent: 4000, status: 'occupied' },
        { id: 2, hostelId: 1, roomNumber: '102', type: 'single', capacity: 1, currentOccupancy: 1, floor: 1, monthlyRent: 8000, status: 'occupied' },
        { id: 3, hostelId: 1, roomNumber: '103', type: 'double', capacity: 2, currentOccupancy: 0, floor: 1, monthlyRent: 4000, status: 'available' },
        { id: 4, hostelId: 2, roomNumber: '201', type: 'triple', capacity: 3, currentOccupancy: 2, floor: 2, monthlyRent: 3000, status: 'partially_occupied' }
      ]);

      setAllocations([
        { id: 1, studentName: 'John Doe', studentId: 'STU001', hostelName: 'Sunrise Boys Hostel', roomNumber: '101', allocationDate: '2024-08-01', monthlyFee: 8000, status: 'active' },
        { id: 2, studentName: 'Jane Smith', studentId: 'STU002', hostelName: 'Moonlight Girls Hostel', roomNumber: '201', allocationDate: '2024-08-05', monthlyFee: 8500, status: 'active' },
        { id: 3, studentName: 'Mike Johnson', studentId: 'STU003', hostelName: 'Green Valley Boys', roomNumber: '301', allocationDate: '2024-08-10', monthlyFee: 7500, status: 'pending' },
        { id: 4, studentName: 'Sarah Wilson', studentId: 'STU004', hostelName: 'Rose Garden Girls', roomNumber: '401', allocationDate: '2024-08-15', monthlyFee: 9000, status: 'active' }
      ]);
    } catch (error) {
      console.error('Error fetching hostel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Hostels',
      value: hostelStats.totalHostels?.toString() || '8',
      icon: Home,
      color: '#00d4ff'
    },
    {
      title: 'Total Capacity',
      value: hostelStats.totalCapacity?.toLocaleString() || '850',
      icon: Bed,
      color: '#4ecdc4'
    },
    {
      title: 'Occupied Beds',
      value: hostelStats.occupiedBeds?.toLocaleString() || '720',
      icon: Users,
      color: '#feca57'
    },
    {
      title: 'Occupancy Rate',
      value: `${hostelStats.occupancyRate || 84.7}%`,
      icon: CheckCircle,
      color: '#96ceb4'
    }
  ];

  const occupancyData = [
    { name: 'Sunrise Boys', capacity: 160, occupied: 145, available: 15 },
    { name: 'Moonlight Girls', capacity: 140, occupied: 128, available: 12 },
    { name: 'Green Valley Boys', capacity: 120, occupied: 110, available: 10 },
    { name: 'Rose Garden Girls', capacity: 100, occupied: 85, available: 15 }
  ];

  const roomTypeData = [
    { name: 'Single', count: 120, color: '#00d4ff' },
    { name: 'Double', count: 200, color: '#4ecdc4' },
    { name: 'Triple', count: 130, color: '#feca57' }
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 2650000 },
    { month: 'Feb', revenue: 2720000 },
    { month: 'Mar', revenue: 2800000 },
    { month: 'Apr', revenue: 2750000 },
    { month: 'May', revenue: 2850000 },
    { month: 'Jun', revenue: 2900000 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'hostel') {
        if (editingItem) {
          await adminAPI.updateHostel(editingItem.id, hostelForm);
          setHostels(hostels.map(hostel => 
            hostel.id === editingItem.id ? { ...hostel, ...hostelForm } : hostel
          ));
        } else {
          const response = await adminAPI.createHostel(hostelForm);
          setHostels([...hostels, { ...hostelForm, id: response.data.id || Date.now() }]);
        }
      }
      resetForm();
    } catch (error) {
      console.error('Error saving hostel:', error);
      // For demo, still update the UI
      if (modalType === 'hostel') {
        if (editingItem) {
          setHostels(hostels.map(hostel => 
            hostel.id === editingItem.id ? { ...hostel, ...hostelForm } : hostel
          ));
        } else {
          setHostels([...hostels, { ...hostelForm, id: Date.now() }]);
        }
      }
      resetForm();
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === 'hostel') {
          await adminAPI.deleteHostel(id);
          setHostels(hostels.filter(hostel => hostel.id !== id));
        }
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        if (type === 'hostel') {
          setHostels(hostels.filter(hostel => hostel.id !== id));
        }
      }
    }
  };

  const resetForm = () => {
    setHostelForm({
      name: '',
      type: 'boys',
      totalRooms: 0,
      totalCapacity: 0,
      warden: '',
      contactNumber: '',
      address: '',
      facilities: [],
      monthlyFee: 0,
      securityDeposit: 0,
      status: 'active'
    });
    setRoomForm({
      hostelId: '',
      roomNumber: '',
      type: 'single',
      capacity: 1,
      currentOccupancy: 0,
      floor: 1,
      facilities: [],
      monthlyRent: 0,
      status: 'available'
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      if (type === 'hostel') {
        setHostelForm(item);
      }
    }
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case 'available': case 'occupied': return '#4ecdc4';
      case 'pending': case 'partially_occupied': return '#feca57';
      case 'inactive': case 'maintenance': return '#ff6b6b';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': case 'available': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'inactive': case 'maintenance': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading hostel data...</p>
      </div>
    );
  }

  return (
    <div className="hostel-page">
      <div className="page-header">
        <div className="header-content">
          <h1><Home size={24} /> Hostel Management</h1>
          <p>Comprehensive hostel and accommodation management system</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn btn-primary" onClick={() => openModal('hostel')}>
            <Plus size={16} />
            Add Hostel
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card glass">
            <div className="stat-icon" style={{ color: stat.color }}>
              <stat.icon size={24} />
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
          className={selectedTab === 'hostels' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('hostels')}
        >
          Hostels
        </button>
        <button 
          className={selectedTab === 'rooms' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('rooms')}
        >
          Rooms
        </button>
        <button 
          className={selectedTab === 'allocations' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('allocations')}
        >
          Allocations
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Hostel Occupancy</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#fff" fontSize={12} />
                    <YAxis stroke="#fff" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        border: '1px solid #00d4ff',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="occupied" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="available" fill="#4ecdc4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Room Type Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {roomTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {roomTypeData.map((entry, index) => (
                    <div key={entry.name} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                      <span>{entry.name}: {entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Monthly Revenue Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#fff" fontSize={12} />
                    <YAxis stroke="#fff" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        border: '1px solid #00d4ff',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'hostels' && (
        <div className="tab-content">
          <div className="table-controls">
            <div className="search-filter-section">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search hostels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={filterHostel} onChange={(e) => setFilterHostel(e.target.value)}>
                <option value="all">All Types</option>
                <option value="boys">Boys Hostel</option>
                <option value="girls">Girls Hostel</option>
              </select>
            </div>
          </div>

          <div className="hostels-table glass">
            <table>
              <thead>
                <tr>
                  <th>Hostel Name</th>
                  <th>Type</th>
                  <th>Total Rooms</th>
                  <th>Capacity</th>
                  <th>Occupancy</th>
                  <th>Warden</th>
                  <th>Monthly Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map(hostel => (
                  <tr key={hostel.id}>
                    <td>{hostel.name}</td>
                    <td>
                      <span className="type-badge" style={{ 
                        backgroundColor: hostel.type === 'boys' ? '#00d4ff20' : '#ff6b6b20',
                        color: hostel.type === 'boys' ? '#00d4ff' : '#ff6b6b'
                      }}>
                        {hostel.type.charAt(0).toUpperCase() + hostel.type.slice(1)}
                      </span>
                    </td>
                    <td>{hostel.totalRooms}</td>
                    <td>{hostel.totalCapacity}</td>
                    <td>
                      <div className="occupancy-info">
                        <span>{hostel.currentOccupancy}/{hostel.totalCapacity}</span>
                        <div className="occupancy-bar">
                          <div 
                            className="occupancy-fill" 
                            style={{ 
                              width: `${(hostel.currentOccupancy / hostel.totalCapacity) * 100}%`,
                              backgroundColor: '#00d4ff'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>{hostel.warden}</td>
                    <td>₹{hostel.monthlyFee.toLocaleString()}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(hostel.status)}20`,
                          color: getStatusColor(hostel.status),
                          border: `1px solid ${getStatusColor(hostel.status)}`
                        }}
                      >
                        {getStatusIcon(hostel.status)}
                        {hostel.status.charAt(0).toUpperCase() + hostel.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => openModal('hostel', hostel)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon btn-danger" title="Delete" onClick={() => handleDelete('hostel', hostel.id)}>
                          <Trash2 size={16} />
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

      {selectedTab === 'rooms' && (
        <div className="tab-content">
          <div className="rooms-table glass">
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Hostel</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Current Occupancy</th>
                  <th>Floor</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <td>{room.roomNumber}</td>
                    <td>{hostels.find(h => h.id === room.hostelId)?.name || 'N/A'}</td>
                    <td>{room.type}</td>
                    <td>{room.capacity}</td>
                    <td>{room.currentOccupancy}</td>
                    <td>{room.floor}</td>
                    <td>₹{room.monthlyRent.toLocaleString()}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(room.status)}20`,
                          color: getStatusColor(room.status),
                          border: `1px solid ${getStatusColor(room.status)}`
                        }}
                      >
                        {getStatusIcon(room.status)}
                        {room.status.replace('_', ' ').charAt(0).toUpperCase() + room.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
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

      {selectedTab === 'allocations' && (
        <div className="tab-content">
          <div className="allocations-table glass">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Hostel</th>
                  <th>Room</th>
                  <th>Allocation Date</th>
                  <th>Monthly Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(allocation => (
                  <tr key={allocation.id}>
                    <td>{allocation.studentName}</td>
                    <td>{allocation.studentId}</td>
                    <td>{allocation.hostelName}</td>
                    <td>{allocation.roomNumber}</td>
                    <td>{allocation.allocationDate}</td>
                    <td>₹{allocation.monthlyFee.toLocaleString()}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(allocation.status)}20`,
                          color: getStatusColor(allocation.status),
                          border: `1px solid ${getStatusColor(allocation.status)}`
                        }}
                      >
                        {getStatusIcon(allocation.status)}
                        {allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View Details">
                          <Eye size={16} />
                        </button>
                        {allocation.status === 'pending' && (
                          <button className="btn-sm btn-primary">Approve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Hostel Modal */}
      {showModal && modalType === 'hostel' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Hostel' : 'Add New Hostel'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Hostel Name</label>
                  <input
                    type="text"
                    value={hostelForm.name}
                    onChange={(e) => setHostelForm({...hostelForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={hostelForm.type}
                    onChange={(e) => setHostelForm({...hostelForm, type: e.target.value})}
                    required
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Total Rooms</label>
                  <input
                    type="number"
                    min="1"
                    value={hostelForm.totalRooms}
                    onChange={(e) => setHostelForm({...hostelForm, totalRooms: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={hostelForm.totalCapacity}
                    onChange={(e) => setHostelForm({...hostelForm, totalCapacity: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Warden Name</label>
                  <input
                    type="text"
                    value={hostelForm.warden}
                    onChange={(e) => setHostelForm({...hostelForm, warden: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={hostelForm.contactNumber}
                    onChange={(e) => setHostelForm({...hostelForm, contactNumber: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Monthly Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={hostelForm.monthlyFee}
                    onChange={(e) => setHostelForm({...hostelForm, monthlyFee: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Security Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={hostelForm.securityDeposit}
                    onChange={(e) => setHostelForm({...hostelForm, securityDeposit: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={hostelForm.address}
                  onChange={(e) => setHostelForm({...hostelForm, address: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update Hostel' : 'Add Hostel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;
