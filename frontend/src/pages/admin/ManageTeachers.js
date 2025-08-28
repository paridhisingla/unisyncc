import React, { useState } from 'react';
import Table from '../../components/Table';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Upload, 
  Download, 
  Filter,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Users,
  X
} from 'lucide-react';
import { teachers as initialTeachers, departments, courses } from '../../data/dummyData';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    experience: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    subject: '',
    experience: '',
    qualification: '',
    assignedCourses: [],
    address: '',
    status: 'active'
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filters.department || teacher.department === filters.department;
    const matchesStatus = !filters.status || teacher.status === filters.status;
    const matchesExperience = !filters.experience || 
      (filters.experience === 'junior' && teacher.experience < 5) ||
      (filters.experience === 'senior' && teacher.experience >= 5);
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesExperience;
  });

  const handleAdd = () => {
    setEditingTeacher(null);
    setFormData({ 
      name: '', 
      email: '', 
      phone: '',
      department: '',
      subject: '', 
      experience: '',
      qualification: '',
      assignedCourses: [],
      address: '',
      status: 'active' 
    });
    setShowModal(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      department: teacher.department,
      subject: teacher.subject,
      experience: teacher.experience || '',
      qualification: teacher.qualification || '',
      assignedCourses: teacher.assignedCourses || [],
      address: teacher.address || '',
      status: teacher.status
    });
    setShowModal(true);
  };

  const handleDelete = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(t => t.id !== teacherId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      setTeachers(teachers.map(t => 
        t.id === editingTeacher.id 
          ? { ...t, ...formData, experience: parseInt(formData.experience) }
          : t
      ));
    } else {
      const newTeacher = {
        id: Date.now(),
        ...formData,
        experience: parseInt(formData.experience),
        joinDate: new Date().toISOString().split('T')[0]
      };
      setTeachers([...teachers, newTeacher]);
    }
    setShowModal(false);
  };

  const toggleStatus = (teacherId) => {
    setTeachers(teachers.map(t => 
      t.id === teacherId 
        ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' }
        : t
    ));
  };

  const handleBulkImport = () => {
    alert('Bulk import functionality would open file picker for CSV/Excel files');
  };

  const handleBulkExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Department', 'Subject', 'Experience', 'Status'],
      ...filteredTeachers.map(t => [t.name, t.email, t.phone, t.department, t.subject, t.experience, t.status])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({ department: '', status: '', experience: '' });
  };

  const addCourse = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (course && !formData.assignedCourses.find(c => c.id === courseId)) {
      setFormData({
        ...formData,
        assignedCourses: [...formData.assignedCourses, course]
      });
    }
  };

  const removeCourse = (courseId) => {
    setFormData({
      ...formData,
      assignedCourses: formData.assignedCourses.filter(c => c.id !== courseId)
    });
  };

  const getPerformanceStats = (teacher) => {
    // Mock performance data
    return {
      avgRating: (4.2 + Math.random() * 0.6).toFixed(1),
      studentsCount: Math.floor(Math.random() * 100) + 50,
      coursesCount: teacher.assignedCourses?.length || Math.floor(Math.random() * 5) + 1,
      attendanceRate: Math.floor(Math.random() * 20) + 80
    };
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department' },
    { key: 'subject', header: 'Subject' },
    { 
      key: 'experience', 
      header: 'Experience',
      render: (teacher) => `${teacher.experience || 0} years`
    },
    { 
      key: 'performance', 
      header: 'Performance',
      render: (teacher) => {
        const stats = getPerformanceStats(teacher);
        return (
          <div className="performance-mini">
            <span className="rating">★ {stats.avgRating}</span>
            <span className="students">{stats.studentsCount} students</span>
          </div>
        );
      }
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (teacher) => (
        <span 
          className={`status-toggle ${teacher.status}`}
          onClick={() => toggleStatus(teacher.id)}
        >
          {teacher.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
          {teacher.status}
        </span>
      )
    }
  ];

  const actions = [
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
        <h1>Manage Teachers</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={20} />
          Add Teacher
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
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Department:</label>
              <select 
                className="filter-select"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
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
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Experience:</label>
              <select 
                className="filter-select"
                value={filters.experience}
                onChange={(e) => setFilters({...filters, experience: e.target.value})}
              >
                <option value="">All Levels</option>
                <option value="junior">Junior (&lt;5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>

            {(filters.department || filters.status || filters.experience) && (
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
          <p>Showing {filteredTeachers.length} of {teachers.length} teachers</p>
        </div>

        <Table
          columns={columns}
          data={filteredTeachers}
          actions={actions}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject Specialization</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Award size={16} />
                  Qualification
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="e.g., PhD in Computer Science, M.Tech"
                />
              </div>

              {/* Course Assignment Section */}
              <div className="course-assignment">
                <h4>
                  <BookOpen size={16} />
                  Course Assignment
                </h4>
                <div className="form-group">
                  <label>Add Course</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addCourse(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select a course to assign</option>
                    {courses.filter(course => 
                      !formData.assignedCourses.find(ac => ac.id === course.id)
                    ).map(course => (
                      <option key={course.id} value={course.id}>
                        {course.id} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.assignedCourses.length > 0 && (
                  <div className="course-chips">
                    {formData.assignedCourses.map(course => (
                      <div key={course.id} className="course-chip">
                        {course.id} - {course.name}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeCourse(course.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={16} />
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Performance Stats Preview for Editing */}
              {editingTeacher && (
                <div className="performance-stats">
                  <div className="performance-stat">
                    <div className="stat-value">★ {getPerformanceStats(editingTeacher).avgRating}</div>
                    <div className="stat-label">Avg Rating</div>
                  </div>
                  <div className="performance-stat">
                    <div className="stat-value">{getPerformanceStats(editingTeacher).studentsCount}</div>
                    <div className="stat-label">Students</div>
                  </div>
                  <div className="performance-stat">
                    <div className="stat-value">{getPerformanceStats(editingTeacher).coursesCount}</div>
                    <div className="stat-label">Courses</div>
                  </div>
                  <div className="performance-stat">
                    <div className="stat-value">{getPerformanceStats(editingTeacher).attendanceRate}%</div>
                    <div className="stat-label">Attendance</div>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTeacher ? 'Update' : 'Add'} Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
