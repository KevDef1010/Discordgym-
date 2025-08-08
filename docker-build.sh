#!/bin/bash

echo "================================="
echo "  Building DiscordGym Containers"
echo "================================="

echo "Building all containers from scratch..."
docker-compose -f docker-compose.dev.yml build --no-cache

echo ""
echo "Starting containers..."
docker-compose -f docker-compose.dev.yml up -d

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
