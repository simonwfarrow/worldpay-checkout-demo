# Worldpay Checkout Demo

This project demonstrates the integration of Worldpay's checkout SDK into a React application with a Node.js backend for secure payment processing.

## Project Structure

The project is organized as a monorepo with two main components:
- `client/`: React frontend application
- `server/`: Node.js/Express backend API

## Features

- Secure card data capture using Worldpay's hosted fields
- PCI-compliant payment form
- Card validation and formatting
- Session generation for payment processing
- Backend API for processing payments with Worldpay
- Full-stack implementation with React frontend and Express backend
- Detailed payment response display with card information

## Implementation Details

The application uses the Worldpay checkout SDK to create a secure payment form. The SDK handles the sensitive card data, ensuring that the application remains PCI compliant.

Key components:
- **Frontend** (in `client/` directory):
  - `src/components/CheckoutForm.tsx`: The main component that integrates with the Worldpay SDK
  - `src/services/paymentService.ts`: Service for communicating with the backend API
  - Type definitions for TypeScript support
  - Styling for a professional payment form

- **Backend** (in `server/` directory):
  - Express.js server with TypeScript
  - RESTful API endpoints for payment processing
  - Integration with Worldpay payment API using session tokens
  - Secure handling of payment credentials
  - Detailed payment response formatting

## Getting Started

### Quick Start

Use the setup script to install dependencies and start both servers:
```
./setup.sh
```

### Manual Setup

1. Clone the repository
2. Install all dependencies:
   ```
   npm run install:all
   ```
3. Start both frontend and backend servers:
   ```
   npm start
   ```

### Individual Component Setup

#### Frontend
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

#### Backend
1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Build the TypeScript code:
   ```
   npm run build
   ```
4. Start the server:
   ```
   npm run dev
   ```

## How It Works

1. The Worldpay SDK is loaded dynamically when the checkout component mounts
2. The SDK creates secure iframes for card number, expiry date, and CVV fields
3. When the user clicks "Pay Now", the SDK creates a secure token (session)
4. This token is sent to the backend API along with payment details
5. The backend processes the payment using the Worldpay API
6. The result is returned to the frontend and displayed to the user, including:
   - Transaction ID and authorization code
   - Card details (brand, last 4 digits, expiry)
   - Available payment actions (settle, cancel)

## Configuration

### Frontend
- The checkout is configured with the checkout ID: `de71d389-ac4b-43c5-b632-5a82bdf19eaf`
- To use a different checkout ID, update the value in the `client/.env` file:
  ```
  REACT_APP_WORLDPAY_CHECKOUT_ID=your_checkout_id
  ```
- Other frontend environment variables in `client/.env`:
  ```
  REACT_APP_WORLDPAY_ENVIRONMENT=sandbox  # Change to 'production' for live payments
  REACT_APP_API_URL=http://localhost:4000/api
  ```

### Backend
- Server port and other settings can be configured in the `server/.env` file
- Worldpay API credentials should be set in the `server/.env` file:
  ```
  WORLDPAY_USERNAME=your_worldpay_username
  WORLDPAY_PASSWORD=your_worldpay_password
  ```

## Resources

- [Worldpay Developer Documentation](https://developer.worldpay.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
