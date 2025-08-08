# 🐳 DiscordGym Docker Setup

Diese Anleitung hilft Ihnen dabei, DiscordGym mit Docker zu starten.

## 📋 Voraussetzungen

- [Docker](https://docs.docker.com/get-docker/) installiert
- [Docker Compose](https://docs.docker.com/compose/install/) installiert
- Git für das Klonen des Repositories

## 🚀 Schnellstart (Development)

### Windows:
```bash
./scripts/start-dev.bat
```

### Linux/Mac:
```bash
./scripts/start-dev.sh
```

## 🔧 Manuelle Einrichtung

### 1. Repository klonen
```bash
git clone <repository-url>
cd DiscordGym
```

### 2. Environment-Dateien anpassen
```bash
# Kopiere und bearbeite die Docker-Environment-Datei
cp .env.docker .env
# Bearbeite .env mit Ihren Werten
```

### 3. Development-Umgebung starten
```bash
# Alle Services bauen und starten
docker-compose -f docker-compose.dev.yml up --build -d

# Database Migrations ausführen
docker-compose -f docker-compose.dev.yml exec discordgym-api npx prisma migrate deploy

# Database seeding (optional)
docker-compose -f docker-compose.dev.yml exec discordgym-api npm run seed
```

## 📊 Services und Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 80 | http://localhost |
| Backend API | 3000 | http://localhost:3000 |
| Database | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |
| Prisma Studio | 5555 | http://localhost:5555 |

## 🔧 Nützliche Kommandos

### Logs anzeigen
```bash
# Alle Services
docker-compose -f docker-compose.dev.yml logs -f

# Nur Backend
docker-compose -f docker-compose.dev.yml logs -f discordgym-api

# Nur Frontend
docker-compose -f docker-compose.dev.yml logs -f discordgym-ui
```

### Services neustarten
```bash
# Alle Services
docker-compose -f docker-compose.dev.yml restart

# Nur Backend
docker-compose -f docker-compose.dev.yml restart discordgym-api
```

### In Container einsteigen
```bash
# Backend Container
docker-compose -f docker-compose.dev.yml exec discordgym-api bash

# Database Container
docker-compose -f docker-compose.dev.yml exec db mysql -u discordgym -p discordgym
```

### Database Operationen
```bash
# Migrations erstellen
docker-compose -f docker-compose.dev.yml exec discordgym-api npx prisma migrate dev

# Prisma Client regenerieren
docker-compose -f docker-compose.dev.yml exec discordgym-api npx prisma generate

# Database zurücksetzen
docker-compose -f docker-compose.dev.yml exec discordgym-api npx prisma migrate reset
```

## 🛑 Services stoppen
```bash
# Alle Services stoppen
docker-compose -f docker-compose.dev.yml down

# Mit Volume-Löschung (Achtung: Daten gehen verloren!)
docker-compose -f docker-compose.dev.yml down -v
```

## 🏭 Production Deployment

Für Production verwenden Sie:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Wichtig:** Bearbeiten Sie vorher `.env.docker` mit Ihren Production-Werten!

## 🐛 Troubleshooting

### Port bereits in Verwendung
```bash
# Prüfen Sie, welche Prozesse die Ports verwenden
netstat -tulpn | grep :3000
# oder
lsof -i :3000

# Stoppen Sie eventuell laufende Services
docker-compose down
```

### Container-Build-Fehler
```bash
# Cache löschen und neu bauen
docker-compose build --no-cache
docker system prune -f
```

### Database-Verbindungsprobleme
```bash
# Prüfen Sie den Database-Container
docker-compose logs db

# Neu starten
docker-compose restart db
```

## 📁 Wichtige Dateien

- `docker-compose.dev.yml` - Development-Konfiguration
- `docker-compose.prod.yml` - Production-Konfiguration
- `client/Dockerfile` - Frontend-Container
- `server/Dockerfile` - Backend-Container
- `.env.docker` - Environment-Variablen
- `scripts/` - Helper-Scripts

## 🔒 Sicherheit

Siehe `DOCKER-SECURITY.md` für detaillierte Sicherheitsrichtlinien.

## 📞 Support

Bei Problemen erstellen Sie ein Issue im Repository oder kontaktieren Sie das Entwicklungsteam.
