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

### High-Availability Setup (Produktion) - Komplette Anleitung
```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd DiscordGym

# 2. Alle anderen Docker Container stoppen (wichtig!)
docker stop $(docker ps -q)  # Stoppt alle laufenden Container
# oder manuell: docker-compose -f docker-compose.dev.yml down

# 3. HA starten (3 Backend + Load Balancer)
docker-aliases-ha.bat    # Windows
source docker-aliases-ha.sh    # Linux/Mac
hastart

# Alternative: Direkter Start ohne Aliases
docker-compose -f docker-compose.ha.yml up -d
```

**Was passiert beim HA-Start:**
- 🚀 **3 Backend-Instanzen** werden gestartet (`discordgym-api-1`, `discordgym-api-2`, `discordgym-api-3`)
- ⚖️ **NGINX Load Balancer** verteilt Traffic automatisch
- 🗄️ **MariaDB Datenbank** mit persistentem Storage
- 🔄 **Redis Cache** für geteilte Sessions
- 🖥️ **Angular Frontend** über NGINX
- 📊 **Prisma Studio** für Database Management

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

**🔍 HA-System testen:**
```bash
# Status aller Container prüfen
docker-compose -f docker-compose.ha.yml ps

# Sollte zeigen:
# - nginx-lb (Load Balancer)
# - discordgym-api-1, discordgym-api-2, discordgym-api-3 (Backend Instanzen)
# - db (MariaDB)
# - redis (Cache)
# - discordgym-ui (Frontend)
# - prisma-studio (DB Admin)

# API Gesundheit testen
curl http://localhost:3001/health
# Sollte zurückgeben: {"status":"OK","database":"Connected",...}

# Frontend testen
curl http://localhost
# Sollte HTML der Angular App zurückgeben
```

**🚨 Failover-Test (Ausfallsicherheit demonstrieren):**
```bash
# Schritt 1: Einen Backend-Container "abschießen"
docker stop discordgym-discordgym-api-1-1

# Schritt 2: Prüfen ob System noch funktioniert
curl http://localhost:3001/health
# ✅ Sollte immer noch "OK" zurückgeben!

# Schritt 3: Status prüfen - nur 2 von 3 Backends laufen
docker-compose -f docker-compose.ha.yml ps

# Schritt 4: Ausgefallenen Container wieder starten
docker-compose -f docker-compose.ha.yml up -d discordgym-api-1

# Schritt 5: Bestätigen - alle 3 Backends laufen wieder
docker-compose -f docker-compose.ha.yml ps
```

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

# Manuelle HA-Befehle (ohne Aliases):
docker-compose -f docker-compose.ha.yml up -d        # HA starten
docker-compose -f docker-compose.ha.yml ps           # Status anzeigen
docker-compose -f docker-compose.ha.yml logs -f      # Logs verfolgen
docker-compose -f docker-compose.ha.yml down         # HA stoppen
```

**🔧 HA-Troubleshooting:**
```bash
# Problem: Port-Konflikte
# Lösung: Zuerst dev-Version stoppen
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.ha.yml up -d

# Problem: Container starten nicht
# Lösung: System aufräumen und neu bauen
docker-compose -f docker-compose.ha.yml down
docker system prune -f
docker-compose -f docker-compose.ha.yml up -d --build

# Problem: Load Balancer erreicht Backend nicht
# Lösung: Health Checks prüfen
docker-compose -f docker-compose.ha.yml logs nginx-lb
docker-compose -f docker-compose.ha.yml logs discordgym-api-1
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
- n+1 Failover-Redundanz (3 Backend-Instanzen)
- Load Balancing mit NGINX (Least Connections)
- Production-ready Container Orchestration
- Zero-Downtime bei Backend-Ausfällen
- Automatische Health Checks und Recovery

**💡 Perfekt für:**
- Professor-Demonstrationen
- Production-ähnliche Tests
- Load-Testing mit mehreren Benutzern
- Failover-Demonstrationen
- Enterprise-Architektur-Showcase

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

# Manueller Failover-Test:
# 1. HA-System starten
docker-compose -f docker-compose.ha.yml up -d

# 2. Status vor Test prüfen (sollte 3 API-Instanzen zeigen)
docker-compose -f docker-compose.ha.yml ps

