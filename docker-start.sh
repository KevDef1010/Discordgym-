#!/bin/bash

echo "================================="
echo "  DiscordGym Docker Management"
echo "================================="

# Check if containers exist
containers=$(docker-compose -f docker-compose.dev.yml ps -q 2>/dev/null)

if [ ! -z "$containers" ]; then
    echo "Containers found - starting existing containers..."
    docker-compose -f docker-compose.dev.yml start
else
    echo "No containers found - building and starting..."
    docker-compose -f docker-compose.dev.yml up -d --build
fi

echo ""
echo "================================="
echo "  Container Status:"
echo "================================="
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "================================="
echo "  Access URLs:"
echo "================================="
echo "Frontend:      http://localhost:80"
echo "Backend API:    http://localhost:3001"
echo "Prisma Studio:  http://localhost:5556"
echo ""
