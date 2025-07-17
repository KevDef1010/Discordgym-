@echo off
echo Starting DiscordGym Full-Stack Application...
echo.

echo Installing dependencies...
cd client
call npm install
cd ..\server
call npm install
cd ..

echo.
echo Starting Frontend and Backend...
start "Angular Frontend" cmd /k "cd client && npm start"
start "NestJS Backend" cmd /k "cd server && npm run start:dev"

echo.
echo Applications starting...
echo Frontend: http://localhost:4200/
echo Backend:  http://localhost:3000/
echo.
echo Press any key to close this window...
pause >nul
