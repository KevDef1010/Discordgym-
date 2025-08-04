#!/bin/bash

# DiscordGym Team Setup-Script
# Dieses Skript setzt die Entwicklungsumgebung für DiscordGym auf

echo "🚀 DiscordGym Team Setup-Script"
echo "==============================="

# Farbdefinitionen
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Überprüfe Voraussetzungen
echo -e "${BLUE}1. Überprüfe Voraussetzungen...${NC}"

# Node.js überprüfen
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ist installiert: $NODE_VERSION${NC}"
    
    # Überprüfe Mindestversion (v18)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -lt "18" ]; then
        echo -e "${RED}✗ Node.js Version ist zu alt. Bitte installiere v18 oder neuer${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Node.js ist nicht installiert. Bitte installiere Node.js v18 oder neuer${NC}"
    exit 1
fi

# Docker überprüfen
if command -v docker >/dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker ist installiert: $DOCKER_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Docker ist nicht installiert. Für Docker-basierte Entwicklung wird Docker benötigt${NC}"
fi

# Git überprüfen
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓ Git ist installiert: $GIT_VERSION${NC}"
else
    echo -e "${RED}✗ Git ist nicht installiert. Bitte installiere Git${NC}"
    exit 1
fi

# 2. Abhängigkeiten installieren
echo -e "\n${BLUE}2. Installiere Abhängigkeiten...${NC}"

# Server-Abhängigkeiten
echo -e "${BLUE}   Installiere Server-Abhängigkeiten...${NC}"
cd server
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server-Abhängigkeiten erfolgreich installiert${NC}"
else
    echo -e "${RED}✗ Fehler beim Installieren der Server-Abhängigkeiten${NC}"
    exit 1
fi

# Client-Abhängigkeiten
echo -e "${BLUE}   Installiere Client-Abhängigkeiten...${NC}"
cd ../client
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Client-Abhängigkeiten erfolgreich installiert${NC}"
else
    echo -e "${RED}✗ Fehler beim Installieren der Client-Abhängigkeiten${NC}"
    exit 1
fi

cd ..

# 3. Datenbank einrichten
echo -e "\n${BLUE}3. Datenbank einrichten...${NC}"

echo -e "${YELLOW}Möchtest du Docker für die Datenbank verwenden? (y/n)${NC}"
read use_docker

if [[ "$use_docker" =~ ^[Yy]$ ]]; then
    # Docker-Datenbank starten
    echo -e "${BLUE}   Starte MariaDB in Docker...${NC}"
    docker run --name discordgym-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=discordgym -e MYSQL_USER=discordgym -e MYSQL_PASSWORD=discordgym123 -p 3306:3306 -d mariadb:10.11
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ MariaDB-Container erfolgreich gestartet${NC}"
        
        # Warten, bis die Datenbank bereit ist
        echo -e "${BLUE}   Warte, bis die Datenbank bereit ist...${NC}"
        sleep 10
    else
        echo -e "${RED}✗ Fehler beim Starten des MariaDB-Containers${NC}"
        echo -e "${YELLOW}⚠ Überprüfe, ob der Container bereits existiert oder Port 3306 bereits belegt ist${NC}"
        echo -e "${YELLOW}⚠ Du kannst versuchen: docker rm discordgym-db${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Bitte stelle sicher, dass du eine MariaDB/MySQL auf localhost:3306 hast${NC}"
    echo -e "${YELLOW}⚠ Benutzername: discordgym, Passwort: discordgym123, Datenbank: discordgym${NC}"
    
    echo -e "${BLUE}Drücke Enter, wenn deine Datenbank bereit ist...${NC}"
    read
fi

# 4. Prisma Migrationen ausführen
echo -e "\n${BLUE}4. Führe Prisma Migrationen aus...${NC}"

cd server
npx prisma migrate dev --name init
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma-Migration erfolgreich ausgeführt${NC}"
else
    echo -e "${RED}✗ Fehler bei der Prisma-Migration${NC}"
    exit 1
fi

# 5. Seed-Daten einfügen
echo -e "\n${BLUE}5. Füge Seed-Daten ein...${NC}"
npx prisma db seed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Seed-Daten erfolgreich eingefügt${NC}"
else
    echo -e "${RED}✗ Fehler beim Einfügen der Seed-Daten${NC}"
    exit 1
fi

cd ..

# 6. Umgebungsvariablen einrichten
echo -e "\n${BLUE}6. Umgebungsvariablen prüfen...${NC}"

# Server .env prüfen
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓ server/.env existiert bereits${NC}"
else
    echo -e "${BLUE}   Erstelle server/.env...${NC}"
    cat > server/.env << EOL
# Development Environment
NODE_ENV=development
DATABASE_URL="mysql://discordgym:discordgym123@localhost:3306/discordgym"
JWT_SECRET="DgSecure2024!JWT#Secret$Random%Token&Key*2025"
JWT_REFRESH_SECRET="DgRefresh2024!JWT#Secret$Random%Token&Key*2025"

# CORS Settings
CORS_ORIGIN="http://localhost:4200,http://localhost:4201,http://localhost:4202"

# Socket.IO Settings
SOCKET_CORS_ORIGIN="http://localhost:4200,http://localhost:4201,http://localhost:4202"

# Server Port
PORT=3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="uploads"
EOL
    echo -e "${GREEN}✓ server/.env erfolgreich erstellt${NC}"
fi

# 7. Zeige Nutzungshinweise
echo -e "\n${GREEN}✅ DiscordGym-Setup abgeschlossen!${NC}"
echo -e "\n${BLUE}Anwendung starten:${NC}"
echo -e "   ${YELLOW}Option 1:${NC} ./start.sh oder start.bat verwenden"
echo -e "   ${YELLOW}Option 2:${NC} Manuell starten:"
echo -e "      - Terminal 1: ${GREEN}cd server && npm run start:dev${NC}"
echo -e "      - Terminal 2: ${GREEN}cd client && npm run start${NC}"

echo -e "\n${BLUE}Wichtige URLs:${NC}"
echo -e "   ${YELLOW}Frontend:${NC} http://localhost:4201"
echo -e "   ${YELLOW}Backend API:${NC} http://localhost:3000"
echo -e "   ${YELLOW}Prisma Studio:${NC} npx prisma studio (im server-Verzeichnis)"

echo -e "\n${BLUE}Test-Benutzer:${NC}"
echo -e "   ${YELLOW}Admin:${NC} admin@discordgym.com / password123"
echo -e "   ${YELLOW}Normaler Benutzer:${NC} user@discordgym.com / password123"

echo -e "\n${BLUE}Docker-Compose für vollständige Entwicklungsumgebung:${NC}"
echo -e "   ${GREEN}docker-compose -f docker-compose.dev.yml up -d${NC}"

echo -e "\n${GREEN}Viel Spaß beim Entwickeln!${NC}"
