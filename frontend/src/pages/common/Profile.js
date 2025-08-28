import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';

const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.username + '@campus.edu',
    phone: '+1 (555) 123-4567',
    address: '123 Campus Street, University City',
    joinDate: '2023-09-01'
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name,
      email: user.username + '@campus.edu',
      phone: '+1 (555) 123-4567',
      address: '123 Campus Street, University City',
      joinDate: '2023-09-01'
    });
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-container">
        <div className="profile-card glass">
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={48} />
            </div>
            <div className="profile-info">
              <h2>{formData.name}</h2>
              <p className="profile-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-group">
              <div className="detail-item">
                <div className="detail-icon">
                  <User size={20} />
                </div>
                <div className="detail-content">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <span>{formData.name}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Mail size={20} />
                </div>
                <div className="detail-content">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <span>{formData.email}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Phone size={20} />
                </div>
                <div className="detail-content">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <span>{formData.phone}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin size={20} />
                </div>
                <div className="detail-content">
                  <label>Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  ) : (
                    <span>{formData.address}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Calendar size={20} />
                </div>
                <div className="detail-content">
                  <label>Join Date</label>
                  <span>{new Date(formData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-stats glass">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            {user.role === 'admin' && (
              <>
                <div className="stat-item">
                  <span className="stat-value">156</span>
                  <span className="stat-label">Total Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">24</span>
                  <span className="stat-label">Total Teachers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">8</span>
                  <span className="stat-label">Active Courses</span>
                </div>
              </>
            )}
            {user.role === 'teacher' && (
              <>
                <div className="stat-item">
                  <span className="stat-value">2</span>
                  <span className="stat-label">Courses Teaching</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">83</span>
                  <span className="stat-label">Total Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">89%</span>
                  <span className="stat-label">Avg Attendance</span>
                </div>
              </>
            )}
            {user.role === 'student' && (
              <>
                <div className="stat-item">
                  <span className="stat-value">5</span>
                  <span className="stat-label">Enrolled Courses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">85%</span>
                  <span className="stat-label">Attendance Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">3.7</span>
                  <span className="stat-label">GPA</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
