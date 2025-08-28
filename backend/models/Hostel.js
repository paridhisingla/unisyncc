const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['boys', 'girls', 'mixed'], required: true },
    totalRooms: { type: Number, required: true, min: 1 },
    occupiedRooms: { type: Number, default: 0, min: 0 },
    totalBeds: { type: Number, required: true, min: 1 },
    occupiedBeds: { type: Number, default: 0, min: 0 },
    address: { type: String, required: true },
    warden: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    facilities: [{ type: String }], // WiFi, Laundry, Mess, etc.
    rules: [{ type: String }],
    monthlyFee: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'maintenance', 'closed'], default: 'active' }
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    roomNumber: { type: String, required: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1, max: 4 },
    occupancy: { type: Number, default: 0, min: 0 },
    type: { type: String, enum: ['single', 'double', 'triple', 'quad'], required: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    facilities: [{ type: String }], // AC, Attached Bathroom, Balcony, etc.
    status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available' }
  },
  { timestamps: true }
);

const allocationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bedNumber: { type: Number, required: true },
    allocationDate: { type: Date, default: Date.now },
    vacateDate: { type: Date },
    academicYear: { type: String, required: true },
    status: { type: String, enum: ['active', 'vacated', 'suspended'], default: 'active' },
    securityDepositPaid: { type: Number, default: 0 },
    securityDepositRefunded: { type: Number, default: 0 },
    monthlyFee: { type: Number, required: true },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

// Indexes
hostelSchema.index({ type: 1, status: 1 });
roomSchema.index({ hostelId: 1, status: 1 });
allocationSchema.index({ studentId: 1, status: 1 });
allocationSchema.index({ hostelId: 1, academicYear: 1 });

// Virtuals
hostelSchema.virtual('availableRooms').get(function() {
  return this.totalRooms - this.occupiedRooms;
});

hostelSchema.virtual('availableBeds').get(function() {
  return this.totalBeds - this.occupiedBeds;
});

hostelSchema.virtual('occupancyRate').get(function() {
  return this.totalBeds > 0 ? (this.occupiedBeds / this.totalBeds * 100).toFixed(1) : 0;
});

roomSchema.virtual('availableSpace').get(function() {
  return this.capacity - this.occupancy;
});

roomSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.occupancy < this.capacity;
});

const Hostel = mongoose.model('Hostel', hostelSchema);
const Room = mongoose.model('Room', roomSchema);
const HostelAllocation = mongoose.model('HostelAllocation', allocationSchema);

module.exports = { Hostel, Room, HostelAllocation };
