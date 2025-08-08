@echo off
REM Docker Development Setup Script für Windows
REM Startet alle Services für Development

echo 🐳 Starting DiscordGym Development Environment...

REM Stoppe eventuell laufende Container
echo 📦 Stopping existing containers...
docker-compose -f docker-compose.dev.yml down

REM Entferne alte Images (optional)
echo 🧹 Cleaning up old images...
docker image prune -f

REM Baue und starte Services
echo 🏗️ Building and starting services...
docker-compose -f docker-compose.dev.yml up --build -d

REM Warte auf Datenbank
echo ⏳ Waiting for database to be ready...
timeout /t 10

REM Führe Prisma Migrations aus
echo 🗄️ Running database migrations...
docker-compose -f docker-compose.dev.yml exec discordgym-api npx prisma migrate deploy

REM Zeige Service Status
echo 📊 Service Status:
docker-compose -f docker-compose.dev.yml ps

echo ✅ Development environment is ready!
echo 🌐 Frontend: http://localhost
echo 🔌 API: http://localhost:3000
echo 🗄️ Database: localhost:3306
echo 📊 Prisma Studio: http://localhost:5555

pause
