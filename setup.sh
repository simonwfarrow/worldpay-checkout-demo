#!/bin/bash

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client
npm install
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
npm run build
cd ..

# Start both servers
echo "Starting servers..."
echo "Frontend will be available at http://localhost:3000"
echo "Backend will be available at http://localhost:4000"
echo "Press Ctrl+C to stop both servers"

# Start both servers in parallel
npm start 