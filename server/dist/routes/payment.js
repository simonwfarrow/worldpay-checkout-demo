"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const paymentQueryController_1 = require("../controllers/paymentQueryController");
const router = express_1.default.Router();
// POST /api/payments/process - Process a payment
router.post('/process', paymentController_1.processPayment);
// GET /api/payments/query - Query payments
router.get('/query', paymentQueryController_1.queryPayments);
exports.default = router;
