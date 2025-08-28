const { FeeStructure, Payment, Invoice, FinancialAid, Budget } = require('../models/Finance');
const User = require('../models/User');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

// Fee Structure Controllers
exports.createFeeStructure = async (req, res) => {
  try {
    const newFeeStructure = new FeeStructure({
      ...req.body,
      createdBy: req.user.id
    });
    
    await newFeeStructure.save();
    
    res.status(201).json({
      success: true,
      data: newFeeStructure
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFeeStructures = async (req, res) => {
  try {
    const { academicYear, semester, category, isActive } = req.query;
    
    const query = {};
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const feeStructures = await FeeStructure.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feeStructures.length,
      data: feeStructures
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFeeStructureById = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: feeStructure
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: feeStructure
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    // Check if fee structure is used in any invoices
    const invoiceExists = await Invoice.findOne({
      'items.feeStructureId': req.params.id
    });
    
    if (invoiceExists) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete fee structure that is used in invoices'
      });
    }
    
    const feeStructure = await FeeStructure.findByIdAndDelete(req.params.id);
    
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Payment Controllers
exports.recordPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { studentId, feeStructureId, amount, paymentMethod, invoiceId } = req.body;
    
    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Create payment
    const newPayment = new Payment({
      ...req.body,
      status: 'Completed',
      processedBy: req.user.id
    });
    
    await newPayment.save({ session });
    
    // Update invoice if provided
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      
      if (!invoice) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }
      
      invoice.payments.push(newPayment._id);
      invoice.amountPaid += amount;
      
      await invoice.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      data: newPayment
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { studentId, feeStructureId, status, startDate, endDate } = req.query;
    
    const query = {};
    if (studentId) query.studentId = studentId;
    if (feeStructureId) query.feeStructureId = feeStructureId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(query)
      .populate('studentId', 'name email')
      .populate('feeStructureId')
      .populate('processedBy', 'name email')
      .sort({ paymentDate: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('feeStructureId')
      .populate('processedBy', 'name email');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Completed', 'Failed', 'Refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, processedBy: req.user.id },
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Invoice Controllers
exports.createInvoice = async (req, res) => {
  try {
    const { studentId, academicYear, semester, items } = req.body;
    
    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${academicYear}-${invoiceCount + 1}`.padStart(10, '0');
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const { discount = 0, tax = 0 } = req.body;
    const total = subtotal - discount + tax;
    
    const newInvoice = new Invoice({
      ...req.body,
      invoiceNumber,
      subtotal,
      total,
      createdBy: req.user.id
    });
    
    await newInvoice.save();
    
    res.status(201).json({
      success: true,
      data: newInvoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { studentId, academicYear, semester, status } = req.query;
    
    const query = {};
    if (studentId) query.studentId = studentId;
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (status) query.status = status;
    
    const invoices = await Invoice.find(query)
      .populate('studentId', 'name email')
      .populate('items.feeStructureId')
      .populate('payments')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('items.feeStructureId')
      .populate('payments')
      .populate('createdBy', 'name email');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice status'
      });
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('items.feeStructureId')
      .populate('payments')
      .populate('createdBy', 'name email');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Issue Date: ${invoice.issueDate.toDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
    doc.moveDown();
    
    // Student information
    doc.fontSize(14).text('Student Information');
    doc.fontSize(12).text(`Name: ${invoice.studentId.name}`);
    doc.text(`Email: ${invoice.studentId.email}`);
    doc.moveDown();
    
    // Invoice items
    doc.fontSize(14).text('Invoice Items');
    doc.moveDown();
    
    // Table header
    const tableTop = doc.y;
    const itemX = 50;
    const descriptionX = 150;
    const amountX = 400;
    
    doc.fontSize(12).text('Item', itemX, tableTop);
    doc.text('Description', descriptionX, tableTop);
    doc.text('Amount', amountX, tableTop);
    
    doc.moveDown();
    let tableY = doc.y;
    
    // Table rows
    invoice.items.forEach((item, i) => {
      const y = tableY + i * 20;
      doc.fontSize(10).text(`${i + 1}`, itemX, y);
      doc.text(item.description, descriptionX, y);
      doc.text(`$${item.amount.toFixed(2)}`, amountX, y);
    });
    
    doc.moveDown(invoice.items.length + 1);
    
    // Totals
    doc.fontSize(12).text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Discount: $${invoice.discount.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax: $${invoice.tax.toFixed(2)}`, { align: 'right' });
    doc.fontSize(14).text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right' });
    doc.fontSize(12).text(`Amount Paid: $${invoice.amountPaid.toFixed(2)}`, { align: 'right' });
    doc.fontSize(14).text(`Balance Due: $${invoice.balance.toFixed(2)}`, { align: 'right' });
    
    doc.moveDown();
    doc.fontSize(12).text(`Status: ${invoice.status}`, { align: 'right' });
    
    // Finalize the PDF
    doc.end();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Financial Aid Controllers
exports.applyForFinancialAid = async (req, res) => {
  try {
    const newFinancialAid = new FinancialAid({
      ...req.body,
      studentId: req.user.role === 'student' ? req.user.id : req.body.studentId
    });
    
    await newFinancialAid.save();
    
    res.status(201).json({
      success: true,
      data: newFinancialAid
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFinancialAids = async (req, res) => {
  try {
    const { studentId, academicYear, type, status } = req.query;
    
    const query = {};
    if (studentId) query.studentId = studentId;
    if (academicYear) query.academicYear = academicYear;
    if (type) query.type = type;
    if (status) query.status = status;
    
    // If student is requesting, only show their own financial aid
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    
    const financialAids = await FinancialAid.find(query)
      .populate('studentId', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: financialAids.length,
      data: financialAids
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFinancialAidById = async (req, res) => {
  try {
    const financialAid = await FinancialAid.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!financialAid) {
      return res.status(404).json({
        success: false,
        message: 'Financial aid not found'
      });
    }
    
    // Check if user has permission to view
    if (req.user.role === 'student' && financialAid.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this financial aid'
      });
    }
    
    res.status(200).json({
      success: true,
      data: financialAid
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateFinancialAidStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Applied', 'Approved', 'Rejected', 'Disbursed', 'Terminated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid financial aid status'
      });
    }
    
    const updateData = { status };
    
    // If approving, add approver info
    if (status === 'Approved') {
      updateData.approvedBy = req.user.id;
      updateData.approvalDate = Date.now();
    }
    
    const financialAid = await FinancialAid.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!financialAid) {
      return res.status(404).json({
        success: false,
        message: 'Financial aid not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: financialAid
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addDisbursement = async (req, res) => {
  try {
    const { date, amount } = req.body;
    
    const financialAid = await FinancialAid.findById(req.params.id);
    
    if (!financialAid) {
      return res.status(404).json({
        success: false,
        message: 'Financial aid not found'
      });
    }
    
    if (financialAid.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Financial aid must be approved before adding disbursements'
      });
    }
    
    financialAid.disbursementSchedule.push({
      date,
      amount,
      status: 'Scheduled'
    });
    
    await financialAid.save();
    
    res.status(200).json({
      success: true,
      data: financialAid
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateDisbursementStatus = async (req, res) => {
  try {
    const { disbursementId, status } = req.body;
    
    if (!['Scheduled', 'Disbursed', 'Delayed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid disbursement status'
      });
    }
    
    const financialAid = await FinancialAid.findById(req.params.id);
    
    if (!financialAid) {
      return res.status(404).json({
        success: false,
        message: 'Financial aid not found'
      });
    }
    
    const disbursement = financialAid.disbursementSchedule.id(disbursementId);
    
    if (!disbursement) {
      return res.status(404).json({
        success: false,
        message: 'Disbursement not found'
      });
    }
    
    disbursement.status = status;
    
    // If all disbursements are complete, mark financial aid as disbursed
    if (status === 'Disbursed') {
      const allDisbursed = financialAid.disbursementSchedule.every(d => 
        d.status === 'Disbursed' || d.status === 'Cancelled'
      );
      
      if (allDisbursed) {
        financialAid.status = 'Disbursed';
      }
    }
    
    await financialAid.save();
    
    res.status(200).json({
      success: true,
      data: financialAid
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Budget Controllers
exports.createBudget = async (req, res) => {
  try {
    const newBudget = new Budget({
      ...req.body,
      createdBy: req.user.id
    });
    
    await newBudget.save();
    
    res.status(201).json({
      success: true,
      data: newBudget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const { academicYear, department, category, status } = req.query;
    
    const query = {};
    if (academicYear) query.academicYear = academicYear;
    if (department) query.department = department;
    if (category) query.category = category;
    if (status) query.status = status;
    
    const budgets = await Budget.find(query)
      .populate('createdBy', 'name email')
      .populate('expenses.approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('expenses.approvedBy', 'name email');
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { description, amount } = req.body;
    
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    if (budget.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add expenses to a non-active budget'
      });
    }
    
    if (amount > budget.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount exceeds remaining budget'
      });
    }
    
    budget.expenses.push({
      description,
      amount,
      approvedBy: req.user.id
    });
    
    await budget.save();
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.closeBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { status: 'Closed' },
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Reports
exports.generateFinancialReport = async (req, res) => {
  try {
    const { academicYear, reportType, format = 'json' } = req.query;
    
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required'
      });
    }
    
    let reportData = {};
    
    // Revenue report
    if (reportType === 'revenue' || !reportType) {
      // Get all invoices for the academic year
      const invoices = await Invoice.find({ academicYear });
      
      // Calculate total invoiced, paid, and outstanding
      const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
      const totalOutstanding = totalInvoiced - totalPaid;
      
      // Get payment distribution by method
      const payments = await Payment.find({
        paymentDate: {
          $gte: new Date(`${academicYear.split('-')[0]}-01-01`),
          $lte: new Date(`${academicYear.split('-')[1]}-12-31`)
        }
      });
      
      const paymentsByMethod = {};
      payments.forEach(payment => {
        paymentsByMethod[payment.paymentMethod] = (paymentsByMethod[payment.paymentMethod] || 0) + payment.amount;
      });
      
      reportData.revenue = {
        totalInvoiced,
        totalPaid,
        totalOutstanding,
        paymentsByMethod,
        collectionRate: (totalPaid / totalInvoiced) * 100
      };
    }
    
    // Financial aid report
    if (reportType === 'financialAid' || !reportType) {
      const financialAids = await FinancialAid.find({ academicYear });
      
      const totalAidAmount = financialAids.reduce((sum, aid) => sum + aid.amount, 0);
      
      const aidByType = {};
      financialAids.forEach(aid => {
        aidByType[aid.type] = (aidByType[aid.type] || 0) + aid.amount;
      });
      
      const aidByStatus = {};
      financialAids.forEach(aid => {
        aidByStatus[aid.status] = (aidByStatus[aid.status] || 0) + aid.amount;
      });
      
      reportData.financialAid = {
        totalAidAmount,
        aidByType,
        aidByStatus,
        studentCount: new Set(financialAids.map(aid => aid.studentId.toString())).size
      };
    }
    
    // Budget report
    if (reportType === 'budget' || !reportType) {
      const budgets = await Budget.find({ academicYear });
      
      const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
      const totalSpent = budgets.reduce((sum, budget) => 
        sum + budget.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
      const totalRemaining = totalAllocated - totalSpent;
      
      const spendingByDepartment = {};
      budgets.forEach(budget => {
        const departmentSpent = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        spendingByDepartment[budget.department] = (spendingByDepartment[budget.department] || 0) + departmentSpent;
      });
      
      const spendingByCategory = {};
      budgets.forEach(budget => {
        const categorySpent = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        spendingByCategory[budget.category] = (spendingByCategory[budget.category] || 0) + categorySpent;
      });
      
      reportData.budget = {
        totalAllocated,
        totalSpent,
        totalRemaining,
        utilizationRate: (totalSpent / totalAllocated) * 100,
        spendingByDepartment,
        spendingByCategory
      };
    }
    
    // Format response based on requested format
    if (format === 'csv') {
      // Convert to CSV
      const csvData = [];
      
      if (reportData.revenue) {
        csvData.push(['Revenue Report']);
        csvData.push(['Total Invoiced', reportData.revenue.totalInvoiced]);
        csvData.push(['Total Paid', reportData.revenue.totalPaid]);
        csvData.push(['Total Outstanding', reportData.revenue.totalOutstanding]);
        csvData.push(['Collection Rate (%)', reportData.revenue.collectionRate]);
        csvData.push([]);
        
        csvData.push(['Payment Method', 'Amount']);
        Object.entries(reportData.revenue.paymentsByMethod).forEach(([method, amount]) => {
          csvData.push([method, amount]);
        });
        csvData.push([]);
      }
      
      if (reportData.financialAid) {
        csvData.push(['Financial Aid Report']);
        csvData.push(['Total Aid Amount', reportData.financialAid.totalAidAmount]);
        csvData.push(['Student Count', reportData.financialAid.studentCount]);
        csvData.push([]);
        
        csvData.push(['Aid Type', 'Amount']);
        Object.entries(reportData.financialAid.aidByType).forEach(([type, amount]) => {
          csvData.push([type, amount]);
        });
        csvData.push([]);
        
        csvData.push(['Aid Status', 'Amount']);
        Object.entries(reportData.financialAid.aidByStatus).forEach(([status, amount]) => {
          csvData.push([status, amount]);
        });
        csvData.push([]);
      }
      
      if (reportData.budget) {
        csvData.push(['Budget Report']);
        csvData.push(['Total Allocated', reportData.budget.totalAllocated]);
        csvData.push(['Total Spent', reportData.budget.totalSpent]);
        csvData.push(['Total Remaining', reportData.budget.totalRemaining]);
        csvData.push(['Utilization Rate (%)', reportData.budget.utilizationRate]);
        csvData.push([]);
        
        csvData.push(['Department', 'Amount Spent']);
        Object.entries(reportData.budget.spendingByDepartment).forEach(([dept, amount]) => {
          csvData.push([dept, amount]);
        });
        csvData.push([]);
        
        csvData.push(['Category', 'Amount Spent']);
        Object.entries(reportData.budget.spendingByCategory).forEach(([category, amount]) => {
          csvData.push([category, amount]);
        });
      }
      
      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=financial-report-${academicYear}.csv`);
      
      // Write CSV to response
      const csvStream = csv.format({ headers: false });
      csvStream.pipe(res);
      csvData.forEach(row => csvStream.write(row));
      csvStream.end();
    } else {
      // Return JSON
      res.status(200).json({
        success: true,
        academicYear,
        data: reportData
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};