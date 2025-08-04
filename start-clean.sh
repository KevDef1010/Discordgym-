#!/bin/bash

echo "🧹 DiscordGym Cache-Clear & Clean Start"
echo ""

# Stop all Node processes
echo "🛑 Stopping existing processes..."
taskkill //F //IM node.exe 2>/dev/null || true

# Clear all caches
echo "🧽 Clearing caches..."
rm -rf client/.angular 2>/dev/null || true
rm -rf client/dist 2>/dev/null || true
rm -rf server/dist 2>/dev/null || true
rm -rf client/node_modules/.cache 2>/dev/null || true
rm -rf server/node_modules/.cache 2>/dev/null || true

echo "✅ Cache cleared"
echo ""

# Start backend first
echo "🚀 Starting Backend (Port 3000)..."
cd server
npm run start:dev:windows &
BACKEND_PID=$!
cd ..

# Wait for backend
echo "⏳ Waiting for backend to start..."
sleep 8

# Start frontend clients sequentially
echo "🌐 Starting Frontend Port 4201..."
cd client
npm run start:4201 &
CLIENT1_PID=$!
cd ..

sleep 3

echo "🌐 Starting Frontend Port 4202..."
cd client
npm run start:4202 &
CLIENT2_PID=$!
cd ..

echo ""
echo "✅ All services starting..."
echo "🔗 Backend:    http://localhost:3000"
echo "🔗 Frontend 1: http://localhost:4201"
echo "🔗 Frontend 2: http://localhost:4202"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping all services..."; kill $BACKEND_PID $CLIENT1_PID $CLIENT2_PID 2>/dev/null; wait; echo "✅ All services stopped"; exit' SIGINT SIGTERM

wait
