@echo off
echo ===================================
echo  DiscordGym - Entwicklungsserver
echo ===================================

:: Zum Server-Verzeichnis wechseln
cd "%~dp0server"

:: Direkt mit korrekten Umgebungsvariablen starten
set NODE_ENV=development

echo.
echo Starte Server...
echo.

:: NODE_ENV auf development setzen und Anwendung starten
node -e "process.env.NODE_ENV='development'; require('./dist/main.js')"

pause
