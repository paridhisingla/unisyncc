import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, Calendar, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Fetch classes and initial attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesRes = await adminAPI.getCourses();
        if (classesRes && classesRes.data) {
          setClasses(classesRes.data);
          if (classesRes.data.length > 0) {
            setSelectedClass(classesRes.data[0]._id);
            await fetchAttendance(classesRes.data[0]._id);
          } else {
            setLoading(false);
            toast.info('No classes found. Please add classes first.');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load attendance data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  const fetchAttendance = async (classId) => {
    if (!classId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const res = await adminAPI.getAttendanceStats({
        classId,
        date: selectedDate.toISOString().split('T')[0]
      });
      
      if (res && res.data) {
        setAttendance(res.data);
      } else {
        setAttendance([]);
        toast.info('No attendance records found for the selected date and class.');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records. Please try again.');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      await adminAPI.markAttendance({
        studentId,
        classId: selectedClass,
        date: selectedDate.toISOString().split('T')[0],
        status
      });
      fetchAttendance(selectedClass);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    total: attendance.length,
    percentage: attendance.length > 0 
      ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) 
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-[80vh] bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-500 text-sm">Track and manage student attendance records</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button 
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            <Upload size={18} className="mr-2" />
            Bulk Upload
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow"
          >
            <Filter size={18} className="mr-2 text-blue-600" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Filter size={18} className="mr-2 text-blue-600" />
            Filter Attendance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={date => {
                    setSelectedDate(date);
                    fetchAttendance(selectedClass);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  dateFormat="dd/MM/yyyy"
                />
                <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <div className="relative">
                <select 
                  value={selectedClass}
                  onChange={e => {
                    setSelectedClass(e.target.value);
                    fetchAttendance(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => fetchAttendance(selectedClass)}
                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard 
          icon={<UserCheck className="text-green-500" size={24} />} 
          label="Present" 
          value={stats.present}
          percentage={stats.percentage}
          trend="up"
          trendValue="12%"
          bg="from-green-50 to-green-50/50"
          borderColor="border-green-100"
        />
        <StatCard 
          icon={<UserX className="text-red-500" size={24} />} 
          label="Absent" 
          value={stats.absent}
          percentage={100 - stats.percentage}
          trend="down"
          trendValue="5%"
          bg="from-red-50 to-red-50/50"
          borderColor="border-red-100"
        />
        <StatCard 
          icon={<Clock className="text-amber-500" size={24} />} 
          label="Late" 
          value={stats.late}
          percentage={stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}
          trend="up"
          trendValue="3%"
          bg="from-amber-50 to-amber-50/50"
          borderColor="border-amber-100"
        />
        <StatCard 
          icon={<Users className="text-blue-500" size={24} />} 
          label="Total Students" 
          value={stats.total}
          percentage={100}
          trend="neutral"
          bg="from-blue-50 to-blue-50/50"
          borderColor="border-blue-100"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Attendance Records</h3>
          <div className="flex space-x-2">
            <button className="flex items-center text-sm px-3 py-1 border rounded">
              <Download size={16} className="mr-1" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{record.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleStatusChange(record.studentId, 'present')}
                          className={`px-2 py-1 text-xs rounded ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => handleStatusChange(record.studentId, 'absent')}
                          className={`px-2 py-1 text-xs rounded ${
                            record.status === 'absent' 
                              ? 'bg-red-100 text-red-800' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Absent
                        </button>
                        <button 
                          onClick={() => handleStatusChange(record.studentId, 'late')}
                          className={`px-2 py-1 text-xs rounded ${
                            record.status === 'late' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found for the selected date and class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bulk Upload Attendance</h3>
              <button onClick={() => setShowBulkUpload(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop your Excel file here, or click to select
              </p>
              <input 
                type="file" 
                className="hidden" 
                id="file-upload"
                accept=".xlsx,.xls,.csv"
              />
              <label 
                htmlFor="file-upload"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Select File
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Supported formats: .xlsx, .xls, .csv
              </p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">File Format:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                student_id,status,date[optional],remarks[optional]<br />
                S001,present,2023-11-15,On time<br />
                S002,absent,2023-11-15,<br />
                S003,late,2023-11-15,Arrived 15 mins late
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowBulkUpload(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ icon, label, value, percentage, trend, trendValue, bg, borderColor }) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };
  
  const trendIcons = {
    up: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
    )
  };

  return (
    <div className={`bg-gradient-to-br ${bg} border ${borderColor} rounded-xl p-5 transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div className="p-2.5 rounded-xl bg-white/80 shadow-sm">
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${trendColors[trend]} bg-white/50`}>
            {trendIcons[trend]}
            <span className="ml-1">{trendValue}</span>
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {percentage !== undefined && (
            <span className="ml-2 text-sm font-medium text-gray-500">
              {percentage}%
            </span>
          )}
        </div>
        {percentage !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div 
              className={`h-1.5 rounded-full ${
                label === 'Present' ? 'bg-green-500' : 
                label === 'Absent' ? 'bg-red-500' : 
                label === 'Late' ? 'bg-amber-500' : 'bg-blue-500'
              }`} 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
