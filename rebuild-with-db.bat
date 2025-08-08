@echo off
echo 🔄 Rebuilding containers with database initialization...

echo 📋 Stopping existing containers...
docker-compose -f docker-compose.dev.yml stop

echo 🗑️ Removing old containers...
docker-compose -f docker-compose.dev.yml rm -f

echo 🏗️ Building and starting containers...
docker-compose -f docker-compose.dev.yml up -d --build

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 📊 Container Status:
docker-compose -f docker-compose.dev.yml ps

echo ✅ Database initialization completed!
echo 🌐 Frontend: http://localhost
echo ⚙️ API: http://localhost:3001
echo 🗄️ Prisma Studio: http://localhost:5556
