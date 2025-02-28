/**
 * Service for handling payment query API calls
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * Query payments with the given parameters
 * @param params Query parameters
 * @returns Promise with the query result
 */
export const queryPayments = async (params: {
  startDate: string;
  endDate: string;
  pageSize?: number;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  last4Digits?: string;
  entityReferences?: string;
  receivedEvents?: string;
}): Promise<any> => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add required parameters
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    
    // Add optional parameters if provided
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.currency) queryParams.append('currency', params.currency);
    if (params.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
    if (params.last4Digits) queryParams.append('last4Digits', params.last4Digits);
    if (params.entityReferences) queryParams.append('entityReferences', params.entityReferences);
    if (params.receivedEvents) queryParams.append('receivedEvents', params.receivedEvents);
    
    console.log(`Querying payments with parameters: ${queryParams.toString()}`);
    
    const response = await fetch(`${API_URL}/payments/query?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Payment query API error:', responseData);
      throw new Error(responseData.error || 'Payment query failed');
    }

    return responseData;
  } catch (error) {
    console.error('Payment query service error:', error);
    throw error;
  }
}; 