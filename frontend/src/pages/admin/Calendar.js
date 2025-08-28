import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Clock, MapPin, Users } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'academic',
    attendees: []
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCalendarEvents();
      const payload = response?.data;
      const normalized = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.events)
          ? payload.events
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      setEvents(normalized);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Set dummy data for demo
      setEvents([
        {
          id: '1',
          title: 'Semester Registration',
          description: 'Fall 2024 course registration opens',
          date: '2024-08-30',
          time: '09:00',
          location: 'Online Portal',
          type: 'academic',
          attendees: ['All Students']
        },
        {
          id: '2',
          title: 'Faculty Meeting',
          description: 'Monthly faculty coordination meeting',
          date: '2024-08-28',
          time: '14:00',
          location: 'Conference Room A',
          type: 'meeting',
          attendees: ['Faculty']
        },
        {
          id: '3',
          title: 'Orientation Day',
          description: 'New student orientation program',
          date: '2024-09-02',
          time: '10:00',
          location: 'Main Auditorium',
          type: 'event',
          attendees: ['New Students', 'Faculty']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await adminAPI.updateCalendarEvent(editingEvent.id, eventForm);
        setEvents(events.map(event => 
          event.id === editingEvent.id ? { ...event, ...eventForm } : event
        ));
      } else {
        const response = await adminAPI.createCalendarEvent(eventForm);
        setEvents([...events, { ...eventForm, id: response.data.id || Date.now().toString() }]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      // For demo, still update the UI
      if (editingEvent) {
        setEvents(events.map(event => 
          event.id === editingEvent.id ? { ...event, ...eventForm } : event
        ));
      } else {
        setEvents([...events, { ...eventForm, id: Date.now().toString() }]);
      }
      resetForm();
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await adminAPI.deleteCalendarEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
        // For demo, still update the UI
        setEvents(events.filter(event => event.id !== eventId));
      }
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'academic',
      attendees: []
    });
    setEditingEvent(null);
    setShowModal(false);
  };

  const openEditModal = (event) => {
    setEventForm(event);
    setEditingEvent(event);
    setShowModal(true);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      academic: '#00d4ff',
      meeting: '#4ecdc4',
      event: '#feca57',
      exam: '#ff6b6b',
      holiday: '#96ceb4'
    };
    return colors[type] || '#00d4ff';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1><CalendarIcon size={24} /> Academic Calendar</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </div>

      <div className="calendar-container">
        {/* Calendar Grid */}
        <div className="calendar-grid glass">
          <div className="calendar-header">
            <h2>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          </div>
          
          {/* Simplified calendar view - showing upcoming events */}
          <div className="events-list">
            {(!Array.isArray(events) || events.length === 0) ? (
              <div className="no-events">
                <CalendarIcon size={48} />
                <p>No events scheduled</p>
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="event-card glass">
                  <div className="event-header">
                    <div 
                      className="event-type-indicator"
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                    ></div>
                    <div className="event-info">
                      <h3>{event.title}</h3>
                      <p className="event-description">{event.description}</p>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="btn-icon"
                        onClick={() => openEditModal(event)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <CalendarIcon size={16} />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={16} />
                      <span>{Array.isArray(event.attendees) ? event.attendees.join(', ') : event.attendees}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Event Types Legend */}
        <div className="event-legend glass">
          <h3>Event Types</h3>
          <div className="legend-items">
            {[
              { type: 'academic', label: 'Academic' },
              { type: 'meeting', label: 'Meeting' },
              { type: 'event', label: 'Event' },
              { type: 'exam', label: 'Exam' },
              { type: 'holiday', label: 'Holiday' }
            ].map(item => (
              <div key={item.type} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: getEventTypeColor(item.type) }}
                ></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  placeholder="e.g., Room 101, Online, Main Hall"
                />
              </div>
              
              <div className="form-group">
                <label>Event Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                >
                  <option value="academic">Academic</option>
                  <option value="meeting">Meeting</option>
                  <option value="event">Event</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
