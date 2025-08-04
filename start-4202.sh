#!/bin/bash

echo "🚀 Starting DiscordGym on Port 4202..."
echo ""
echo "⚡ Backend wird auf Port 3000 gestartet"
echo "⚡ Frontend wird auf Port 4202 gestartet"
echo ""
echo "🔗 Frontend: http://localhost:4202"
echo "🔗 Backend:  http://localhost:3000"
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start Backend in background
echo "Starting NestJS Backend..."
cd server
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start Frontend (will block)
echo "Starting Angular Frontend on Port 4202..."
cd client
npm run start:4202

# This will only be reached if frontend exits
wait
