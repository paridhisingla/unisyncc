const User = require('../models/User');
const UserAudit = require('../models/UserAudit');
const { paginateResults } = require('../utils/pagination');
const mongoose = require('mongoose');

// Get all users with filtering and pagination
exports.getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      program, 
      riskLevel, 
      duesStatus,
      search
    } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (program) filter.program = program;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (duesStatus !== undefined) filter.duesStatus = duesStatus === 'true';
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const result = await paginateResults(User, filter, page, limit);
    
    // Log audit
    await UserAudit.create({
      action: 'Read',
      performedBy: req.user._id,
      details: { filter, page, limit }
    });
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log audit
    await UserAudit.create({
      action: 'Read',
      userId: user._id,
      performedBy: req.user._id,
      details: { userId: req.params.id }
    });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    // Validate email uniqueness
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    const user = await User.create(req.body);
    
    // Log audit
    await UserAudit.create({
      action: 'Create',
      userId: user._id,
      performedBy: req.user._id,
      details: { userData: req.body },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If email is being changed, check uniqueness
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Store old data for audit
    const oldData = user.toObject();
    
    // Update user
    Object.keys(req.body).forEach(key => {
      user[key] = req.body[key];
    });
    
    await user.save();
    
    // Log audit
    await UserAudit.create({
      action: 'Update',
      userId: user._id,
      performedBy: req.user._id,
      details: { 
        oldData,
        newData: req.body
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Store user data for audit
    const userData = user.toObject();
    
    await user.remove();
    
    // Log audit
    await UserAudit.create({
      action: 'Delete',
      userId: req.params.id,
      performedBy: req.user._id,
      details: { userData },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk import users
exports.bulkImportUsers = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Invalid users data' });
    }
    
    // Validate emails
    const emails = users.map(user => user.email);
    const existingUsers = await User.find({ email: { $in: emails } });
    
    if (existingUsers.length > 0) {
      const existingEmails = existingUsers.map(user => user.email);
      return res.status(400).json({ 
        message: 'Some emails already exist', 
        existingEmails 
      });
    }
    
    // Create users
    const createdUsers = await User.insertMany(users, { session });
    
    // Log audit for each user
    const auditLogs = createdUsers.map(user => ({
      action: 'Create',
      userId: user._id,
      performedBy: req.user._id,
      details: { bulkImport: true, userData: user },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }));
    
    await UserAudit.insertMany(auditLogs, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({ 
      message: `${createdUsers.length} users imported successfully`,
      users: createdUsers
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// Merge duplicate users
exports.mergeDuplicateUsers = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { primaryUserId, duplicateUserIds } = req.body;
    
    if (!primaryUserId || !duplicateUserIds || !Array.isArray(duplicateUserIds)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    // Get primary user
    const primaryUser = await User.findById(primaryUserId);
    if (!primaryUser) {
      return res.status(404).json({ message: 'Primary user not found' });
    }
    
    // Get duplicate users
    const duplicateUsers = await User.find({ _id: { $in: duplicateUserIds } });
    if (duplicateUsers.length !== duplicateUserIds.length) {
      return res.status(404).json({ message: 'Some duplicate users not found' });
    }
    
    // Merge data
    for (const dupUser of duplicateUsers) {
      // Merge badges
      if (dupUser.badges && dupUser.badges.length > 0) {
        primaryUser.badges = [...primaryUser.badges, ...dupUser.badges];
      }
      
      // Merge sentiment pulse
      if (dupUser.sentimentPulse && dupUser.sentimentPulse.length > 0) {
        primaryUser.sentimentPulse = [...primaryUser.sentimentPulse, ...dupUser.sentimentPulse];
      }
      
      // Merge relationships
      if (dupUser.relationships && dupUser.relationships.length > 0) {
        primaryUser.relationships = [...primaryUser.relationships, ...dupUser.relationships];
      }
      
      // Merge consents
      if (dupUser.consents && dupUser.consents.length > 0) {
        primaryUser.consents = [...primaryUser.consents, ...dupUser.consents];
      }
      
      // Merge achievements
      if (dupUser.achievements && dupUser.achievements.length > 0) {
        primaryUser.achievements = [...primaryUser.achievements, ...dupUser.achievements];
      }
      
      // Merge skills
      if (dupUser.skills && dupUser.skills.length > 0) {
        primaryUser.skills = [...primaryUser.skills, ...dupUser.skills];
      }
      
      // Merge notes
      if (dupUser.notes && dupUser.notes.length > 0) {
        primaryUser.notes = [...primaryUser.notes, ...dupUser.notes];
      }
    }
    
    // Remove duplicates from arrays
    primaryUser.badges = Array.from(new Set(primaryUser.badges.map(b => JSON.stringify(b)))).map(b => JSON.parse(b));
    primaryUser.achievements = Array.from(new Set(primaryUser.achievements));
    primaryUser.skills = Array.from(new Set(primaryUser.skills));
    
    await primaryUser.save({ session });
    
    // Delete duplicate users
    await User.deleteMany({ _id: { $in: duplicateUserIds } }, { session });
    
    // Log audit
    await UserAudit.create({
      action: 'Merge',
      userId: primaryUser._id,
      performedBy: req.user._id,
      details: { 
        primaryUserId,
        duplicateUserIds,
        mergeOperation: 'success'
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ 
      message: 'Users merged successfully',
      user: primaryUser
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Badge management
exports.addBadge = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.badges.push(req.body);
    await user.save();
    
    // Log audit
    await UserAudit.create({
      action: 'Update',
      userId: user._id,
      performedBy: req.user._id,
      details: { 
        operation: 'addBadge',
        badge: req.body
      }
    });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sentiment pulse
exports.addSentimentPulse = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.sentimentPulse.push(req.body);
    await user.save();
    
    // Log audit
    await UserAudit.create({
      action: 'Update',
      userId: user._id,
      performedBy: req.user._id,
      details: { 
        operation: 'addSentimentPulse',
        pulse: req.body
      }
    });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Relationship management
exports.addRelationship = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate related user exists
    const relatedUser = await User.findById(req.body.relatedUser);
    if (!relatedUser) {
      return res.status(404).json({ message: 'Related user not found' });
    }
    
    user.relationships.push(req.body);
    await user.save();
    
    // Log audit
    await UserAudit.create({
      action: 'Update',
      userId: user._id,
      performedBy: req.user._id,
      details: { 
        operation: 'addRelationship',
        relationship: req.body
      }
    });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Consent management
exports.updateConsent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { purpose, granted, expiryDate, details } = req.body;
    
    // Find existing consent or create new one
    const consentIndex = user.consents.findIndex(c => c.purpose === purpose);
    
    if (consentIndex >= 0) {
      user.consents[consentIndex].granted = granted;
      user.consents[consentIndex].date = new Date();
      user.consents[consentIndex].expiryDate = expiryDate;
      user.consents[consentIndex].details = details;
    } else {
      user.consents.push({
        purpose,
        granted,
        date: new Date(),
        expiryDate,
        details
      });
    }
    
    await user.save();
    
    // Log audit
    await UserAudit.create({
      action: 'ConsentChange',
      userId: user._id,
      performedBy: req.user._id,
      details: { 
        purpose,
        granted,
        expiryDate,
        details
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get audit logs for a user
exports.getUserAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filter = { userId: req.params.id };
    
    const result = await paginateResults(UserAudit, filter, page, limit, [
      { path: 'performedBy', select: 'name email role' }
    ]);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify phone number
exports.verifyPhone = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real app, this would involve sending an OTP and verifying it
    // For this implementation, we'll just mark it as verified
    
    user.phoneVerified = true;
    await user.save();
    
    // Log audit
    await UserAudit.create({
      action: 'Update',
      userId: user._id,
      performedBy: req.user._id,
      details: { 
        operation: 'verifyPhone',
        phone: user.phone
      }
    });
    
    res.status(200).json({ message: 'Phone verified successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get relationship graph
exports.getRelationshipGraph = async (req, res) => {
  try {
    const users = await User.find({}, 'name relationships');
    
    const nodes = users.map(user => ({
      id: user._id,
      name: user.name
    }));
    
    const edges = [];
    users.forEach(user => {
      user.relationships.forEach(rel => {
        edges.push({
          source: user._id,
          target: rel.relatedUser,
          type: rel.relationshipType,
          strength: rel.strength
        });
      });
    });
    
    res.status(200).json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};