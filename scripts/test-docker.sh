#!/bin/bash

echo "🧪 Testing Docker Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

echo "✅ docker-compose is available"

# Test building the services
echo "🏗️ Testing build process..."
docker-compose -f docker-compose.dev.yml build --no-cache discordgym-api

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

docker-compose -f docker-compose.dev.yml build --no-cache discordgym-ui

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "🎉 All builds successful! Ready to start development environment."
echo "Run: ./scripts/start-dev.sh to start the full environment"
