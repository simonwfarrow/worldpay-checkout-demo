import express from 'express';
import { processPayment } from '../controllers/paymentController';
import { queryPayments } from '../controllers/paymentQueryController';

const router = express.Router();

// POST /api/payments/process - Process a payment
router.post('/process', processPayment);

// GET /api/payments/query - Query payments
router.get('/query', queryPayments);

export default router; 