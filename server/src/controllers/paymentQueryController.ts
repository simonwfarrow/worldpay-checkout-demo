import { Request, Response } from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Worldpay credentials from environment variables
const WORLDPAY_USERNAME = process.env.WORLDPAY_USERNAME || '';
const WORLDPAY_PASSWORD = process.env.WORLDPAY_PASSWORD || '';

/**
 * Query payments from Worldpay API
 * @param req Express request object with query parameters
 * @param res Express response object
 */
export const queryPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters
    const { 
      startDate, 
      endDate, 
      pageSize = 20, 
      currency, 
      minAmount, 
      maxAmount, 
      last4Digits,
      entityReferences,
      receivedEvents
    } = req.query;

    // Validate required fields
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: startDate and endDate are required'
      });
      return;
    }

    // Build query string
    let queryString = `startDate=${startDate}&endDate=${endDate}&pageSize=${pageSize}`;
    
    // Add optional parameters if provided
    if (currency) queryString += `&currency=${currency}`;
    if (minAmount) queryString += `&minAmount=${minAmount}`;
    if (maxAmount) queryString += `&maxAmount=${maxAmount}`;
    if (last4Digits) queryString += `&last4Digits=${last4Digits}`;
    if (entityReferences) queryString += `&entityReferences=${entityReferences}`;
    if (receivedEvents) queryString += `&receivedEvents=${receivedEvents}`;

    console.log(`Querying payments with parameters: ${queryString}`);

    try {
      // Call Worldpay API to query payments
      const response = await fetch(
        `https://try.access.worldpay.com/paymentQueries/payments?${queryString}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.worldpay.payment-queries-v1.hal+json',
            Authorization: 'Basic ' + Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')
          }
        }
      );

      // Parse the response
      const data = await response.json();
      
      // Log the response for debugging
      console.log('Worldpay API response status:', response.status);
      
      if (response.ok) {
        res.status(200).json({
          success: true,
          data: data
        });
      } else {
        // Query failed
        let errorMessage = data.message || 'Failed to query payments';
        let errorName = data.errorName || 'Query processing failed';
        
        res.status(400).json({
          success: false,
          error: errorName,
          message: errorMessage,
          details: data
        });
      }
    } catch (apiError) {
      console.error('Worldpay API error:', apiError);
      res.status(500).json({
        success: false,
        error: 'Error communicating with payment gateway',
        message: apiError instanceof Error ? apiError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Payment query error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while querying payments'
    });
  }
}; 