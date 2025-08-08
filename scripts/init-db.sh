#!/bin/bash

# Database initialization script for Docker
# Führt Migrations und Seeding für Docker-Container aus

echo "🗄️ Initializing DiscordGym Database..."

# Warte bis Datenbank verfügbar ist
echo "⏳ Waiting for database connection..."
until docker-compose exec db mysql -u discordgym -pdiscordgym123 -e "SELECT 1" discordgym &> /dev/null; do
    echo "Database not ready, waiting..."
    sleep 2
done

echo "✅ Database connection established!"

# Führe Prisma Migrations aus
echo "📋 Running Prisma migrations..."
docker-compose exec discordgym-api npx prisma migrate deploy

# Generiere Prisma Client
echo "🔧 Generating Prisma client..."
docker-compose exec discordgym-api npx prisma generate

# Führe Seeding aus (optional)
echo "🌱 Seeding database with initial data..."
docker-compose exec discordgym-api npm run seed

echo "✅ Database initialization complete!"
