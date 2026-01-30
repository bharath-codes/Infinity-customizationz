#!/usr/bin/env sh
set -e

echo "🔧 Building frontend..."
cd frontend
npm ci --silent
npm run build
cd ..

echo "🔧 Installing backend dependencies..."
cd backend
npm ci --silent

echo "🚀 Starting backend..."
# Use npm start which runs `node server.js`
npm start
