import React, { useState } from 'react';
import { Bell, Calendar, AlertCircle, Info } from 'lucide-react';
import { notices } from '../../data/dummyData';

const StudentNotices = () => {
  const [filter, setFilter] = useState('all');

  const getNoticeIcon = (type) => {
    switch (type) {
      case 'exam': return AlertCircle;
      case 'important': return AlertCircle;
      case 'event': return Calendar;
      default: return Info;
    }
  };

  const getNoticeClass = (type) => {
    switch (type) {
      case 'exam': return 'notice-exam';
      case 'important': return 'notice-important';
      case 'event': return 'notice-event';
      default: return 'notice-general';
    }
  };

  const filteredNotices = filter === 'all' 
    ? notices 
    : notices.filter(notice => notice.type === filter);

  return (
    <div className="notices-page">
      <div className="page-header">
        <h1>Notices & Announcements</h1>
        <p>Stay updated with the latest campus news and announcements</p>
      </div>

      <div className="notices-filter glass">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Notices
        </button>
        <button 
          className={`filter-btn ${filter === 'exam' ? 'active' : ''}`}
          onClick={() => setFilter('exam')}
        >
          Exams
        </button>
        <button 
          className={`filter-btn ${filter === 'important' ? 'active' : ''}`}
          onClick={() => setFilter('important')}
        >
          Important
        </button>
        <button 
          className={`filter-btn ${filter === 'event' ? 'active' : ''}`}
          onClick={() => setFilter('event')}
        >
          Events
        </button>
        <button 
          className={`filter-btn ${filter === 'general' ? 'active' : ''}`}
          onClick={() => setFilter('general')}
        >
          General
        </button>
      </div>

      <div className="notices-list">
        {filteredNotices.map(notice => {
          const IconComponent = getNoticeIcon(notice.type);
          return (
            <div key={notice.id} className={`notice-card glass ${getNoticeClass(notice.type)}`}>
              <div className="notice-header">
                <div className="notice-icon">
                  <IconComponent size={20} />
                </div>
                <div className="notice-meta">
                  <h3 className="notice-title">{notice.title}</h3>
                  <span className="notice-date">{notice.date}</span>
                </div>
                <span className={`notice-badge ${notice.type}`}>
                  {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                </span>
              </div>
              <div className="notice-content">
                <p>{notice.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotices.length === 0 && (
        <div className="empty-state glass">
          <Bell size={48} />
          <h3>No notices found</h3>
          <p>There are no notices matching your current filter.</p>
        </div>
      )}
    </div>
  );
};

export default StudentNotices;
