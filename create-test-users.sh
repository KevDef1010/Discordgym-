#!/bin/bash

# DiscordGym Quick Test User Script

echo "🏋️‍♂️ DiscordGym Test User Generator"
echo "=================================="

# Server Status prüfen
echo "📡 Checking server status..."
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$SERVER_STATUS" != "200" ]; then
    echo "❌ Server not running! Start with: npm start"
    exit 1
fi

echo "✅ Server is running!"

# Aktuelle Stats zeigen
echo ""
echo "📊 Current database stats:"
curl -s http://localhost:3000/database/stats | jq '.data'

echo ""
echo "🧹 Clearing existing data..."
curl -s -X DELETE http://localhost:3000/database/clear

echo ""
echo "🌱 Creating fresh test users..."
RESULT=$(curl -s -X POST http://localhost:3000/database/seed-simple)

echo ""
echo "✅ Test users created successfully!"
echo ""

# User-Liste anzeigen
echo "👥 Created users:"
echo "$RESULT" | jq '.data.users[] | {username: .username, email: .email, discordId: .discordId}'

echo ""
echo "📋 Quick access URLs:"
echo "- All users: http://localhost:3000/users"
echo "- Database stats: http://localhost:3000/database/stats"
echo "- Prisma Studio: npx prisma studio (http://localhost:5555)"

echo ""
echo "🎉 Ready to test! Use the user IDs above for API calls."
