import React, { useEffect, useRef, useState } from "react";
import { processPayment } from "../services/paymentService";
import "./CheckoutForm.css";

function scriptAlreadyLoaded(src: string) {
  return document.querySelector(`script[src="${src}"]`);
}

function loadCheckoutScript(src: string) {
  return new Promise((resolve, reject) => {
    if (scriptAlreadyLoaded(src)) {
      resolve(null);
      return;
    }

    let checkoutScript = document.createElement("script");
    checkoutScript.src = src;
    checkoutScript.onload = resolve;
    checkoutScript.onerror = reject;
    document.head.appendChild(checkoutScript);
  });
}

function addWorldpayCheckoutToPage() {
  return new Promise<WorldpayCheckoutInstance>((resolve, reject) => {
    (function () {
      window.Worldpay.checkout.init(
        {
          id: process.env.REACT_APP_WORLDPAY_CHECKOUT_ID || '',
          form: "#container",
          fields: {
            pan: {
              selector: "#card-pan",
            },
            expiry: {
              selector: "#card-expiry",
            },
            cvv: {
              selector: "#card-cvv",
            },
          },
          styles: {
            "input.is-valid": {
              "color": "green",
            },
            "input.is-invalid": {
              "color": "red",
            },
            "input.is-onfocus": {
              "color": "black",
            },
          },
          enablePanFormatting: true,
        },
        function (error: any, checkout: WorldpayCheckoutInstance) {
          if (error) {
            reject(error);
          } else {
            resolve(checkout);
          }
        },
      );
    })();
  });
}

function CheckoutForm() {
  const checkoutScriptUrl = "https://try.access.worldpay.com/access-checkout/v2/checkout.js";
  const checkoutRef = useRef<WorldpayCheckoutInstance | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ 
    success?: boolean; 
    message?: string; 
    error?: string; 
    transactionId?: string;
    details?: any;
  } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100); // Default amount of 100 (£1.00)

  function generateSession() {
    if (!checkoutRef.current) return;
    
    setIsProcessing(true);
    setPaymentResult(null);
    
    checkoutRef.current.generateSessionState(
      function (error: any, session: string) {
        if (error) {
          console.warn(`Failed to generate session: ${error}`);
          setPaymentResult({
            success: false,
            error: `Failed to generate session: ${error}`
          });
          setIsProcessing(false);
          return;
        }

        const infoDiv = document.querySelector(".info");
        if (infoDiv) {
          infoDiv.innerHTML += `<div>Session retrieved is ${session}</div>`;
        }
        
        console.log(`Session generated: ${session}`);
        
        // Process payment with the session
        handlePayment(session);
      });
  }
  
  async function handlePayment(session: string) {
    try {
      // Ensure the session is properly formatted
      const formattedSession = session.trim();
      
      console.log(`Processing payment with session: ${formattedSession}`);
      
      const result = await processPayment(formattedSession, paymentAmount);
      setPaymentResult({
        success: result.success,
        message: result.message,
        transactionId: result.transactionId,
        details: result.details
      });
    } catch (error) {
      console.error('Payment error:', error);
      
      // Check for specific error types
      let errorMessage = 'Payment processing failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error cases
        if (errorMessage.includes('bodyDoesNotMatchSchema')) {
          errorMessage = 'The payment request format is invalid. Please contact support.';
        }
      }
      
      setPaymentResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function clearForm() {
    if (!checkoutRef.current) return;
    
    checkoutRef.current.clearForm(() => {
      const infoDiv = document.querySelector(".info");
      if (infoDiv) {
        infoDiv.innerHTML = "";
      }
      setPaymentResult(null);
    });
  }

  useEffect(() => {
    loadCheckoutScript(checkoutScriptUrl)
      .then(() => {
        addWorldpayCheckoutToPage()
          .then((checkoutInstance) => {
            checkoutRef.current = checkoutInstance;
          })
          .catch(console.warn);
      })
      .catch(console.warn);

    // Cleanup function
    return () => {
      if (checkoutRef.current) {
        checkoutRef.current.remove();
      }
    };
  }, []);

  return (
    <section className="container" id="container">
      <section className="card">
        <section id="card-pan" className="field" />
        <section className="columns">
          <section>
            <section id="card-expiry" className="field" />
          </section>
          <section>
            <section id="card-cvv" className="field" />
          </section>
        </section>
        <section className="amount-field">
          <label htmlFor="payment-amount">Amount (in pence):</label>
          <input
            id="payment-amount"
            type="number"
            min="1"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            disabled={isProcessing}
          />
        </section>
        <section className="buttons">
          <button 
            className="submit" 
            type="button" 
            onClick={generateSession}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
          <button 
            className="clear" 
            type="button" 
            onClick={clearForm}
            disabled={isProcessing}
          >
            Clear
          </button>
        </section>
      </section>
      <div id="info" className="info" />
      {paymentResult && (
        <div className={`payment-result ${paymentResult.success ? 'success' : 'error'}`}>
          {paymentResult.success ? (
            <>
              <p>{paymentResult.message || 'Payment successful!'}</p>
              {paymentResult.transactionId && (
                <p>Transaction ID: {paymentResult.transactionId}</p>
              )}
              {paymentResult.details && (
                <div className="payment-details">
                  <h4>Payment Details:</h4>
                  <div className="payment-summary">
                    <p><strong>Outcome:</strong> {paymentResult.details.outcome}</p>
                    <p><strong>Transaction Reference:</strong> {paymentResult.details.transactionReference}</p>
                    {paymentResult.details.authorizationCode && (
                      <p><strong>Authorization Code:</strong> {paymentResult.details.authorizationCode}</p>
                    )}
                    {paymentResult.details.cardDetails && (
                      <div className="card-details">
                        <h5>Card Information:</h5>
                        <p><strong>Card Type:</strong> {paymentResult.details.cardDetails.cardBrand}</p>
                        <p><strong>Last 4 Digits:</strong> {paymentResult.details.cardDetails.lastFour}</p>
                        {paymentResult.details.cardDetails.expiryDate && (
                          <p><strong>Expiry:</strong> {paymentResult.details.cardDetails.expiryDate.month}/{paymentResult.details.cardDetails.expiryDate.year}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="technical-details">
                    <h5>Technical Details:</h5>
                    <pre>{JSON.stringify(paymentResult.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p>Error: {paymentResult.error || 'Payment failed'}</p>
              <p>{paymentResult.message}</p>
              {paymentResult.details && (
                <div className="payment-details">
                  <h4>Error Details:</h4>
                  <pre>{JSON.stringify(paymentResult.details, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default CheckoutForm; 