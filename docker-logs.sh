#!/bin/bash

echo "================================="
echo "  DiscordGym Container Logs"
echo "================================="

echo "Select service to view logs:"
echo "1. All services"
echo "2. Frontend (UI)"
echo "3. Backend (API)"
echo "4. Database"
echo "5. Redis"
echo "6. Prisma Studio"
echo ""

read -p "Enter choice (1-6): " choice

case $choice in
    1)
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    2)
        docker-compose -f docker-compose.dev.yml logs -f discordgym-ui
        ;;
    3)
        docker-compose -f docker-compose.dev.yml logs -f discordgym-api
        ;;
    4)
        docker-compose -f docker-compose.dev.yml logs -f db
        ;;
    5)
        docker-compose -f docker-compose.dev.yml logs -f redis
        ;;
    6)
        docker-compose -f docker-compose.dev.yml logs -f prisma-studio
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
