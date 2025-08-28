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
  Calendar
} from 'lucide-react';
import { students as initialStudents, departments } from '../../data/dummyData';

const ManageStudents = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    year: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    gpa: '',
    address: '',
    status: 'active'
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filters.department || student.department === filters.department;
    const matchesStatus = !filters.status || student.status === filters.status;
    const matchesYear = !filters.year || student.year === parseInt(filters.year);
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
  });

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({ 
      name: '', 
      email: '', 
      phone: '',
      department: '', 
      year: '',
      gpa: '',
      address: '',
      status: 'active' 
    });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      department: student.department,
      year: student.year || '',
      gpa: student.gpa || '',
      address: student.address || '',
      status: student.status
    });
    setShowModal(true);
  };

  const handleDelete = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(s => s.id !== studentId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents(students.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...formData, year: parseInt(formData.year), gpa: parseFloat(formData.gpa) }
          : s
      ));
    } else {
      const newStudent = {
        id: Date.now(),
        ...formData,
        year: parseInt(formData.year),
        gpa: parseFloat(formData.gpa),
        enrollmentDate: new Date().toISOString().split('T')[0]
      };
      setStudents([...students, newStudent]);
    }
    setShowModal(false);
  };

  const toggleStatus = (studentId) => {
    setStudents(students.map(s => 
      s.id === studentId 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
    ));
  };

  const handleBulkImport = () => {
    // Simulate bulk import
    alert('Bulk import functionality would open file picker for CSV/Excel files');
  };

  const handleBulkExport = () => {
    // Simulate bulk export
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Department', 'Year', 'GPA', 'Status'],
      ...filteredStudents.map(s => [s.name, s.email, s.phone, s.department, s.year, s.gpa, s.status])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({ department: '', status: '', year: '' });
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department' },
    { key: 'year', header: 'Year' },
    { 
      key: 'gpa', 
      header: 'GPA',
      render: (student) => student.gpa ? student.gpa.toFixed(2) : 'N/A'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (student) => (
        <span 
          className={`status-toggle ${student.status}`}
          onClick={() => toggleStatus(student.id)}
        >
          {student.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
          {student.status}
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
        <h1>Manage Students</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={20} />
          Add Student
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
                placeholder="Search students..."
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
              <label>Year:</label>
              <select 
                className="filter-select"
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {(filters.department || filters.status || filters.year) && (
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
          <p>Showing {filteredStudents.length} of {students.length} students</p>
        </div>

        <Table
          columns={columns}
          data={filteredStudents}
          actions={actions}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
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
                  <label>
                    <Calendar size={16} />
                    Academic Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                  />
                </div>
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

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Update' : 'Add'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
