@echo off
echo =================================
echo  DiscordGym Container Logs
echo =================================

echo Select service to view logs:
echo 1. All services
echo 2. Frontend (UI)
echo 3. Backend (API)
echo 4. Database
echo 5. Redis
echo 6. Prisma Studio
echo.

set /p choice="Enter choice (1-6): "

if "%choice%"=="1" (
    docker-compose -f docker-compose.dev.yml logs -f
) else if "%choice%"=="2" (
    docker-compose -f docker-compose.dev.yml logs -f discordgym-ui
) else if "%choice%"=="3" (
    docker-compose -f docker-compose.dev.yml logs -f discordgym-api
) else if "%choice%"=="4" (
    docker-compose -f docker-compose.dev.yml logs -f db
) else if "%choice%"=="5" (
    docker-compose -f docker-compose.dev.yml logs -f redis
) else if "%choice%"=="6" (
    docker-compose -f docker-compose.dev.yml logs -f prisma-studio
) else (
    echo Invalid choice
    pause
)
