import React, { useState } from 'react';
import Table from '../../components/Table';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  User, 
  Upload, 
  Download, 
  Filter,
  BookOpen,
  Calendar,
  Clock,
  X,
  UserPlus
} from 'lucide-react';
import { 
  courses as initialCourses, 
  students, 
  teachers, 
  departments 
} from '../../data/dummyData';

const AdminCourses = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [assigningCourse, setAssigningCourse] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    credits: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    credits: '',
    department: '',
    duration: '',
    schedule: '',
    maxStudents: '',
    assignedTeacher: null,
    enrolledStudents: [],
    status: 'active'
  });
  const [assignData, setAssignData] = useState({
    selectedStudents: [],
    selectedTeacher: null
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filters.department || course.department === filters.department;
    const matchesCredits = !filters.credits || course.credits === parseInt(filters.credits);
    const matchesStatus = !filters.status || course.status === filters.status;
    
    return matchesSearch && matchesDepartment && matchesCredits && matchesStatus;
  });

  const handleAdd = () => {
    setEditingCourse(null);
    setFormData({ 
      id: '', 
      name: '', 
      description: '', 
      credits: '', 
      department: '',
      duration: '',
      schedule: '',
      maxStudents: '',
      assignedTeacher: null,
      enrolledStudents: [],
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      id: course.id,
      name: course.name,
      description: course.description,
      credits: course.credits || '',
      department: course.department || '',
      duration: course.duration || '',
      schedule: course.schedule || '',
      maxStudents: course.maxStudents || '',
      assignedTeacher: course.assignedTeacher || null,
      enrolledStudents: course.enrolledStudents || [],
      status: course.status || 'active'
    });
    setShowModal(true);
  };

  const handleAssign = (course) => {
    setAssigningCourse(course);
    setAssignData({
      selectedStudents: course.enrolledStudents || [],
      selectedTeacher: course.assignedTeacher || null
    });
    setShowAssignModal(true);
  };

  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== courseId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? { 
              ...c, 
              ...formData, 
              credits: parseInt(formData.credits),
              maxStudents: parseInt(formData.maxStudents)
            }
          : c
      ));
    } else {
      const newCourse = {
        ...formData,
        credits: parseInt(formData.credits),
        maxStudents: parseInt(formData.maxStudents),
        students: 0
      };
      setCourses([...courses, newCourse]);
    }
    setShowModal(false);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    setCourses(courses.map(c => 
      c.id === assigningCourse.id 
        ? { 
            ...c, 
            assignedTeacher: assignData.selectedTeacher,
            enrolledStudents: assignData.selectedStudents,
            students: assignData.selectedStudents.length
          }
        : c
    ));
    setShowAssignModal(false);
  };

  const handleBulkImport = () => {
    alert('Bulk import functionality would open file picker for CSV/Excel files');
  };

  const handleBulkExport = () => {
    const csvContent = [
      ['Course ID', 'Name', 'Department', 'Credits', 'Students', 'Teacher', 'Status'],
      ...filteredCourses.map(c => [
        c.id, 
        c.name, 
        c.department, 
        c.credits, 
        c.students, 
        c.assignedTeacher?.name || 'Unassigned',
        c.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({ department: '', credits: '', status: '' });
  };

  const addStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student && !assignData.selectedStudents.find(s => s.id === studentId)) {
      setAssignData({
        ...assignData,
        selectedStudents: [...assignData.selectedStudents, student]
      });
    }
  };

  const removeStudent = (studentId) => {
    setAssignData({
      ...assignData,
      selectedStudents: assignData.selectedStudents.filter(s => s.id !== studentId)
    });
  };

  const assignTeacher = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setAssignData({
      ...assignData,
      selectedTeacher: teacher
    });
  };

  const columns = [
    { key: 'id', header: 'Course ID' },
    { key: 'name', header: 'Course Name' },
    { key: 'department', header: 'Department' },
    { key: 'credits', header: 'Credits' },
    { 
      key: 'students', 
      header: 'Enrolled',
      render: (course) => `${course.students || 0}/${course.maxStudents || 'N/A'}`
    },
    { 
      key: 'teacher', 
      header: 'Teacher',
      render: (course) => course.assignedTeacher?.name || 'Unassigned'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (course) => (
        <span className={`status-toggle ${course.status || 'active'}`}>
          {course.status || 'active'}
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
      label: 'Assign',
      icon: UserPlus,
      onClick: handleAssign,
      className: 'info'
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
        <h1>Manage Courses</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={20} />
          Add Course
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
                placeholder="Search courses..."
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
              <label>Credits:</label>
              <select 
                className="filter-select"
                value={filters.credits}
                onChange={(e) => setFilters({...filters, credits: e.target.value})}
              >
                <option value="">All Credits</option>
                <option value="1">1 Credit</option>
                <option value="2">2 Credits</option>
                <option value="3">3 Credits</option>
                <option value="4">4 Credits</option>
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

            {(filters.department || filters.credits || filters.status) && (
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
          <p>Showing {filteredCourses.length} of {courses.length} courses</p>
        </div>

        <Table
          columns={columns}
          data={filteredCourses}
          actions={actions}
        />
      </div>

      {/* Course Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
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
                  <label>
                    <BookOpen size={16} />
                    Course ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    required
                    disabled={editingCourse}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  required
                  placeholder="Course description and objectives"
                />
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 1 Semester, 16 weeks"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    placeholder="e.g., Mon/Wed/Fri 10:00-11:00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Users size={16} />
                    Max Students
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                    placeholder="Maximum enrollment capacity"
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
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Update' : 'Add'} Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Students & Teacher - {assigningCourse?.name}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-form" onSubmit={handleAssignSubmit}>
              {/* Teacher Assignment */}
              <div className="course-assignment">
                <h4>
                  <User size={16} />
                  Assign Teacher
                </h4>
                <div className="form-group">
                  <label>Select Teacher</label>
                  <select
                    value={assignData.selectedTeacher?.id || ''}
                    onChange={(e) => assignTeacher(e.target.value)}
                  >
                    <option value="">Select a teacher</option>
                    {teachers.filter(t => t.status === 'active').map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
                      </option>
                    ))}
                  </select>
                </div>
                
                {assignData.selectedTeacher && (
                  <div className="course-chips">
                    <div className="course-chip">
                      {assignData.selectedTeacher.name} - {assignData.selectedTeacher.subject}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => setAssignData({...assignData, selectedTeacher: null})}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Assignment */}
              <div className="course-assignment">
                <h4>
                  <Users size={16} />
                  Assign Students
                </h4>
                <div className="form-group">
                  <label>Add Student</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addStudent(parseInt(e.target.value));
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select a student to enroll</option>
                    {students.filter(student => 
                      student.status === 'active' && 
                      !assignData.selectedStudents.find(s => s.id === student.id)
                    ).map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.department}
                      </option>
                    ))}
                  </select>
                </div>
                
                {assignData.selectedStudents.length > 0 && (
                  <div className="course-chips">
                    {assignData.selectedStudents.map(student => (
                      <div key={student.id} className="course-chip">
                        {student.name} - {student.department}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeStudent(student.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="enrollment-info">
                  Enrolled: {assignData.selectedStudents.length} / {assigningCourse?.maxStudents || 'No limit'}
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
