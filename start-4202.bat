@echo off
echo 🚀 Starting DiscordGym on Port 4202...
echo.
echo ⚡ Backend wird auf Port 3000 gestartet
echo ⚡ Frontend wird auf Port 4202 gestartet  
echo.
echo 🔗 Frontend: http://localhost:4202
echo 🔗 Backend:  http://localhost:3000
echo.

REM Start Backend in separate window
start "DiscordGym Backend" cmd /k "cd server && npm run start:dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend in current window
cd client
echo Starting Angular on Port 4202...
npm run start:4202

pause
