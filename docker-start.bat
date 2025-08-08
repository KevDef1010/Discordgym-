@echo off
echo =================================
echo  DiscordGym Docker Management
echo =================================

REM Check if containers exist
docker-compose -f docker-compose.dev.yml ps -q > nul 2>&1

if %errorlevel% equ 0 (
    echo Checking existing containers...
    for /f %%i in ('docker-compose -f docker-compose.dev.yml ps -q') do (
        if not "%%i"=="" (
            echo Containers found - starting existing containers...
            docker-compose -f docker-compose.dev.yml start
            goto :show_status
        )
    )
)

echo No containers found - building and starting...
docker-compose -f docker-compose.dev.yml up -d --build

:show_status
echo.
echo =================================
echo  Container Status:
echo =================================
docker-compose -f docker-compose.dev.yml ps

echo.
echo =================================
echo  Access URLs:
echo =================================
echo Frontend:      http://localhost:80
echo Backend API:    http://localhost:3001
echo Prisma Studio:  http://localhost:5556
echo.
echo Press any key to continue...
pause > nul
