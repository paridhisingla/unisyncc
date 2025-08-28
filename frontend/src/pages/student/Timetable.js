import React from 'react';
import { timetable } from '../../data/dummyData';

const Timetable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00'];

  const getTimetableData = () => {
    const data = {};
    days.forEach(day => {
      data[day] = {};
      timeSlots.forEach(time => {
        const session = timetable.find(item => item.day === day && item.time === time);
        data[day][time] = session || null;
      });
    });
    return data;
  };

  const timetableData = getTimetableData();

  return (
    <div className="timetable-page">
      <div className="page-header">
        <h1>My Timetable</h1>
        <p>Your weekly class schedule</p>
      </div>

      <div className="timetable-container glass">
        <table className="timetable">
          <thead>
            <tr>
              <th className="time-header">Time</th>
              {days.map(day => (
                <th key={day} className="day-header">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="time-slot">{time}</td>
                {days.map(day => {
                  const session = timetableData[day][time];
                  return (
                    <td key={`${day}-${time}`} className="schedule-cell">
                      {session ? (
                        <div className="class-session">
                          <div className="subject-code">{session.subject}</div>
                          <div className="room-info">{session.room}</div>
                        </div>
                      ) : (
                        <div className="empty-slot">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="timetable-legend">
        <h3>Course Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-code">CS101</span>
            <span className="legend-name">Introduction to Programming</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">CS201</span>
            <span className="legend-name">Data Structures</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">MATH101</span>
            <span className="legend-name">Calculus I</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">MATH201</span>
            <span className="legend-name">Linear Algebra</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">PHY101</span>
            <span className="legend-name">General Physics</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">PHY201</span>
            <span className="legend-name">Quantum Physics</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">CHEM101</span>
            <span className="legend-name">General Chemistry</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">CHEM201</span>
            <span className="legend-name">Organic Chemistry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
