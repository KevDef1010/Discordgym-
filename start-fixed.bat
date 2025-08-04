@echo off
echo ==============================================
echo   DiscordGym - Sichere Entwicklungsumgebung
echo ==============================================

cd "%~dp0server"

echo 1. Korrigiere Datenbankverbindungsstring...
node fix-connection.js

echo.
echo 2. Starte Server mit NODE_ENV=development...
set NODE_ENV=development
node dist/main.js

pause