# 3. API-1 "abschießen" (simuliert Server-Ausfall)
docker stop discordgym-discordgym-api-1-1

# 4. System funktioniert weiter testen
curl http://localhost:3001/health
# ✅ Sollte immer noch {"status":"OK"} zurückgeben

# 5. Status nach Ausfall prüfen (nur 2 von 3 APIs laufen)
docker-compose -f docker-compose.ha.yml ps

# 6. Ausgefallene API wieder starten (simuliert automatische Recovery)
docker-compose -f docker-compose.ha.yml up -d discordgym-api-1

# 7. Vollständige Wiederherstellung bestätigen
docker-compose -f docker-compose.ha.yml ps
# ✅ Alle 3 APIs sollten wieder "Up" sein

# Zeigt:
# ✅ Zero-Downtime trotz Ausfall einer Backend-Instanz
# ✅ Automatisches Load Balancing auf verbleibende Instanzen
# ✅ Nahtlose Wiederherstellung ohne Serviceunterbrechung
# ✅ Enterprise-Grade Hochverfügbarkeit
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

## 🚀 High Availability (HA) - Komplettübersicht

### 🏗️ HA-Architektur im Detail

**Container-Setup (8 Container total):**
- **nginx-lb**: Load Balancer (Ports 80, 3001)
- **discordgym-api-1**: Backend Instanz 1 (Port 3000 intern)
- **discordgym-api-2**: Backend Instanz 2 (Port 3000 intern) 
- **discordgym-api-3**: Backend Instanz 3 (Port 3000 intern)
- **db**: MariaDB Database (Port 3307)
- **redis**: Cache & Session Store (Port 6379)
- **discordgym-ui**: Angular Frontend (Port 80 intern)
- **prisma-studio**: DB Admin Interface (Port 5556)

### 📋 HA-Checkliste für Anfänger

**Schritt 1: Vorbereitung**
```bash
# Alle anderen Docker Container stoppen
docker stop $(docker ps -q)
docker system prune -f
```

**Schritt 2: HA-System starten**
```bash
# Repository-Root-Verzeichnis
cd DiscordGym

# HA-System starten
docker-compose -f docker-compose.ha.yml up -d
```

**Schritt 3: Erfolgskontrolle**
```bash
# Alle 8 Container sollten "Up" sein
docker-compose -f docker-compose.ha.yml ps

# API sollte antworten
curl http://localhost:3001/health

# Frontend sollte erreichbar sein
curl http://localhost
```

**Schritt 4: Failover-Test**
```bash
# Einen Backend-Container stoppen
docker stop discordgym-discordgym-api-1-1

# API sollte immer noch antworten
curl http://localhost:3001/health

# Container wieder starten
docker-compose -f docker-compose.ha.yml up -d discordgym-api-1
```

### 🎯 Was macht das HA-System besonders?

- **Zero-Downtime**: Service läuft weiter, auch wenn 1-2 Backend-Instanzen ausfallen
- **Automatic Load Balancing**: NGINX verteilt Traffic gleichmäßig auf alle verfügbaren Backends
- **Health Monitoring**: Ausgefallene Instanzen werden automatisch aus dem Load Balancer entfernt
- **Session Sharing**: Redis teilt Sessions zwischen allen Backend-Instanzen
- **Real-time Chat**: Socket.IO funktioniert über alle Instanzen hinweg
- **Enterprise-Ready**: Production-grade Setup mit Monitoring und Logging

### 🔧 HA-Befehle Übersicht

```bash
# HA starten
docker-compose -f docker-compose.ha.yml up -d

# Status prüfen (sollte 8 Container zeigen)
docker-compose -f docker-compose.ha.yml ps

# Logs verfolgen
docker-compose -f docker-compose.ha.yml logs -f

# Health Check
curl http://localhost:3001/health

# Spezifische Container-Logs
docker-compose -f docker-compose.ha.yml logs nginx-lb
docker-compose -f docker-compose.ha.yml logs discordgym-api-1

# HA stoppen
docker-compose -f docker-compose.ha.yml down

# Komplett neu bauen
docker-compose -f docker-compose.ha.yml down
docker system prune -f
docker-compose -f docker-compose.ha.yml up -d --build
```

---

**Standard: `dstart` | High-Availability: `hastart` | Entwicklung: Frontend separat**
