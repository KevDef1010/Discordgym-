@echo off
color 0A
cls
echo.
echo  ███████╗██╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗  ██████╗██╗   ██╗███╗   ███╗
echo  ██╔══██╗██║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝╚██╗ ██╔╝████╗ ████║
echo  ██║  ██║██║███████╗██║     ██║   ██║██████╔╝██║  ██║██║  ███╗╚████╔╝ ██╔████╔██║
echo  ██║  ██║██║╚════██║██║     ██║   ██║██╔══██╗██║  ██║██║   ██║ ╚██╔╝  ██║╚██╔╝██║
echo  ██████╔╝██║███████║╚██████╗╚██████╔╝██║  ██║██████╔╝╚██████╔╝  ██║   ██║ ╚═╝ ██║
echo  ╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝   ╚═╝   ╚═╝     ╚═╝
echo                             QUICK-START MENU
echo.
echo  Select an option:
echo  ------------------------------
echo  1. 🚀 Start Development Server (no password)
echo  2. 🔒 Start Secure Production Server
echo  3. 📊 Open Prisma Studio (database)
echo  4. 🔄 Build Server
echo  5. ❓ Help
echo  6. ❌ Exit
echo.

choice /C 123456 /N /M "Enter your choice (1-6): "

if errorlevel 6 goto EXIT
if errorlevel 5 goto HELP
if errorlevel 4 goto BUILD
if errorlevel 3 goto PRISMA
if errorlevel 2 goto SECURE
if errorlevel 1 goto DEV

:DEV
echo.
echo 🚀 Starting Development Server...
cd server
copy .env.development .env >nul
set NODE_ENV=development
call npm run build && node dist/main.js
goto END

:SECURE
echo.
echo 🔒 Starting Secure Production Server...
cd server
copy .env .env.backup >nul
set NODE_ENV=production
call npm run start:prod
goto END

:PRISMA
echo.
echo 📊 Opening Prisma Studio...
cd server
copy .env.development .env >nul
call npm run db:studio
goto END

:BUILD
echo.
echo 🔄 Building Server...
cd server
call npm run build
echo Done!
pause
goto MENU

:HELP
echo.
echo ❓ Help:
echo  - Development: Starts server without password prompts
echo  - Production: Starts server with security prompts
echo  - Prisma Studio: Open database browser
echo  - Build: Compiles TypeScript to JavaScript
echo.
echo ⚠️ Database Credentials:
echo  - Database Password: Dg$ecure2024!Gym#
echo  - Admin Username: admin
echo  - Admin Password: superadmin2024
echo.
pause
goto MENU

:EXIT
echo.
echo Goodbye! 👋
goto END

:MENU
cls
goto :0

:END
echo.
echo Press any key to exit...
pause >nul
