# 🚀 DiscordGym - Schnellstart

## Option 1: Automatischer Start (Empfohlen)
```bash
# Im Projektverzeichnis
./start.sh
```
*Das wars! Script macht alles automatisch.*

## Option 2: Manueller Start

### Terminal 1 - Datenbank:
```bash
docker run --name discordgym-mariadb \
  -e MYSQL_ROOT_PASSWORD=discordgym123 \
  -e MYSQL_DATABASE=discordgym \
  -e MYSQL_USER=discordgym \
  -e MYSQL_PASSWORD=discordgym123 \
  -p 3306:3306 \
  -d mariadb:latest
```

### Terminal 2 - Backend:
```bash
cd server

# .env Datei erstellen (falls nicht vorhanden)
cp .env.example .env

# Oder manuell erstellen:
cat > .env << 'EOF'
DATABASE_URL="mysql://discordgym:discordgym123@localhost:3306/discordgym"
JWT_SECRET="DgSecure2024!JWT#Secret$Random%Token&Key*2025"
JWT_REFRESH_SECRET="DgRefresh2024!JWT#Secret$Random%Token&Key*2025"
PORT=3000
NODE_ENV=development
EOF

npm install
npm run start:dev
```

### Terminal 3 - Frontend:
```bash
cd client  
npm start
```

## 🌐 App öffnen:
**http://localhost:4200**

## 🛑 Stoppen:
```bash
# Docker Container stoppen
docker stop discordgym-mariadb
docker rm discordgym-mariadb

# Terminals mit Ctrl+C beenden
```

## ⚡ Noch einfacher - Fertige Scripts:
```bash
./start.sh              # Alles starten
./start-clean.sh         # Clean start
./start-4200.sh          # Nur auf Port 4200
```
