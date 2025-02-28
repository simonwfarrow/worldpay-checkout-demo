import React, { useState } from 'react';
import { queryPayments } from '../services/paymentQueryService';
import './PaymentQuery.css';

interface Payment {
  timestamp: string;
  transactionReference: string;
  transactionType: string;
  authorizationType: string;
  entity: string;
  paymentInstrument: {
    type: string;
    card?: {
      number?: {
        last4Digits?: string;
      };
      brand?: string;
      fundingType?: string;
    };
  };
  value: {
    currency: string;
    amount: number;
  };
  _links: {
    self: {
      href: string;
    };
  };
}

interface QueryResponse {
  _links: {
    self: {
      href: string;
    };
    next?: {
      href: string;
    };
  };
  _embedded: {
    payments: Payment[];
  };
}

function PaymentQuery() {
  // Form state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currency, setCurrency] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [last4Digits, setLast4Digits] = useState<string>('');
  
  // Query state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Format dates to ISO string if they're not already
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();
      
      // Build query parameters
      const params: any = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        pageSize
      };
      
      // Add optional parameters if provided
      if (currency) params.currency = currency;
      if (minAmount) params.minAmount = parseInt(minAmount, 10);
      if (maxAmount) params.maxAmount = parseInt(maxAmount, 10);
      if (last4Digits) params.last4Digits = last4Digits;
      
      // Execute query
      const result = await queryPayments(params);
      setQueryResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while querying payments');
      console.error('Payment query error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format amount for display (convert from minor units to major units)
  const formatAmount = (amount: number, currency: string) => {
    // Most currencies use 2 decimal places
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    });
    
    return formatter.format(amount / 100);
  };
  
  return (
    <div className="payment-query-container">
      <h2>Payment Query</h2>
      
      <form onSubmit={handleSubmit} className="query-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start-date">Start Date*</label>
            <input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="end-date">End Date*</label>
            <input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="page-size">Page Size</label>
            <input
              id="page-size"
              type="number"
              min="1"
              max="300"
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <input
              id="currency"
              type="text"
              placeholder="GBP"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="min-amount">Min Amount</label>
            <input
              id="min-amount"
              type="number"
              min="0"
              placeholder="In minor units (e.g. pence)"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="max-amount">Max Amount</label>
            <input
              id="max-amount"
              type="number"
              min="0"
              placeholder="In minor units (e.g. pence)"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="last4-digits">Last 4 Digits</label>
            <input
              id="last4-digits"
              type="text"
              pattern="[0-9]{4}"
              placeholder="1234"
              value={last4Digits}
              onChange={(e) => setLast4Digits(e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search Payments'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      {queryResult && (
        <div className="query-results">
          <h3>Results</h3>
          
          {queryResult._embedded.payments.length === 0 ? (
            <p>No payments found matching your criteria.</p>
          ) : (
            <>
              <p>Found {queryResult._embedded.payments.length} payment(s)</p>
              
              <div className="table-container">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Transaction Ref</th>
                      <th>Type</th>
                      <th>Card Details</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult._embedded.payments.map((payment) => (
                      <tr key={payment._links.self.href}>
                        <td>{formatDate(payment.timestamp)}</td>
                        <td>{payment.transactionReference}</td>
                        <td>{payment.transactionType}</td>
                        <td>
                          {payment.paymentInstrument.card ? (
                            <>
                              {payment.paymentInstrument.card.brand || 'Unknown'} 
                              {payment.paymentInstrument.card.number?.last4Digits && 
                                ` (**** ${payment.paymentInstrument.card.number.last4Digits})`}
                            </>
                          ) : (
                            'Card details not available'
                          )}
                        </td>
                        <td>{formatAmount(payment.value.amount, payment.value.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {queryResult._links.next && (
                <div className="pagination">
                  <p>More results available</p>
                  {/* Pagination could be implemented here */}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PaymentQuery; 