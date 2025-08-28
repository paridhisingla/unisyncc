import React, { useState } from 'react';
import Table from '../../components/Table';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  Pin, 
  Upload, 
  Download, 
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  Eye
} from 'lucide-react';
import { notices as initialNotices } from '../../data/dummyData';

const AdminNotices = () => {
  const [notices, setNotices] = useState(initialNotices);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    pinned: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    pinned: false,
    expiryDate: '',
    scheduledDate: '',
    targetAudience: 'all',
    status: 'active'
  });

  const categories = [
    { value: 'general', label: 'General', color: '#6b7280' },
    { value: 'academic', label: 'Academic', color: '#3b82f6' },
    { value: 'event', label: 'Event', color: '#10b981' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' },
    { value: 'maintenance', label: 'Maintenance', color: '#f59e0b' },
    { value: 'holiday', label: 'Holiday', color: '#8b5cf6' }
  ];

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || notice.category === filters.category;
    const matchesPriority = !filters.priority || notice.priority === filters.priority;
    const matchesStatus = !filters.status || notice.status === filters.status;
    const matchesPinned = !filters.pinned || 
      (filters.pinned === 'pinned' && notice.pinned) ||
      (filters.pinned === 'unpinned' && !notice.pinned);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesPinned;
  });

  // Sort notices: pinned first, then by date
  const sortedNotices = filteredNotices.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const handleAdd = () => {
    setEditingNotice(null);
    setFormData({ 
      title: '', 
      content: '', 
      category: 'general', 
      priority: 'medium', 
      pinned: false, 
      expiryDate: '',
      scheduledDate: '',
      targetAudience: 'all',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category || 'general',
      priority: notice.priority || 'medium',
      pinned: notice.pinned || false,
      expiryDate: notice.expiryDate || '',
      scheduledDate: notice.scheduledDate || '',
      targetAudience: notice.targetAudience || 'all',
      status: notice.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      setNotices(notices.filter(n => n.id !== noticeId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNotice) {
      setNotices(notices.map(n => 
        n.id === editingNotice.id 
          ? { ...n, ...formData }
          : n
      ));
    } else {
      const newNotice = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString().split('T')[0],
        views: 0
      };
      setNotices([...notices, newNotice]);
    }
    setShowModal(false);
  };

  const togglePin = (noticeId) => {
    setNotices(notices.map(n => 
      n.id === noticeId 
        ? { ...n, pinned: !n.pinned }
        : n
    ));
  };

  const handleBulkImport = () => {
    alert('Bulk import functionality would open file picker for CSV/Excel files');
  };

  const handleBulkExport = () => {
    const csvContent = [
      ['Title', 'Category', 'Priority', 'Status', 'Date', 'Expiry', 'Pinned'],
      ...filteredNotices.map(n => [
        n.title, 
        n.category, 
        n.priority, 
        n.status, 
        n.date, 
        n.expiryDate || 'No expiry',
        n.pinned ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({ category: '', priority: '', status: '', pinned: '' });
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : '#6b7280';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={14} className="text-red-500" />;
      case 'medium': return <Bell size={14} className="text-yellow-500" />;
      case 'low': return <Bell size={14} className="text-green-500" />;
      default: return <Bell size={14} />;
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const columns = [
    { 
      key: 'title', 
      header: 'Title',
      render: (notice) => (
        <div className="notice-title">
          {notice.pinned && <Pin size={14} className="pinned-icon" />}
          <span className={isExpired(notice.expiryDate) ? 'expired-notice' : ''}>
            {notice.title}
          </span>
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Category',
      render: (notice) => (
        <span 
          className="category-badge"
          style={{ 
            backgroundColor: `${getCategoryColor(notice.category)}20`,
            color: getCategoryColor(notice.category),
            border: `1px solid ${getCategoryColor(notice.category)}40`
          }}
        >
          {notice.category}
        </span>
      )
    },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (notice) => (
        <div className="priority-display">
          {getPriorityIcon(notice.priority)}
          <span className={`priority-${notice.priority}`}>{notice.priority}</span>
        </div>
      )
    },
    { 
      key: 'targetAudience', 
      header: 'Audience',
      render: (notice) => (
        <span className="audience-badge">
          <Users size={12} />
          {notice.targetAudience || 'all'}
        </span>
      )
    },
    { key: 'date', header: 'Created' },
    { 
      key: 'expiryDate', 
      header: 'Expires',
      render: (notice) => {
        if (!notice.expiryDate) return 'No expiry';
        const expired = isExpired(notice.expiryDate);
        return (
          <span className={expired ? 'expired-date' : 'expiry-date'}>
            {notice.expiryDate}
            {expired && ' (Expired)'}
          </span>
        );
      }
    },
    { 
      key: 'views', 
      header: 'Views',
      render: (notice) => (
        <span className="views-count">
          <Eye size={12} />
          {notice.views || 0}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Pin/Unpin',
      icon: Pin,
      onClick: togglePin,
      className: 'info'
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: handleEdit,
      className: 'edit'
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: handleDelete,
      className: 'delete'
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Notices</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={20} />
          Add Notice
        </button>
      </div>

      <div className="page-content">
        {/* Enhanced Controls */}
        <div className="page-controls glass">
          <div className="controls-left">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select 
                className="filter-select"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Priority:</label>
              <select 
                className="filter-select"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select 
                className="filter-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Pinned:</label>
              <select 
                className="filter-select"
                value={filters.pinned}
                onChange={(e) => setFilters({...filters, pinned: e.target.value})}
              >
                <option value="">All</option>
                <option value="pinned">Pinned Only</option>
                <option value="unpinned">Unpinned Only</option>
              </select>
            </div>

            {(filters.category || filters.priority || filters.status || filters.pinned) && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                <Filter size={16} />
                Clear Filters
              </button>
            )}
          </div>

          <div className="controls-right">
            <div className="bulk-actions">
              <button className="bulk-btn import" onClick={handleBulkImport}>
                <Upload size={16} />
                Import
              </button>
              <button className="bulk-btn export" onClick={handleBulkExport}>
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="results-info">
          <p>Showing {sortedNotices.length} of {notices.length} notices</p>
        </div>

        <Table
          columns={columns}
          data={sortedNotices}
          actions={actions}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingNotice ? 'Edit Notice' : 'Add Notice'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <Bell size={16} />
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter notice title"
                />
              </div>
              
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="4"
                  required
                  placeholder="Enter notice content and details"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Scheduled Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({...formData, pinned: e.target.checked})}
                  />
                  <Pin size={16} />
                  Pin this notice to the top
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNotice ? 'Update' : 'Add'} Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;
