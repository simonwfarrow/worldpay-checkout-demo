/**
 * Service for handling payment-related API calls
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * Process a payment with the Worldpay session
 * @param session The Worldpay session token
 * @param amount The payment amount
 * @param currency The payment currency (default: GBP)
 * @returns Promise with the payment result
 */
export const processPayment = async (
  session: string,
  amount: number,
  currency: string = 'GBP'
): Promise<any> => {
  try {
    console.log(`Processing payment with session: ${session}`);
    
    const response = await fetch(`${API_URL}/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session,
        amount,
        currency,
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Payment API error:', responseData);
      throw new Error(responseData.error || 'Payment processing failed');
    }

    return responseData;
  } catch (error) {
    console.error('Payment service error:', error);
    throw error;
  }
}; 