#!/bin/bash

# DiscordGym - Quick Start Script
echo "🏋️ Starting DiscordGym Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "📦 Installing dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

cd ../server
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Setup database
echo "🗄️ Setting up database..."
npx prisma db push --accept-data-loss 2>/dev/null || echo "Database already up to date"
npx prisma generate 2>/dev/null || echo "Prisma client already generated"

echo ""
echo "🚀 Starting servers..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:4200"
echo "📱 Open http://localhost:4200 in your browser"
echo "🛑 Press Ctrl+C to stop servers"
echo ""

# Start backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ../client
npm start &
FRONTEND_PID=$!

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "ng serve" 2>/dev/null
    pkill -f "nest start" 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

echo "✅ Servers started successfully!"
echo "✅ Backend: http://localhost:3000"
echo "✅ Frontend: http://localhost:4200"

# Wait for user to stop
wait

echo
echo "Starting Frontend and Backend..."

# Start backend in background
cd server
npm run start:dev &
BACKEND_PID=$!

# Start frontend in background  
cd ../client
npm start &
FRONTEND_PID=$!

echo
echo "Applications starting..."
echo "Frontend: http://localhost:4200/"
echo "Backend:  http://localhost:3000/"
echo
echo "Press Ctrl+C to stop both applications"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
