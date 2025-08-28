import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Truck, MapPin, Users, Navigation, Plus, Edit, Trash2, Eye, Search, Download, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Transport = () => {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [transportStats, setTransportStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('route');
  const [editingItem, setEditingItem] = useState(null);

  const [routeForm, setRouteForm] = useState({
    name: '',
    startPoint: '',
    endPoint: '',
    distance: 0,
    fare: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchTransportData();
  }, []);

  const fetchTransportData = async () => {
    try {
      setLoading(true);
      
      setTransportStats({
        totalRoutes: 15,
        totalVehicles: 25,
        activeSubscriptions: 850,
        monthlyRevenue: 425000
      });

      setRoutes([
        { id: 1, name: 'Route A - City Center', startPoint: 'Main Campus', endPoint: 'City Center', distance: 15, fare: 25, activeSubscriptions: 120, status: 'active' },
        { id: 2, name: 'Route B - Railway Station', startPoint: 'Main Campus', endPoint: 'Railway Station', distance: 12, fare: 20, activeSubscriptions: 95, status: 'active' },
        { id: 3, name: 'Route C - IT Park', startPoint: 'Main Campus', endPoint: 'IT Park', distance: 18, fare: 30, activeSubscriptions: 85, status: 'active' },
        { id: 4, name: 'Route D - Airport', startPoint: 'Main Campus', endPoint: 'Airport', distance: 25, fare: 50, activeSubscriptions: 45, status: 'maintenance' }
      ]);

      setVehicles([
        { id: 1, vehicleNumber: 'TN-01-AB-1234', type: 'bus', capacity: 40, routeId: 1, driverName: 'Rajesh Kumar', status: 'active' },
        { id: 2, vehicleNumber: 'TN-01-AB-5678', type: 'bus', capacity: 35, routeId: 2, driverName: 'Suresh Patel', status: 'active' },
        { id: 3, vehicleNumber: 'TN-01-AB-9012', type: 'van', capacity: 15, routeId: 3, driverName: 'Amit Singh', status: 'maintenance' }
      ]);

      setSubscriptions([
        { id: 1, studentName: 'John Doe', studentId: 'STU001', routeName: 'Route A - City Center', subscriptionType: 'monthly', startDate: '2024-08-01', endDate: '2024-08-31', fare: 750, status: 'active' },
        { id: 2, studentName: 'Jane Smith', studentId: 'STU002', routeName: 'Route B - Railway Station', subscriptionType: 'semester', startDate: '2024-08-01', endDate: '2024-12-31', fare: 3000, status: 'active' }
      ]);
    } catch (error) {
      console.error('Error fetching transport data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'Total Routes', value: '15', icon: Navigation, color: '#00d4ff' },
    { title: 'Active Vehicles', value: '25', icon: Truck, color: '#4ecdc4' },
    { title: 'Subscriptions', value: '850', icon: Users, color: '#feca57' },
    { title: 'Monthly Revenue', value: '₹4,25,000', icon: CheckCircle, color: '#96ceb4' }
  ];

  const routeUsageData = [
    { name: 'Route A', subscriptions: 120, capacity: 160 },
    { name: 'Route B', subscriptions: 95, capacity: 140 },
    { name: 'Route C', subscriptions: 85, capacity: 120 },
    { name: 'Route D', subscriptions: 45, capacity: 90 }
  ];

  const vehicleTypeData = [
    { name: 'Bus', count: 18, color: '#00d4ff' },
    { name: 'Van', count: 5, color: '#4ecdc4' },
    { name: 'Mini Bus', count: 2, color: '#feca57' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        setRoutes(routes.map(route => 
          route.id === editingItem.id ? { ...route, ...routeForm } : route
        ));
      } else {
        setRoutes([...routes, { ...routeForm, id: Date.now() }]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving route:', error);
      resetForm();
    }
  };

  const resetForm = () => {
    setRouteForm({ name: '', startPoint: '', endPoint: '', distance: 0, fare: 0, status: 'active' });
    setEditingItem(null);
    setShowModal(false);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      setRouteForm(item);
    }
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4ecdc4';
      case 'pending': return '#feca57';
      case 'maintenance': return '#ff6b6b';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'maintenance': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transport data...</p>
      </div>
    );
  }

  return (
    <div className="transport-page">
      <div className="page-header">
        <div className="header-content">
          <h1><Truck size={24} /> Transport Management</h1>
          <p>Comprehensive transport and route management system</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn btn-primary" onClick={() => openModal('route')}>
            <Plus size={16} />
            Add Route
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
          className={selectedTab === 'routes' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('routes')}
        >
          Routes
        </button>
        <button 
          className={selectedTab === 'vehicles' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('vehicles')}
        >
          Vehicles
        </button>
        <button 
          className={selectedTab === 'subscriptions' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('subscriptions')}
        >
          Subscriptions
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Route Utilization</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={routeUsageData}>
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
                    <Bar dataKey="subscriptions" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" fill="#4ecdc4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Vehicle Type Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {vehicleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {vehicleTypeData.map((entry, index) => (
                    <div key={entry.name} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                      <span>{entry.name}: {entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'routes' && (
        <div className="tab-content">
          <div className="routes-table glass">
            <table>
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Start Point</th>
                  <th>End Point</th>
                  <th>Distance (km)</th>
                  <th>Fare (₹)</th>
                  <th>Subscriptions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(route => (
                  <tr key={route.id}>
                    <td>{route.name}</td>
                    <td>{route.startPoint}</td>
                    <td>{route.endPoint}</td>
                    <td>{route.distance}</td>
                    <td>₹{route.fare}</td>
                    <td>{route.activeSubscriptions}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(route.status)}20`,
                          color: getStatusColor(route.status),
                          border: `1px solid ${getStatusColor(route.status)}`
                        }}
                      >
                        {getStatusIcon(route.status)}
                        {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Edit" onClick={() => openModal('route', route)}>
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

      {selectedTab === 'vehicles' && (
        <div className="tab-content">
          <div className="vehicles-table glass">
            <table>
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.vehicleNumber}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.capacity}</td>
                    <td>{routes.find(r => r.id === vehicle.routeId)?.name || 'N/A'}</td>
                    <td>{vehicle.driverName}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(vehicle.status)}20`,
                          color: getStatusColor(vehicle.status)
                        }}
                      >
                        {getStatusIcon(vehicle.status)}
                        {vehicle.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
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

      {selectedTab === 'subscriptions' && (
        <div className="tab-content">
          <div className="subscriptions-table glass">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Route</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(subscription => (
                  <tr key={subscription.id}>
                    <td>{subscription.studentName}</td>
                    <td>{subscription.studentId}</td>
                    <td>{subscription.routeName}</td>
                    <td>{subscription.subscriptionType}</td>
                    <td>{subscription.startDate}</td>
                    <td>{subscription.endDate}</td>
                    <td>₹{subscription.fare}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(subscription.status)}20`,
                          color: getStatusColor(subscription.status)
                        }}
                      >
                        {getStatusIcon(subscription.status)}
                        {subscription.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Route Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Route' : 'Add New Route'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Route Name</label>
                <input
                  type="text"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({...routeForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Point</label>
                  <input
                    type="text"
                    value={routeForm.startPoint}
                    onChange={(e) => setRouteForm({...routeForm, startPoint: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Point</label>
                  <input
                    type="text"
                    value={routeForm.endPoint}
                    onChange={(e) => setRouteForm({...routeForm, endPoint: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Distance (km)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={routeForm.distance}
                    onChange={(e) => setRouteForm({...routeForm, distance: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Fare (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={routeForm.fare}
                    onChange={(e) => setRouteForm({...routeForm, fare: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update Route' : 'Add Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;