@echo off
echo 🏋️ Starting DiscordGym Application...
echo.

echo 📦 Installing dependencies...
cd client
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
cd ..\server
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo 🗄️ Setting up database...
call npx prisma db push --accept-data-loss 2>nul || echo Database already up to date
call npx prisma generate 2>nul || echo Prisma client already generated

cd ..
echo.
echo 🚀 Starting servers...
echo Backend: http://localhost:3000
echo Frontend: Automatic port selection (4200+)
echo 📱 Check terminal output for frontend URL
echo.

start "🏋️ Backend Server" cmd /k "cd server && npm start"
timeout /t 3 /nobreak > nul
start "🌐 Frontend Server" cmd /k "cd client && npm run start:4200"

echo ✅ Servers are starting...
echo ✅ Backend: http://localhost:3000
echo ✅ Frontend: Auto-selected port (check terminal window)
echo.
echo 🛑 Close the terminal windows to stop servers
echo 📖 See START-GUIDE.md for detailed instructions
echo.
echo Press any key to close this window...
pause >nul
