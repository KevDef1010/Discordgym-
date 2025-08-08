@echo off
echo =================================
echo  Stopping DiscordGym Containers
echo =================================

docker-compose -f docker-compose.dev.yml stop

echo.
echo Containers stopped.
echo.
echo To start again: docker-start.bat
echo To rebuild:     docker-build.bat
echo.
pause
