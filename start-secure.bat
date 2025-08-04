@echo off
title DiscordGym Secure Server
color 0A

echo.
echo  ██████╗ ██╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗  ██████╗██╗   ██╗███╗   ███╗
echo  ██╔══██╗██║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝╚██╗ ██╔╝████╗ ████║
echo  ██║  ██║██║███████╗██║     ██║   ██║██████╔╝██║  ██║██║  ███╗╚████╔╝ ██╔████╔██║
echo  ██║  ██║██║╚════██║██║     ██║   ██║██╔══██╗██║  ██║██║   ██║ ╚██╔╝  ██║╚██╔╝██║
echo  ██████╔╝██║███████║╚██████╗╚██████╔╝██║  ██║██████╔╝╚██████╔╝  ██║   ██║ ╚═╝ ██║
echo  ╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝   ╚═╝   ╚═╝     ╚═╝
echo.
echo                              🔒 SECURE SERVER STARTUP 🔒
echo.

cd /d "%~dp0server"

echo 🔧 Installing dependencies if needed...
call npm install --silent

echo.
echo 🏗️  Building application...
call npm run build

echo.
echo 🚀 Starting secure server...
echo ⚠️  You will be prompted for:
echo    1. Database Password
echo    2. Admin Authentication
echo.

call npm run start:prod

pause
