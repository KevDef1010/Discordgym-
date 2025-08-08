#!/bin/bash

echo "🏋️ DiscordGym Test-Setup wird gestartet..."

# 1. Docker MariaDB starten
echo "📦 Starte MariaDB Container..."
docker run --name discordgym-mariadb \
  -e MYSQL_ROOT_PASSWORD=discordgym123 \
  -e MYSQL_DATABASE=discordgym \
  -e MYSQL_USER=discordgym \
  -e MYSQL_PASSWORD=discordgym123 \
  -p 3306:3306 \
  -d mariadb:latest

# Warten bis DB bereit ist
echo "⏳ Warte auf Datenbank..."
sleep 10

# 2. Backend Setup
echo "🔧 Backend Setup..."
cd server

# .env Datei erstellen falls nicht vorhanden
if [ ! -f ".env" ]; then
    echo "📝 Erstelle .env Datei..."
    cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
DATABASE_URL="mysql://discordgym:discordgym123@localhost:3306/discordgym"
JWT_SECRET="DgSecure2024!JWT#Secret$Random%Token&Key*2025"
JWT_REFRESH_SECRET="DgRefresh2024!JWT#Secret$Random%Token&Key*2025"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:4200"
SOCKET_ORIGINS="http://localhost:4200"
EOF
fi

npm install
npx prisma generate
npx prisma db push

# 3. Backend starten (im Hintergrund)
echo "🚀 Starte Backend..."
npm run start:dev &
BACKEND_PID=$!

# 4. Frontend Setup
echo "🎨 Frontend Setup..."
cd ../client
npm install

echo "✅ Setup abgeschlossen!"
echo ""
echo "🌐 Starte jetzt das Frontend mit: npm start"
echo "📱 Öffne dann: http://localhost:4200"
echo ""
echo "🛑 Zum Stoppen: docker stop discordgym-mariadb && kill $BACKEND_PID"
