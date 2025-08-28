const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    routeNumber: { type: String, required: true, unique: true },
    routeName: { type: String, required: true, trim: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    stops: [{
      stopName: { type: String, required: true },
      arrivalTime: { type: String, required: true }, // HH:MM format
      departureTime: { type: String, required: true },
      distance: { type: Number }, // in km from start
      fare: { type: Number, required: true, min: 0 }
    }],
    totalDistance: { type: Number, required: true, min: 0 },
    estimatedDuration: { type: Number, required: true }, // in minutes
    operatingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
  },
  { timestamps: true }
);

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    vehicleType: { type: String, enum: ['bus', 'van', 'car'], required: true },
    capacity: { type: Number, required: true, min: 1 },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'cng', 'electric'], required: true },
    registrationDate: { type: Date, required: true },
    insuranceExpiry: { type: Date, required: true },
    fitnessExpiry: { type: Date, required: true },
    lastService: { type: Date },
    nextService: { type: Date },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    conductorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    status: { type: String, enum: ['active', 'maintenance', 'repair', 'retired'], default: 'active' },
    mileage: { type: Number }, // km per liter
    currentOdometer: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    pickupStop: { type: String, required: true },
    dropStop: { type: String, required: true },
    subscriptionType: { type: String, enum: ['monthly', 'quarterly', 'semester', 'annual'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    monthlyFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'suspended', 'expired'], default: 'active' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String, required: true }
    }
  },
  { timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    date: { type: Date, required: true },
    pickupTime: { type: Date },
    dropTime: { type: Date },
    pickupStop: { type: String, required: true },
    dropStop: { type: String, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    conductorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

// Indexes
routeSchema.index({ routeNumber: 1, status: 1 });
vehicleSchema.index({ vehicleNumber: 1, status: 1 });
subscriptionSchema.index({ studentId: 1, status: 1 });
subscriptionSchema.index({ routeId: 1, status: 1 });
attendanceSchema.index({ studentId: 1, date: -1 });
attendanceSchema.index({ routeId: 1, date: -1 });

// Virtuals
subscriptionSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - this.paidAmount;
});

subscriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

vehicleSchema.virtual('isInsuranceExpiring').get(function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.insuranceExpiry <= thirtyDaysFromNow;
});

vehicleSchema.virtual('isFitnessExpiring').get(function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.fitnessExpiry <= thirtyDaysFromNow;
});

// Methods
subscriptionSchema.methods.calculateMonthlyFee = function() {
  // Calculate based on route and stops
  const route = this.populate('routeId');
  if (!route) return 0;
  
  // Find pickup and drop stops to calculate fare
  const pickupStop = route.stops.find(stop => stop.stopName === this.pickupStop);
  const dropStop = route.stops.find(stop => stop.stopName === this.dropStop);
  
  if (pickupStop && dropStop) {
    return Math.abs(dropStop.fare - pickupStop.fare);
  }
  
  return this.monthlyFee;
};

const Route = mongoose.model('Route', routeSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const TransportSubscription = mongoose.model('TransportSubscription', subscriptionSchema);
const TransportAttendance = mongoose.model('TransportAttendance', attendanceSchema);

module.exports = { Route, Vehicle, TransportSubscription, TransportAttendance };
