const { Timetable, Room } = require('../models/Timetable');
const User = require('../models/User');
const { paginateResults } = require('../utils/pagination');
const mongoose = require('mongoose');
const ics = require('ics');

// Compose a timetable with clash resolution
exports.composeTimetable = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { constraints, proposals } = req.body;
    
    if (!proposals || !Array.isArray(proposals)) {
      return res.status(400).json({ message: 'Invalid proposals data' });
    }
    
    // Process constraints
    const maxTeacherHours = constraints?.maxTeacherHours || 20;
    const preferredRooms = constraints?.preferredRooms || [];
    const avoidDays = constraints?.avoidDays || [];
    
    // Create initial timetable
    const timetable = new Timetable({
      name: req.body.name,
      academicYear: req.body.academicYear,
      semester: req.body.semester,
      timeSlots: [],
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });
    
    // Process each proposal
    const clashes = [];
    const warnings = [];
    
    for (const proposal of proposals) {
      const timeSlot = {
        day: proposal.day,
        startTime: proposal.startTime,
        endTime: proposal.endTime,
        courseId: proposal.courseId,
        teacherId: proposal.teacherId,
        roomId: proposal.roomId,
        classId: proposal.classId,
        sessionType: proposal.sessionType,
        equipmentNeeded: proposal.equipmentNeeded || []
      };
      
      // Add to timetable
      timetable.timeSlots.push(timeSlot);
      
      // Check for clashes after each addition
      const clashResult = timetable.hasClashes();
      if (clashResult.hasClash) {
        clashes.push({
          proposal,
          clash: clashResult
        });
        
        // Remove the slot that caused the clash
        timetable.timeSlots.pop();
      }
      
      // Check teacher load
      if (proposal.teacherId) {
        const teacherSlots = timetable.timeSlots.filter(
          slot => slot.teacherId && slot.teacherId.toString() === proposal.teacherId.toString()
        );
        
        // Calculate total hours
        let totalHours = 0;
        for (const slot of teacherSlots) {
          const startMinutes = timeToMinutes(slot.startTime);
          const endMinutes = timeToMinutes(slot.endTime);
          totalHours += (endMinutes - startMinutes) / 60;
        }
        
        if (totalHours > maxTeacherHours) {
          warnings.push({
            type: 'TeacherOverload',
            teacherId: proposal.teacherId,
            hours: totalHours,
            maxHours: maxTeacherHours
          });
        }
      }
      
      // Check room equipment
      if (proposal.roomId && proposal.equipmentNeeded && proposal.equipmentNeeded.length > 0) {
        const room = await Room.findById(proposal.roomId);
        if (room) {
          const missingEquipment = proposal.equipmentNeeded.filter(
            item => !room.equipment.includes(item)
          );
          
          if (missingEquipment.length > 0) {
            warnings.push({
              type: 'MissingEquipment',
              roomId: proposal.roomId,
              roomName: room.name,
              missingEquipment
            });
          }
        }
      }
    }
    
    // Save timetable if there are slots
    if (timetable.timeSlots.length > 0) {
      await timetable.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: `Timetable composed with ${timetable.timeSlots.length} slots`,
      timetable,
      clashes,
      warnings,
      acceptedProposals: timetable.timeSlots.length,
      rejectedProposals: clashes.length
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Get timetable by class
exports.getTimetableByClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const timetable = await Timetable.findOne({ 
      classId: id,
      isActive: true
    }).populate('timeSlots.courseId', 'name code')
      .populate('timeSlots.teacherId', 'name')
      .populate('timeSlots.roomId', 'name building');
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timetable by teacher
exports.getTimetableByTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const timetable = await Timetable.findOne({ 
      teacherId: id,
      isActive: true
    }).populate('timeSlots.courseId', 'name code')
      .populate('timeSlots.classId', 'name')
      .populate('timeSlots.roomId', 'name building');
    
    if (!timetable) {
      // Find all timetables that have this teacher in any time slot
      const timetables = await Timetable.find({
        'timeSlots.teacherId': id,
        isActive: true
      }).populate('timeSlots.courseId', 'name code')
        .populate('timeSlots.classId', 'name')
        .populate('timeSlots.roomId', 'name building');
      
      if (timetables.length === 0) {
        return res.status(404).json({ message: 'No timetables found for this teacher' });
      }
      
      // Extract relevant time slots
      const timeSlots = [];
      timetables.forEach(tt => {
        tt.timeSlots.forEach(slot => {
          if (slot.teacherId && slot.teacherId.toString() === id) {
            timeSlots.push(slot);
          }
        });
      });
      
      return res.status(200).json({
        teacherId: id,
        timeSlots
      });
    }
    
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timetable by room
exports.getTimetableByRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const timetable = await Timetable.findOne({ 
      roomId: id,
      isActive: true
    }).populate('timeSlots.courseId', 'name code')
      .populate('timeSlots.teacherId', 'name')
      .populate('timeSlots.classId', 'name');
    
    if (!timetable) {
      // Find all timetables that have this room in any time slot
      const timetables = await Timetable.find({
        'timeSlots.roomId': id,
        isActive: true
      }).populate('timeSlots.courseId', 'name code')
        .populate('timeSlots.teacherId', 'name')
        .populate('timeSlots.classId', 'name');
      
      if (timetables.length === 0) {
        return res.status(404).json({ message: 'No timetables found for this room' });
      }
      
      // Extract relevant time slots
      const timeSlots = [];
      timetables.forEach(tt => {
        tt.timeSlots.forEach(slot => {
          if (slot.roomId && slot.roomId.toString() === id) {
            timeSlots.push(slot);
          }
        });
      });
      
      return res.status(200).json({
        roomId: id,
        timeSlots
      });
    }
    
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Run what-if simulation
exports.runSimulation = async (req, res) => {
  try {
    const { timetableId, changes } = req.body;
    
    if (!timetableId || !changes || !Array.isArray(changes)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    // Get original timetable
    const originalTimetable = await Timetable.findById(timetableId);
    if (!originalTimetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    // Create a copy for simulation
    const simulatedTimetable = new Timetable({
      name: `${originalTimetable.name} (Simulation)`,
      academicYear: originalTimetable.academicYear,
      semester: originalTimetable.semester,
      timeSlots: JSON.parse(JSON.stringify(originalTimetable.timeSlots)),
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      isActive: false
    });
    
    // Apply changes
    const results = [];
    
    for (const change of changes) {
      const { action, slotIndex, newData } = change;
      
      if (action === 'add' && newData) {
        // Add new slot
        simulatedTimetable.timeSlots.push(newData);
        
        // Check for clashes
        const clashResult = simulatedTimetable.hasClashes();
        if (clashResult.hasClash) {
          results.push({
            action,
            success: false,
            clash: clashResult
          });
          
          // Remove the slot that caused the clash
          simulatedTimetable.timeSlots.pop();
        } else {
          results.push({
            action,
            success: true,
            slot: newData
          });
        }
      } else if (action === 'update' && typeof slotIndex === 'number' && newData) {
        // Store old data
        const oldData = simulatedTimetable.timeSlots[slotIndex];
        
        // Update slot
        simulatedTimetable.timeSlots[slotIndex] = {
          ...oldData,
          ...newData
        };
        
        // Check for clashes
        const clashResult = simulatedTimetable.hasClashes();
        if (clashResult.hasClash) {
          results.push({
            action,
            success: false,
            clash: clashResult
          });
          
          // Revert the change
          simulatedTimetable.timeSlots[slotIndex] = oldData;
        } else {
          results.push({
            action,
            success: true,
            slot: simulatedTimetable.timeSlots[slotIndex]
          });
        }
      } else if (action === 'delete' && typeof slotIndex === 'number') {
        // Store old data
        const oldData = simulatedTimetable.timeSlots[slotIndex];
        
        // Remove slot
        simulatedTimetable.timeSlots.splice(slotIndex, 1);
        
        results.push({
          action,
          success: true,
          oldSlot: oldData
        });
      }
    }
    
    // Calculate impact metrics
    const teacherImpact = calculateTeacherImpact(originalTimetable, simulatedTimetable);
    const roomUtilization = calculateRoomUtilization(originalTimetable, simulatedTimetable);
    
    res.status(200).json({
      simulatedTimetable,
      results,
      impact: {
        teacherImpact,
        roomUtilization
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export timetable to ICS
exports.exportToICS = async (req, res) => {
  try {
    const { id } = req.params;
    
    const timetable = await Timetable.findById(id)
      .populate('timeSlots.courseId', 'name code')
      .populate('timeSlots.teacherId', 'name')
      .populate('timeSlots.roomId', 'name building')
      .populate('timeSlots.classId', 'name');
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    // Convert to ICS format
    const events = [];
    
    // Get semester start date (assuming it's stored in the timetable or can be derived)
    const semesterStart = new Date(); // This should be replaced with actual semester start date
    
    // Map days to numbers (0 = Monday, 6 = Sunday)
    const dayMap = {
      'Monday': 0,
      'Tuesday': 1,
      'Wednesday': 2,
      'Thursday': 3,
      'Friday': 4,
      'Saturday': 5,
      'Sunday': 6
    };
    
    timetable.timeSlots.forEach(slot => {
      // Calculate the first occurrence of this day in the semester
      const dayOffset = (dayMap[slot.day] - semesterStart.getDay() + 7) % 7;
      const firstOccurrence = new Date(semesterStart);
      firstOccurrence.setDate(firstOccurrence.getDate() + dayOffset);
      
      // Parse start and end times
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      
      // Create event
      const event = {
        start: [
          firstOccurrence.getFullYear(),
          firstOccurrence.getMonth() + 1,
          firstOccurrence.getDate(),
          startHour,
          startMinute
        ],
        end: [
          firstOccurrence.getFullYear(),
          firstOccurrence.getMonth() + 1,
          firstOccurrence.getDate(),
          endHour,
          endMinute
        ],
        title: slot.courseId ? `${slot.courseId.code}: ${slot.courseId.name}` : 'Class',
        description: `Session Type: ${slot.sessionType}\nTeacher: ${slot.teacherId ? slot.teacherId.name : 'TBA'}\nRoom: ${slot.roomId ? `${slot.roomId.name}, ${slot.roomId.building}` : 'TBA'}`,
        location: slot.roomId ? `${slot.roomId.name}, ${slot.roomId.building}` : 'TBA',
        recurrenceRule: 'FREQ=WEEKLY;COUNT=15' // Assuming 15 weeks in a semester
      };
      
      events.push(event);
    });
    
    // Generate ICS file
    ics.createEvents(events, (error, value) => {
      if (error) {
        return res.status(500).json({ message: 'Error generating ICS file' });
      }
      
      res.status(200).json({
        message: 'ICS file generated successfully',
        icsData: value
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to calculate teacher impact
function calculateTeacherImpact(originalTimetable, simulatedTimetable) {
  const teacherMap = {};
  
  // Process original timetable
  originalTimetable.timeSlots.forEach(slot => {
    if (!slot.teacherId) return;
    
    const teacherId = slot.teacherId.toString();
    if (!teacherMap[teacherId]) {
      teacherMap[teacherId] = { original: 0, simulated: 0 };
    }
    
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    teacherMap[teacherId].original += (endMinutes - startMinutes) / 60;
  });
  
  // Process simulated timetable
  simulatedTimetable.timeSlots.forEach(slot => {
    if (!slot.teacherId) return;
    
    const teacherId = slot.teacherId.toString();
    if (!teacherMap[teacherId]) {
      teacherMap[teacherId] = { original: 0, simulated: 0 };
    }
    
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    teacherMap[teacherId].simulated += (endMinutes - startMinutes) / 60;
  });
  
  // Calculate changes
  const impact = Object.keys(teacherMap).map(teacherId => ({
    teacherId,
    originalHours: teacherMap[teacherId].original,
    simulatedHours: teacherMap[teacherId].simulated,
    change: teacherMap[teacherId].simulated - teacherMap[teacherId].original,
    percentChange: ((teacherMap[teacherId].simulated - teacherMap[teacherId].original) / teacherMap[teacherId].original) * 100
  }));
  
  return impact;
}

// Helper function to calculate room utilization
function calculateRoomUtilization(originalTimetable, simulatedTimetable) {
  const roomMap = {};
  
  // Process original timetable
  originalTimetable.timeSlots.forEach(slot => {
    if (!slot.roomId) return;
    
    const roomId = slot.roomId.toString();
    if (!roomMap[roomId]) {
      roomMap[roomId] = { original: 0, simulated: 0 };
    }
    
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    roomMap[roomId].original += (endMinutes - startMinutes) / 60;
  });
  
  // Process simulated timetable
  simulatedTimetable.timeSlots.forEach(slot => {
    if (!slot.roomId) return;
    
    const roomId = slot.roomId.toString();
    if (!roomMap[roomId]) {
      roomMap[roomId] = { original: 0, simulated: 0 };
    }
    
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    roomMap[roomId].simulated += (endMinutes - startMinutes) / 60;
  });
  
  // Calculate changes
  const utilization = Object.keys(roomMap).map(roomId => ({
    roomId,
    originalHours: roomMap[roomId].original,
    simulatedHours: roomMap[roomId].simulated,
    change: roomMap[roomId].simulated - roomMap[roomId].original,
    percentChange: ((roomMap[roomId].simulated - roomMap[roomId].original) / roomMap[roomId].original) * 100
  }));
  
  return utilization;
}

// Room management
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, building, capacity, equipment } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    if (building) filter.building = building;
    if (capacity) filter.capacity = { $gte: parseInt(capacity) };
    if (equipment) filter.equipment = { $in: equipment.split(',') };
    
    const result = await paginateResults(Room, filter, page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;