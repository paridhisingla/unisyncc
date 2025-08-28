import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Library as LibraryIcon, BookOpen, Users, Search, Plus, Edit, Trash2, Eye, Calendar, AlertTriangle, CheckCircle, Clock, Download, Filter } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [libraryStats, setLibraryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: '',
    edition: '',
    language: 'English',
    totalCopies: 1,
    availableCopies: 1,
    location: '',
    description: '',
    price: 0
  });

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      // const [booksRes, issuesRes, statsRes] = await Promise.all([
      //   adminAPI.getBooks(),
      //   adminAPI.getIssueHistory(),
      //   adminAPI.getLibraryStats()
      // ]);

      // Demo data
      setLibraryStats({
        totalBooks: 15420,
        availableBooks: 12850,
        issuedBooks: 2570,
        overdueBooks: 185,
        totalMembers: 1247,
        activeMembers: 892,
        monthlyIssues: 1450,
        returnRate: 94.2
      });

      setBooks([
        { id: 1, title: 'Data Structures and Algorithms', author: 'Thomas Cormen', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 15, availableCopies: 8, location: 'CS-A-101', status: 'active' },
        { id: 2, title: 'Introduction to Calculus', author: 'James Stewart', isbn: '978-1285741550', category: 'Mathematics', totalCopies: 20, availableCopies: 12, location: 'MATH-B-205', status: 'active' },
        { id: 3, title: 'Physics Principles', author: 'David Halliday', isbn: '978-1118230718', category: 'Physics', totalCopies: 12, availableCopies: 5, location: 'PHY-C-150', status: 'active' },
        { id: 4, title: 'Organic Chemistry', author: 'Paula Bruice', isbn: '978-0321803221', category: 'Chemistry', totalCopies: 18, availableCopies: 0, location: 'CHEM-D-75', status: 'active' }
      ]);

      setIssues([
        { id: 1, bookTitle: 'Data Structures and Algorithms', studentName: 'John Doe', studentId: 'STU001', issueDate: '2024-08-15', dueDate: '2024-08-29', status: 'issued', fine: 0 },
        { id: 2, bookTitle: 'Introduction to Calculus', studentName: 'Jane Smith', studentId: 'STU002', issueDate: '2024-08-10', dueDate: '2024-08-24', returnDate: '2024-08-22', status: 'returned', fine: 0 },
        { id: 3, bookTitle: 'Physics Principles', studentName: 'Mike Johnson', studentId: 'STU003', issueDate: '2024-08-05', dueDate: '2024-08-19', status: 'overdue', fine: 20 },
        { id: 4, bookTitle: 'Organic Chemistry', studentName: 'Sarah Wilson', studentId: 'STU004', issueDate: '2024-08-12', dueDate: '2024-08-26', status: 'issued', fine: 0 }
      ]);
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Books',
      value: libraryStats.totalBooks?.toLocaleString() || '15,420',
      icon: BookOpen,
      color: '#00d4ff'
    },
    {
      title: 'Available Books',
      value: libraryStats.availableBooks?.toLocaleString() || '12,850',
      icon: CheckCircle,
      color: '#4ecdc4'
    },
    {
      title: 'Issued Books',
      value: libraryStats.issuedBooks?.toLocaleString() || '2,570',
      icon: Users,
      color: '#feca57'
    },
    {
      title: 'Overdue Books',
      value: libraryStats.overdueBooks?.toLocaleString() || '185',
      icon: AlertTriangle,
      color: '#ff6b6b'
    }
  ];

  const categoryData = [
    { name: 'Computer Science', books: 3500, color: '#00d4ff' },
    { name: 'Mathematics', books: 2800, color: '#4ecdc4' },
    { name: 'Physics', books: 2200, color: '#feca57' },
    { name: 'Chemistry', books: 1900, color: '#ff6b6b' },
    { name: 'Biology', books: 1600, color: '#96ceb4' },
    { name: 'Literature', books: 3420, color: '#ff9f43' }
  ];

  const issueStatusData = [
    { name: 'Issued', value: 2570, color: '#feca57' },
    { name: 'Returned', value: 12450, color: '#4ecdc4' },
    { name: 'Overdue', value: 185, color: '#ff6b6b' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await adminAPI.updateBook(editingBook.id, bookForm);
        setBooks(books.map(book => 
          book.id === editingBook.id ? { ...book, ...bookForm } : book
        ));
      } else {
        const response = await adminAPI.createBook(bookForm);
        setBooks([...books, { ...bookForm, id: response.data.id || Date.now() }]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving book:', error);
      // For demo, still update the UI
      if (editingBook) {
        setBooks(books.map(book => 
          book.id === editingBook.id ? { ...book, ...bookForm } : book
        ));
      } else {
        setBooks([...books, { ...bookForm, id: Date.now() }]);
      }
      resetForm();
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await adminAPI.deleteBook(bookId);
        setBooks(books.filter(book => book.id !== bookId));
      } catch (error) {
        console.error('Error deleting book:', error);
        setBooks(books.filter(book => book.id !== bookId));
      }
    }
  };

  const resetForm = () => {
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publishedYear: '',
      edition: '',
      language: 'English',
      totalCopies: 1,
      availableCopies: 1,
      location: '',
      description: '',
      price: 0
    });
    setEditingBook(null);
    setShowModal(false);
  };

  const openEditModal = (book) => {
    setBookForm(book);
    setEditingBook(book);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued': return '#feca57';
      case 'returned': return '#4ecdc4';
      case 'overdue': return '#ff6b6b';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'issued': return <Clock size={16} />;
      case 'returned': return <CheckCircle size={16} />;
      case 'overdue': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading library data...</p>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="page-header">
        <div className="header-content">
          <h1><LibraryIcon size={24} /> Library Management</h1>
          <p>Comprehensive library system for book and member management</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Book
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
          className={selectedTab === 'books' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('books')}
        >
          Books
        </button>
        <button 
          className={selectedTab === 'issues' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('issues')}
        >
          Issues & Returns
        </button>
        <button 
          className={selectedTab === 'members' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setSelectedTab('members')}
        >
          Members
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Books by Category</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
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
                    <Bar dataKey="books" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container glass">
                <div className="chart-header">
                  <h3>Issue Status Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={issueStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {issueStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {issueStatusData.map((entry, index) => (
                    <div key={entry.name} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'books' && (
        <div className="tab-content">
          <div className="table-controls">
            <div className="search-filter-section">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Literature">Literature</option>
              </select>
            </div>
          </div>

          <div className="books-table glass">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Total Copies</th>
                  <th>Available</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td>{book.totalCopies}</td>
                    <td>{book.availableCopies}</td>
                    <td>{book.location}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: book.availableCopies > 0 ? '#4ecdc420' : '#ff6b6b20',
                          color: book.availableCopies > 0 ? '#4ecdc4' : '#ff6b6b',
                          border: `1px solid ${book.availableCopies > 0 ? '#4ecdc4' : '#ff6b6b'}`
                        }}
                      >
                        {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => openEditModal(book)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon btn-danger" title="Delete" onClick={() => handleDelete(book.id)}>
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

      {selectedTab === 'issues' && (
        <div className="tab-content">
          <div className="issues-table glass">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr key={issue.id}>
                    <td>{issue.bookTitle}</td>
                    <td>{issue.studentName}</td>
                    <td>{issue.studentId}</td>
                    <td>{issue.issueDate}</td>
                    <td>{issue.dueDate}</td>
                    <td>{issue.returnDate || '-'}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${getStatusColor(issue.status)}20`,
                          color: getStatusColor(issue.status),
                          border: `1px solid ${getStatusColor(issue.status)}`
                        }}
                      >
                        {getStatusIcon(issue.status)}
                        {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </span>
                    </td>
                    <td>₹{issue.fine}</td>
                    <td>
                      <div className="action-buttons">
                        {issue.status === 'issued' && (
                          <button className="btn-sm btn-primary">Return</button>
                        )}
                        {issue.status === 'overdue' && (
                          <button className="btn-sm btn-warning">Collect Fine</button>
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

      {/* Add/Edit Book Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({...bookForm, totalCopies: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    value={bookForm.availableCopies}
                    onChange={(e) => setBookForm({...bookForm, availableCopies: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={bookForm.location}
                  onChange={(e) => setBookForm({...bookForm, location: e.target.value})}
                  placeholder="e.g., CS-A-101"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
