const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Fee Structure routes
router.post('/fee-structure', authenticate, authorize('Admin'), financeController.createFeeStructure);
router.get('/fee-structure', authenticate, financeController.getFeeStructures);
router.get('/fee-structure/:id', authenticate, financeController.getFeeStructureById);
router.put('/fee-structure/:id', authenticate, authorize('Admin'), financeController.updateFeeStructure);
router.delete('/fee-structure/:id', authenticate, authorize('Admin'), financeController.deleteFeeStructure);

// Payment routes
router.post('/payment', authenticate, authorize('Admin'), financeController.recordPayment);
router.get('/payment', authenticate, authorize('Admin','Teacher'), financeController.getPayments);
router.get('/payment/:id', authenticate, financeController.getPaymentById);
router.put('/payment/:id/status', authenticate, authorize('Admin'), financeController.updatePaymentStatus);

// Invoice routes
router.post('/invoice', authenticate, authorize('Admin'), financeController.createInvoice);
router.get('/invoice', authenticate, financeController.getInvoices);
router.get('/invoice/:id', authenticate, financeController.getInvoiceById);
router.put('/invoice/:id/status', authenticate, authorize('Admin'), financeController.updateInvoiceStatus);
router.get('/invoice/:id/pdf', authenticate, financeController.generateInvoicePDF);

// Financial Aid routes
router.post('/financial-aid', authenticate, financeController.applyForFinancialAid);
router.get('/financial-aid', authenticate, financeController.getFinancialAids);
router.get('/financial-aid/:id', authenticate, financeController.getFinancialAidById);
router.put('/financial-aid/:id/status', authenticate, authorize('Admin'), financeController.updateFinancialAidStatus);
router.post('/financial-aid/:id/disbursement', authenticate, authorize('Admin'), financeController.addDisbursement);
router.put('/financial-aid/:id/disbursement', authenticate, authorize('Admin'), financeController.updateDisbursementStatus);

// Budget routes
router.post('/budget', authenticate, authorize('Admin'), financeController.createBudget);
router.get('/budget', authenticate, authorize('Admin','Teacher'), financeController.getBudgets);
router.get('/budget/:id', authenticate, authorize('Admin','Teacher'), financeController.getBudgetById);
router.post('/budget/:id/expense', authenticate, authorize('Admin'), financeController.addExpense);
router.put('/budget/:id/close', authenticate, authorize('Admin'), financeController.closeBudget);

// Reports
router.get('/report', authenticate, authorize('Admin'), financeController.generateFinancialReport);

module.exports = router;