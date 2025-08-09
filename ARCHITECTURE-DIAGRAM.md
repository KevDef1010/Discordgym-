# DiscordGym - Architektur Diagramm

## Standard Setup (Entwicklung)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DEVELOPMENT SETUP                         │
└─────────────────────────────────────────────────────────────────────┘

    CLIENT (Browser)
          │
          │ http://localhost
          ▼
    ┌─────────────────┐
    │   NGINX         │  Container: discordgym-ui
    │   Frontend      │  Port: 80
    │   Angular 20    │  Image: discordgym-discordgym-ui
    └─────────────────┘
          │
          │ API calls → http://localhost:3001
          ▼
    ┌─────────────────┐
    │   NestJS API    │  Container: discordgym-api
    │   Backend       │  Port: 3000 (mapped to 3001)
    │   Node.js 18    │  Image: discordgym-discordgym-api
    └─────────────────┘
          │
          ├─────────────────────┬─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
    │   MariaDB   │      │    Redis    │      │ Prisma      │
    │  Database   │      │   Cache     │      │ Studio      │
    │  Port: 3306 │      │  Port: 6379 │      │ Port: 5555  │
    └─────────────┘      └─────────────┘      └─────────────┘

    Befehle: dstart, dstop, dstatus, dlogs
```

## High-Availability Setup (Produktion)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HIGH-AVAILABILITY SETUP                         │
│                         n+1 Redundanz                              │
└─────────────────────────────────────────────────────────────────────┘

    CLIENT (Browser)
          │
          │ http://localhost
          ▼
    ┌─────────────────┐
    │   NGINX         │  Container: discordgym-ui
    │   Frontend      │  Port: 80
    │   Angular 20    │  Static Files
    └─────────────────┘
          │
          │ API calls → http://localhost:3001
          ▼
    ┌─────────────────┐
    │   NGINX         │  Container: nginx-lb
    │ Load Balancer   │  Port: 3001
    │  least_conn     │  Upstream: 3 backends
    │   Failover      │  Health checks
    └─────────────────┘
          │
          │ Load balanced requests
          ├─────────────────────┬─────────────────────┬─────────────────────┐
          │                     │                     │                     │
          ▼                     ▼                     ▼                     │
    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                │
    │  NestJS #1  │      │  NestJS #2  │      │  NestJS #3  │                │
    │   Backend   │      │   Backend   │      │   Backend   │                │
    │ Port: 3000  │      │ Port: 3000  │      │ Port: 3000  │                │
    │  (Primary)  │      │ (Secondary) │      │  (Backup)   │                │
    └─────────────┘      └─────────────┘      └─────────────┘                │
          │                     │                     │                     │
          └─────────────────────┼─────────────────────┼─────────────────────┘
                                │                     │
                ┌───────────────┼─────────────────────┼───────────────┐
                │               │                     │               │
                ▼               ▼                     ▼               ▼
         ┌─────────────┐ ┌─────────────┐      ┌─────────────┐ ┌─────────────┐
         │   MariaDB   │ │    Redis    │      │ Prisma      │ │   Shared    │
         │  Database   │ │ Shared Cache│      │ Studio      │ │   Network   │
         │  Port: 3306 │ │ Port: 6379  │      │ Port: 5555  │ │             │
         │             │ │ Session     │      │ DB Admin    │ │ Bridge Mode │
         └─────────────┘ │ Storage     │      └─────────────┘ └─────────────┘
                         │ Socket.IO   │
                         │ Adapter     │
                         └─────────────┘

    Befehle: hastart, hastop, hastatus, halogs
    Demo: ./professor-demo.sh (Failover-Test)
```

## Container Details

### Standard Setup (docker-compose.dev.yml)
```
Services: 5 Container
├── discordgym-ui         → Angular Frontend (nginx)
├── discordgym-api        → NestJS Backend (single)
├── db                    → MariaDB Database
├── redis                 → Redis Cache
└── prisma-studio         → Database Admin UI
```

### High-Availability Setup (docker-compose.ha.yml)
```
Services: 8 Container
├── nginx-lb              → NGINX Load Balancer
├── discordgym-ui         → Angular Frontend
├── discordgym-api-1      → NestJS Backend #1 (Primary)
├── discordgym-api-2      → NestJS Backend #2 (Secondary)
├── discordgym-api-3      → NestJS Backend #3 (Backup)
├── db                    → MariaDB Database (shared)
├── redis                 → Redis Cache (shared sessions)
└── prisma-studio         → Database Admin UI
```

## Load Balancer Konfiguration

### NGINX Upstream (nginx/nginx.conf)
```nginx
upstream api_backend {
    # n+1 Failover Setup
    server discordgym-api-1:3000 max_fails=2 fail_timeout=10s;
    server discordgym-api-2:3000 max_fails=2 fail_timeout=10s;
    server discordgym-api-3:3000 max_fails=2 fail_timeout=10s backup;
    
    # Load balancing algorithm
    least_conn;
}
```

### Health Check Logic
- **max_fails=2**: Nach 2 fehlgeschlagenen Versuchen wird Backend als "down" markiert
- **fail_timeout=10s**: Backend wird für 10 Sekunden gesperrt
- **backup**: API-3 wird nur bei Ausfall von API-1/API-2 verwendet
- **least_conn**: Requests gehen an Backend mit wenigsten aktiven Verbindungen

## Professor Demo Ablauf

### Failover-Test Script (professor-demo.sh)
```bash
1. System Status anzeigen      → 3 Backends laufen
2. Load Balancer testen        → API erreichbar
3. Backend-1 "abschießen"      → docker kill discordgym-api-1
4. 5 Sekunden warten           → Failover-Zeit
5. System weiter testen        → API-2 & API-3 übernehmen
6. Final Status anzeigen       → Nur 2 Backends laufen
7. Erfolg bestätigen           → Zero Downtime bewiesen
```

## Netzwerk & Ports

### Standard Setup
- **Frontend**: http://localhost (Port 80)
- **API**: http://localhost:3001
- **Database**: localhost:3307 (MariaDB)
- **Redis**: localhost:6379
- **Prisma Studio**: http://localhost:5556

### High-Availability Setup
- **Frontend**: http://localhost (Port 80) → nginx static
- **API Load Balancer**: http://localhost:3001 → nginx → 3 backends
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:3307 (shared)
- **Redis**: localhost:6379 (shared sessions)
- **Prisma Studio**: http://localhost:5556

## Skalierbarkeit

### Horizontale Skalierung
- **Frontend**: Stateless, kann beliebig skaliert werden
- **Backend**: 3 Instanzen mit shared sessions via Redis
- **Database**: Single Instance mit Connection Pooling
- **Cache**: Redis als zentraler Session Store

### Failover-Strategien
1. **Frontend Failover**: NGINX kann mehrere Frontend-Instanzen load balancen
2. **Backend Failover**: Automatisch via NGINX health checks
3. **Database Failover**: MariaDB Cluster (erweiterbar)
4. **Cache Failover**: Redis Sentinel/Cluster (erweiterbar)

---

**Diese Architektur demonstriert echte Enterprise-Grade High-Availability mit n+1 Redundanz und automatischem Failover für die Professor-Präsentation!**
