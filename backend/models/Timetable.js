const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  startTime: { type: String, required: true }, // Format: "HH:MM"
  endTime: { type: String, required: true },   // Format: "HH:MM"
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  sessionType: { type: String, enum: ['Lecture', 'Lab', 'Tutorial', 'Seminar', 'Other'] },
  equipmentNeeded: [{ type: String }]
});

const timetableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    timeSlots: [timeSlotSchema],
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

// Indexes for faster queries
timetableSchema.index({ classId: 1, isActive: 1 });
timetableSchema.index({ teacherId: 1, isActive: 1 });
timetableSchema.index({ roomId: 1, isActive: 1 });

// Method to check for clashes
timetableSchema.methods.hasClashes = function() {
  const slots = this.timeSlots;
  
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      // Check if same day
      if (slots[i].day !== slots[j].day) continue;
      
      // Parse times
      const iStart = timeToMinutes(slots[i].startTime);
      const iEnd = timeToMinutes(slots[i].endTime);
      const jStart = timeToMinutes(slots[j].startTime);
      const jEnd = timeToMinutes(slots[j].endTime);
      
      // Check for overlap
      if (!(iEnd <= jStart || jEnd <= iStart)) {
        // Check if same teacher
        if (slots[i].teacherId && slots[j].teacherId && 
            slots[i].teacherId.toString() === slots[j].teacherId.toString()) {
          return { 
            hasClash: true, 
            type: 'Teacher', 
            teacherId: slots[i].teacherId,
            slots: [slots[i], slots[j]]
          };
        }
        
        // Check if same room
        if (slots[i].roomId && slots[j].roomId && 
            slots[i].roomId.toString() === slots[j].roomId.toString()) {
          return { 
            hasClash: true, 
            type: 'Room', 
            roomId: slots[i].roomId,
            slots: [slots[i], slots[j]]
          };
        }
        
        // Check if same class
        if (slots[i].classId && slots[j].classId && 
            slots[i].classId.toString() === slots[j].classId.toString()) {
          return { 
            hasClash: true, 
            type: 'Class', 
            classId: slots[i].classId,
            slots: [slots[i], slots[j]]
          };
        }
      }
    }
  }
  
  return { hasClash: false };
};

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Create Room model for timetable
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String, required: true },
  floor: { type: Number },
  capacity: { type: Number, required: true },
  equipment: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = { Timetable, Room };