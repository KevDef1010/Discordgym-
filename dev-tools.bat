@echo off
title DiscordGym Development Tools
color 0B

echo.
echo 🛠️  DiscordGym Development & Tools Menu
echo ======================================
echo.
echo Choose what you want to start:
echo.
echo 1) 🔒 Secure Production Server (with password prompts)
echo 2) 🚀 Development Server (direct start, no prompts)
echo 3) 📊 Prisma Studio (database browser)
echo 4) 🔄 Database Push (sync schema)
echo 5) 🧪 Run Tests
echo 6) 📋 Show Database Status
echo.
set /p choice="Enter your choice (1-6): "

cd /d "%~dp0server"

if "%choice%"=="1" (
    echo.
    echo 🔒 Starting SECURE Production Server...
    echo ⚠️  You will be prompted for credentials!
    call npm run start:prod
) else if "%choice%"=="2" (
    echo.
    echo 🚀 Starting Development Server...
    copy .env.development .env >nul 2>&1
    call npm run start:dev
) else if "%choice%"=="3" (
    echo.
    echo 📊 Opening Prisma Studio...
    copy .env.development .env >nul 2>&1
    call npm run db:studio
) else if "%choice%"=="4" (
    echo.
    echo 🔄 Pushing Database Schema...
    copy .env.development .env >nul 2>&1
    call npm run db:push
) else if "%choice%"=="5" (
    echo.
    echo 🧪 Running Tests...
    copy .env.development .env >nul 2>&1
    call npm test
) else if "%choice%"=="6" (
    echo.
    echo 📋 Database Status:
    copy .env.development .env >nul 2>&1
    call npm run db:studio --help
    echo Database URL configured for development
) else (
    echo ❌ Invalid choice!
    goto :EOF
)

echo.
echo ✅ Operation completed!
pause
