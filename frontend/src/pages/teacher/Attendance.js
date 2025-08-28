import React, { useEffect, useMemo, useState } from 'react';
import Table from '../../components/Table';
import { Check, X, Save } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Attendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('CS101');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lateMinutesMap, setLateMinutesMap] = useState({});
  const [filter, setFilter] = useState('all');

  const toggleAttendance = (studentId) => {
    setAttendanceList(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, present: !student.present, status: !student.present ? 'present' : 'absent' }
          : student
      )
    );
  };

  const setLate = (studentId, mins) => {
    const lateMins = Math.max(0, Number(mins) || 0);
    setLateMinutesMap(prev => ({ ...prev, [studentId]: lateMins }));
    setAttendanceList(prev => prev.map(s => s.id === studentId ? { ...s, status: lateMins > 0 ? 'late' : (s.present ? 'present' : 'absent') } : s));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const entries = attendanceList.map(s => ({
        studentId: s.id,
        status: s.status || (s.present ? 'present' : 'absent'),
        lateMins: lateMinutesMap[s.id] || 0,
      }));
      await adminAPI.markAttendance({ classId: selectedCourse, sessionId: `${selectedCourse}-${selectedDate}`, entries });
      alert('Attendance saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadRoster = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getClassRoster(selectedCourse);
        const roster = Array.isArray(res?.data) ? res.data : (res?.data?.students || []);
        setAttendanceList(roster.map(s => ({ id: s.id || s._id, name: s.name, present: false, status: 'absent' })));
        setLateMinutesMap({});
      } catch (e) {
        console.error('Roster load failed, using demo list');
        setAttendanceList([
          { id: 's1', name: 'Rahul Kumar', present: true, status: 'present' },
          { id: 's2', name: 'Priya Sharma', present: false, status: 'absent' },
          { id: 's3', name: 'Amit Verma', present: true, status: 'present' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadRoster();
  }, [selectedCourse]);

  const attendanceColumns = [
    { key: 'name', header: 'Student Name' },
    { 
      key: 'present', 
      header: 'Attendance Status',
      render: (present, student) => (
        <button
          className={`attendance-toggle ${present ? 'present' : 'absent'}`}
          onClick={() => toggleAttendance(student.id)}
        >
          {present ? (
            <>
              <Check size={16} />
              Present
            </>
          ) : (
            <>
              <X size={16} />
              Absent
            </>
          )}
        </button>
      )
    }
    ,{
      key: 'late',
      header: 'Late (mins)',
      render: (_, student) => (
        <input
          type="number"
          min="0"
          value={lateMinutesMap[student.id] || ''}
          onChange={(e) => setLate(student.id, e.target.value)}
          style={{ width: 80 }}
        />
      )
    }
  ];

  const filteredList = useMemo(() => {
    if (filter === 'all') return attendanceList;
    if (filter === 'present') return attendanceList.filter(s => s.status === 'present');
    if (filter === 'absent') return attendanceList.filter(s => s.status === 'absent');
    if (filter === 'late') return attendanceList.filter(s => (lateMinutesMap[s.id] || 0) > 0);
    return attendanceList;
  }, [attendanceList, filter, lateMinutesMap]);

  const presentCount = attendanceList.filter(student => student.present || student.status === 'present').length;
  const totalCount = attendanceList.length;
  const attendancePercentage = ((presentCount / totalCount) * 100).toFixed(1);

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Take Attendance</h1>
        <p>Mark student attendance for your classes</p>
      </div>

      <div className="attendance-controls glass">
        <div className="control-group">
          <label>Course:</label>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="CS101">CS101 - Introduction to Programming</option>
            <option value="CS201">CS201 - Data Structures</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Date:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        <div className="attendance-summary">
          <div className="summary-item">
            <span className="label">Present:</span>
            <span className="value present">{presentCount}</span>
          </div>
          <div className="summary-item">
            <span className="label">Absent:</span>
            <span className="value absent">{totalCount - presentCount}</span>
          </div>
          <div className="summary-item">
            <span className="label">Percentage:</span>
            <span className="value">{attendancePercentage}%</span>
          </div>
        </div>
      </div>

      <div className="attendance-table">
        {loading ? (
          <div style={{ padding: 24 }}>Loading roster...</div>
        ) : (
          <Table
            columns={attendanceColumns}
            data={filteredList}
          />
        )}
      </div>

      <div className="attendance-actions">
        <button className="save-btn" onClick={saveAttendance} disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
};

export default Attendance;
