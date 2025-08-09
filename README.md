# DiscordGym

**Fitness-App mit Chat-System - Docker Development Setup**

## Voraussetzungen

1. **Docker Desktop** installiert und gestartet
2. **Git** installiert  
3. **VS Code** (empfohlen)

## Schnellstart (4 Optionen)

### Quick Demo (Professor/Linux)
```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd DiscordGym

# 2. One-Command Demo
./discord-gym.sh demo     # Komplettes HA-Setup + Tests
# oder: make demo
```

### Development Mode (Frontend separat)
```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd DiscordGym

# 2. Backend über Docker starten
docker-compose -f docker-compose.dev.yml up -d

# 3. Frontend separat starten (für Entwicklung)
cd client
npm install
npm run start

# Zugriff: http://localhost:4200 (Frontend mit Hot Reload)
# API: http://localhost:3001 (Backend über Docker)
```

### Standard Setup (Container-basierte Entwicklung)
```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd DiscordGym

# 2. Standard starten (1 Backend)
docker-aliases.bat    # Windows
source docker-aliases.sh    # Linux/Mac
dstart
```

### High-Availability Setup (Produktion)
```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd DiscordGym

# 2. HA starten (3 Backend + Load Balancer)
docker-aliases-ha.bat    # Windows
source docker-aliases-ha.sh    # Linux/Mac
hastart
```

## Zugriff

**Development Mode** (Frontend separat):
- **Frontend**: http://localhost:4200 (Angular Dev Server mit Hot Reload)
- **API**: http://localhost:3001 (Backend über Docker)
- **Database Admin**: http://localhost:5556

**Standard Setup** (`dstart`):
- **Frontend**: http://localhost (nginx container)
- **API**: http://localhost:3001  
- **Database Admin**: http://localhost:5556

**High-Availability Setup** (`hastart`):
- **Frontend**: http://localhost (nginx load balanced)
- **API**: http://localhost:3001 (nginx load balancer zu 3 backends)
- **Database Admin**: http://localhost:5556
- **Health Check**: http://localhost:3001/health

## VS Code Kurzbefehle

**`Ctrl+Shift+P`** → Tippen Sie:

**Standard Setup:**
- **`dstart`** - Standard-Setup starten
- **`dbuild`** - Neu bauen (bei Problemen)
- **`dstop`** - Standard-Setup stoppen

**High-Availability Setup:**
- **`hastart`** - HA-Setup mit Load Balancer starten
- **`habuild`** - HA-Setup neu bauen
- **`hastop`** - HA-Setup stoppen

## Alle Befehle

**Quick Commands (Linux/Professor):**
```bash
./discord-gym.sh demo     # Complete demo setup
./discord-gym.sh status   # Show system status
./discord-gym.sh kill-api # Test failover
./discord-gym.sh clean    # Stop and cleanup
make demo                 # Alternative: Makefile commands
```

**Standard Setup (Entwicklung):**
```bash
dstart   # Container starten (1 Backend)
dbuild   # Container neu bauen  
dstop    # Container stoppen
dstatus  # Status anzeigen
dlogs    # Logs anzeigen
```

**High-Availability Setup (Produktion):**
```bash
hastart   # HA-Setup starten (3 Backend + Load Balancer)
habuild   # HA-Setup neu bauen  
hastop    # HA-Setup stoppen
hastatus  # HA-Status anzeigen
halogs    # HA-Logs anzeigen
```

## Development vs. Production

### Development Mode (für Frontend-Entwicklung)
**Wann verwenden:** Active Frontend-Entwicklung mit Hot Reload
```bash
# Backend über Docker
docker-compose -f docker-compose.dev.yml up -d

# Frontend separat (neues Terminal)
cd client
npm run start
```
**Vorteile:**
- Hot Reload bei Frontend-Änderungen
- Direktes Debugging im Browser
- Schnelle Iteration für UI-Entwicklung
- Separate Logs für Frontend und Backend

### Container-based Development (für Full-Stack)
**Wann verwenden:** Testing, Integration, Feature-Entwicklung
```bash
dstart    # Alles in Containern
```
**Vorteile:**
- Produktionsähnliche Umgebung
- Einfache Setup für neue Entwickler
- Konsistente Environment über Teams

### Production Mode (für Demos und Deployment)
**Wann verwenden:** Professor-Demo, Production-Testing, HA-Tests
```bash
hastart   # High-Availability mit Load Balancer
```
**Vorteile:**
- Enterprise-Grade Setup
- n+1 Failover-Redundanz
- Load Balancing mit NGINX
- Production-ready Container Orchestration

## Professor Demo

**One-Command Demo (Linux):**
```bash
./discord-gym.sh demo     # Complete setup + n+1 failover test
```

**Available Commands:**
```bash
./discord-gym.sh demo     # Complete demo setup
./discord-gym.sh status   # Check system status  
./discord-gym.sh kill-api # Kill one API (test failover)
./discord-gym.sh test     # Test all components
./discord-gym.sh clean    # Stop and cleanup
./discord-gym.sh help     # Show all commands

# Alternative: Makefile
make demo                 # Same as ./discord-gym.sh demo
make status               # Same as ./discord-gym.sh status
```

**Failover-Test für n+1 Backend-Redundanz:**
```bash
# Professor-Demo Script ausführen
./professor-demo.sh      # Linux/Mac
professor-demo.bat       # Windows

# Zeigt:
# 1. System-Status vor Test (3 Backends)
# 2. Backend-1 wird "abgeschossen"
# 3. System funktioniert weiter (Backend-2 & 3 übernehmen)
# 4. Automatisches Failover ohne Downtime
```

## Technologie-Stack

- **Frontend**: Angular 20 + Tailwind CSS
- **Backend**: NestJS + Prisma ORM
- **Database**: MariaDB
- **Cache/Sessions**: Redis
- **Load Balancer**: NGINX (HA-Setup)
- **Container**: Docker + Docker Compose

## Redis Container Features

**Was macht Redis:**
- **Session Storage** - Shared Sessions zwischen Backend-Containern
- **Socket.IO Adapter** - Chat synchronisation zwischen Instanzen  
- **Cache Layer** - Performance-Optimierung
- **Pub/Sub System** - Real-time Updates

## Architecture

**Standard Setup (Development):**
```
Client → Frontend Container → Backend Container → Database
                                     ↓
                              Redis Container
```

**High-Availability Setup (Production):**
```
Client → NGINX Load Balancer → Backend Container 1 → Database
                            → Backend Container 2 → Database  
                            → Backend Container 3 → Database
                                     ↓
                              Redis Container (shared sessions)
```

## Troubleshooting

**Container starten nicht:**
```bash
docker system prune -f    # Cleanup
dbuild                     # Neu bauen
```

**Database Verbindung fehlt:**
```bash
dstop
dstart    # Database wird automatisch initialisiert
```

**Port bereits belegt:**
```bash
# Prüfen welcher Prozess den Port verwendet
netstat -ano | findstr :3001    # Windows
lsof -i :3001                   # Linux/Mac
```

---

**Standard: `dstart` | High-Availability: `hastart`**
