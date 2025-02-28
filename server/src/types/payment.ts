export interface PaymentRequest {
  session: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
  details?: any; // Response details from the payment gateway
} 