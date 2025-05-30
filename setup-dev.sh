#!/bin/bash

echo "Setting up GitHub Secrets Manager for local development..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
mkdir -p data

# Build backend
echo "Building backend..."
npm run build

# Initialize database
echo "Initializing database..."
npm run init-db

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. In one terminal, start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "The application will be available at http://localhost:3000"