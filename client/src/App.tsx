import React, { useState } from 'react';
import './App.css';
import CheckoutForm from './components/CheckoutForm';
import PaymentQuery from './components/PaymentQuery';

function App() {
  const [activeTab, setActiveTab] = useState<'checkout' | 'query'>('checkout');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Worldpay Checkout Demo</h1>
        <nav className="App-nav">
          <button 
            className={activeTab === 'checkout' ? 'active' : ''} 
            onClick={() => setActiveTab('checkout')}
          >
            Checkout
          </button>
          <button 
            className={activeTab === 'query' ? 'active' : ''} 
            onClick={() => setActiveTab('query')}
          >
            Payment History
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'checkout' ? (
          <div className="checkout-container">
            <h2>Enter Your Payment Details</h2>
            <CheckoutForm />
          </div>
        ) : (
          <div className="query-container">
            <PaymentQuery />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
