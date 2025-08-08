# DiscordGym 💪

**Fitness-App mit Chat-System - Docker Development Setup**

## 🚀 Voraussetzungen

1. **Docker Desktop** installiert und gestartet
2. **Git** installiert  
3. **VS Code** (empfohlen)

## ⚡ Schnellstart (2 Optionen)

### 🚀 **Standard Setup** (Entwicklung)
```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd DiscordGym

# 2. Standard starten (1 Backend)
docker-aliases.bat    # Windows
source docker-aliases.sh    # Linux/Mac
dstart
```

### ⚖️ **High-Availability Setup** (Produktion)
```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd DiscordGym

# 2. HA starten (2 Backend + Load Balancer)
docker-aliases-ha.bat    # Windows
source docker-aliases-ha.sh    # Linux/Mac
hastart
```

## 📱 Zugriff

**Standard Setup** (`dstart`):
- **🌐 Frontend**: http://localhost
- **⚙️ API**: http://localhost:3001  
- **🗄️ Database Admin**: http://localhost:5556

**High-Availability Setup** (`hastart`):
- **🌐 Frontend**: http://localhost (nginx load balanced)
- **⚙️ API**: http://localhost:3001 (nginx → 2 backends)
- **🗄️ Database Admin**: http://localhost:5556
- **📊 Health Check**: http://localhost:3001/health

## 🎮 VS Code Kurzbefehle

**`Ctrl+Shift+P`** → Tippen Sie:

**Standard Setup:**
- **`dstart`** - Standard-Setup starten
- **`dbuild`** - Neu bauen (bei Problemen)
- **`dstop`** - Standard-Setup stoppen

**High-Availability Setup:**
- **`hastart`** - HA-Setup mit Load Balancer starten
- **`habuild`** - HA-Setup neu bauen
- **`hastop`** - HA-Setup stoppen

## 🔧 Alle Befehle

**📊 Standard Setup (Entwicklung):**
```bash
dstart   # Container starten (1 Backend)
dbuild   # Container neu bauen  
dstop    # Container stoppen
dstatus  # Status anzeigen
dlogs    # Logs anzeigen
```

**⚖️ High-Availability Setup (Produktion):**
```bash
hastart   # HA-Setup starten (2 Backend + Load Balancer)
habuild   # HA-Setup neu bauen  
hastop    # HA-Setup stoppen
hastatus  # HA-Status anzeigen
halogs    # HA-Logs anzeigen
```

## 🏗️ Technologie-Stack

- **Frontend**: Angular 20 + Tailwind CSS
- **Backend**: NestJS + Prisma ORM
- **Database**: MariaDB
- **Cache/Sessions**: Redis
- **Load Balancer**: NGINX (HA-Setup)
- **Container**: Docker + Docker Compose

## 🛡️ Redis Container Features

**Was macht Redis:**
- 🔐 **Session Storage** - Shared Sessions zwischen Backend-Containern
- 💬 **Socket.IO Adapter** - Chat synchronisation zwischen Instanzen  
- ⚡ **Cache Layer** - Performance-Optimierung
- 🔄 **Pub/Sub System** - Real-time Updates

---

**Standard: `dstart` | High-Availability: `hastart`** 🎉
