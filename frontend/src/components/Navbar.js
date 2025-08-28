import React, { useState } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

const Navbar = ({ userRole, userName, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, message: 'New assignment posted', time: '2 min ago' },
    { id: 2, message: 'Grade updated for Math 101', time: '1 hour ago' },
    { id: 3, message: 'Library book due tomorrow', time: '3 hours ago' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown glass">
              <div className="notification-header">
                <h4>Notifications</h4>
              </div>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <p>{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            <User size={20} />
            <span className="profile-name">{userName}</span>
          </button>
          
          {showProfile && (
            <div className="profile-dropdown glass">
              <div className="profile-info">
                <p className="profile-name-full">{userName}</p>
                <p className="profile-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
