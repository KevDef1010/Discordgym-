#!/bin/bash

echo "Starting DiscordGym Full-Stack Application..."
echo

echo "Installing dependencies..."
cd client && npm install
cd ../server && npm install
cd ..

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
