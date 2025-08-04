@echo off
echo 🧹 DiscordGym Cache-Clear ^& Clean Start
echo.

REM Stop all Node processes
echo 🛑 Stopping existing processes...
taskkill /F /IM node.exe 2>nul

REM Clear all caches
echo 🧽 Clearing caches...
rmdir /S /Q client\.angular 2>nul
rmdir /S /Q client\dist 2>nul
rmdir /S /Q server\dist 2>nul
rmdir /S /Q client\node_modules\.cache 2>nul
rmdir /S /Q server\node_modules\.cache 2>nul

echo ✅ Cache cleared
echo.

REM Start backend first
echo 🚀 Starting Backend (Port 3000)...
start "DiscordGym Backend" cmd /k "cd server && npm run start:dev:windows"

REM Wait for backend
echo ⏳ Waiting for backend to start...
timeout /t 8 /nobreak > nul

REM Start frontend clients
echo 🌐 Starting Frontend Port 4201...
start "DiscordGym Client 4201" cmd /k "cd client && npm run start:4201"

timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Port 4202...
start "DiscordGym Client 4202" cmd /k "cd client && npm run start:4202"

echo.
echo ✅ All services starting...
echo 🔗 Backend:    http://localhost:3000
echo 🔗 Frontend 1: http://localhost:4201
echo 🔗 Frontend 2: http://localhost:4202
echo.
echo Press any key to exit this launcher...
pause > nul
