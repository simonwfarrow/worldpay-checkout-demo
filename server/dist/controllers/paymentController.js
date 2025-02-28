"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Get Worldpay credentials from environment variables
const WORLDPAY_USERNAME = process.env.WORLDPAY_USERNAME || '';
const WORLDPAY_PASSWORD = process.env.WORLDPAY_PASSWORD || '';
/**
 * Process a payment using the Worldpay session
 * @param req Express request object with payment details
 * @param res Express response object
 */
const processPayment = async (req, res) => {
    var _a, _b, _c;
    try {
        const paymentData = req.body;
        // Validate required fields
        if (!paymentData.session) {
            res.status(400).json({
                success: false,
                error: 'Missing session token'
            });
            return;
        }
        if (!paymentData.amount || paymentData.amount <= 0) {
            res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
            return;
        }
        console.log(`Processing payment with session: ${paymentData.session}`);
        try {
            // Generate a unique transaction reference
            const transactionReference = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            // Prepare the request body
            const requestBody = {
                transactionReference: transactionReference,
                merchant: {
                    entity: 'default'
                },
                instruction: {
                    method: 'card',
                    paymentInstrument: {
                        type: 'checkout',
                        cardHolderName: 'Test Customer',
                        sessionHref: paymentData.session.startsWith('http')
                            ? paymentData.session
                            : `https://try.access.worldpay.com/sessions/${paymentData.session}`,
                        billingAddress: {
                            address1: '123 Test Street',
                            postalCode: 'TE1 1ST',
                            city: 'Test City',
                            countryCode: 'GB'
                        }
                    },
                    narrative: {
                        line1: 'Test Payment'
                    },
                    value: {
                        currency: paymentData.currency || 'GBP',
                        amount: parseInt(paymentData.amount.toString(), 10)
                    }
                }
            };
            // Log the request for debugging
            console.log('Worldpay API request:', JSON.stringify(requestBody, null, 2));
            // Call Worldpay API to process the payment
            const resp = await (0, node_fetch_1.default)(`https://try.access.worldpay.com/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'WP-Api-Version': '2024-06-01',
                    Authorization: 'Basic ' + Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')
                },
                body: JSON.stringify(requestBody)
            });
            // Parse the response
            const data = await resp.json();
            // Log the response for debugging
            console.log('Worldpay API response status:', resp.status);
            console.log('Worldpay API response:', JSON.stringify(data, null, 2));
            // Check if the payment was successful based on the outcome field
            if (resp.ok && data.outcome === 'authorized') {
                // Extract payment details from the response
                const paymentHref = ((_b = (_a = data._links) === null || _a === void 0 ? void 0 : _a.self) === null || _b === void 0 ? void 0 : _b.href) || '';
                const transactionId = data.transactionReference || '';
                const cardDetails = data.paymentInstrument ? {
                    cardBrand: data.paymentInstrument.cardBrand || '',
                    lastFour: data.paymentInstrument.lastFour || '',
                    expiryDate: data.paymentInstrument.expiryDate || {}
                } : {};
                const response = {
                    success: true,
                    transactionId: transactionId,
                    message: 'Payment authorized successfully',
                    details: {
                        outcome: data.outcome,
                        transactionReference: data.transactionReference,
                        paymentHref: paymentHref,
                        cardDetails: cardDetails,
                        authorizationCode: ((_c = data.issuer) === null || _c === void 0 ? void 0 : _c.authorizationCode) || '',
                        actions: data._actions || {}
                    }
                };
                res.status(200).json(response);
            }
            else {
                // Payment failed or was declined
                let errorMessage = data.message || 'The payment was not authorized';
                let errorName = data.errorName || 'Payment processing failed';
                // Handle specific error cases
                if (data.errorName === 'bodyDoesNotMatchSchema') {
                    errorMessage = 'The payment request format is invalid. Please check the API documentation.';
                    console.error('Schema validation errors:', data.validationErrors);
                }
                const response = {
                    success: false,
                    error: errorName,
                    message: errorMessage,
                    details: data
                };
                res.status(400).json(response);
            }
        }
        catch (apiError) {
            console.error('Worldpay API error:', apiError);
            res.status(500).json({
                success: false,
                error: 'Error communicating with payment gateway',
                message: apiError instanceof Error ? apiError.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing the payment'
        });
    }
};
exports.processPayment = processPayment;
