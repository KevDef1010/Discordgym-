# 🌟 DiscordGym - Deployment Guide für Teams

Dieses Dokument bietet eine detaillierte Anleitung zum Aufsetzen und Bereitstellen der DiscordGym-Anwendung im Produktivumfeld. Folge diesen Schritten für eine erfolgreiche Implementierung.

## 📋 Inhaltsverzeichnis

1. [Systemanforderungen](#systemanforderungen)
2. [Lokale Entwicklungsumgebung](#lokale-entwicklungsumgebung)
3. [Produktionsumgebung einrichten](#produktionsumgebung-einrichten)
4. [CI/CD Pipeline](#ci-cd-pipeline)
5. [Monitoring & Wartung](#monitoring-und-wartung)
6. [Troubleshooting](#troubleshooting)
7. [Security Best Practices](#security-best-practices)

## 🖥️ Systemanforderungen {#systemanforderungen}

### Entwicklungsumgebung

- Node.js v18+ (LTS empfohlen)
- npm 8+ oder yarn 1.22+
- MariaDB 10.11+ oder MySQL 8.0+
- Git
- VS Code mit empfohlenen Extensions

### Produktionsumgebung (Option A: Selbst-Hosting)

- Linux-Server (Ubuntu 22.04 LTS empfohlen)
- Docker 24.0+ und Docker Compose v2
- Mindestens 2GB RAM, 2 vCPUs
- 30GB SSD-Speicher
- Domain mit DNS-Zugriff
- Optional: Prometheus/Grafana für Monitoring

### Produktionsumgebung (Option B: Cloud-Services)

- GitHub-Account mit Actions-Zugang
- Vercel/Netlify/Cloudflare Pages Account für Frontend
- Railway/Render/Fly.io Account für Backend
- PlanetScale/Neon/DigitalOcean Account für Datenbank
- Upstash/Redis Labs für Redis
- Domain mit DNS-Zugriff

## 🛠️ Lokale Entwicklungsumgebung {#lokale-entwicklungsumgebung}

### 1. Repository klonen und Abhängigkeiten installieren

```bash
# Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd Discordgym-

# Server-Abhängigkeiten
cd server
npm install

# Client-Abhängigkeiten
cd ../client
npm install
```

### 2. Datenbank einrichten

```bash
# Für lokale MariaDB in Docker
docker run --name discordgym-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=discordgym -e MYSQL_USER=discordgym -e MYSQL_PASSWORD=discordgym123 -p 3306:3306 -d mariadb:10.11

# Im server-Verzeichnis
npx prisma migrate dev
npx prisma db seed
```

### 3. Anwendung starten

```bash
# Schnellstart (Skript verwendet)
cd ..  # Root-Verzeichnis
./start.sh  # oder start.bat unter Windows

# Manuelle Variante
cd server && npm run start:dev
# In einem zweiten Terminal
cd client && npm run start
```

## 🚀 Produktionsumgebung einrichten {#produktionsumgebung-einrichten}

### Option A: Selbst-Hosting mit Docker

#### 1. Server vorbereiten

```bash
# Aktualisiere das System
sudo apt update && sudo apt upgrade -y

# Docker und Docker Compose installieren
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo systemctl enable docker

# Docker Compose installieren
sudo apt install docker-compose-plugin -y
```

#### 2. Netzwerk und Verzeichnisstruktur erstellen

```bash
# Netzwerk für Traefik
docker network create traefik_network

# Verzeichnisse erstellen
mkdir -p /opt/discordgym/{traefik,prometheus,grafana}
mkdir -p /opt/discordgym/uploads
chmod -R 755 /opt/discordgym
```

#### 3. Traefik konfigurieren

Erstelle `/opt/discordgym/traefik/traefik.yml`:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    exposedByDefault: false
  file:
    filename: /etc/traefik/dynamic_conf.yml

api:
  dashboard: true
```

Erstelle `/opt/discordgym/traefik/dynamic_conf.yml`:

```yaml
http:
  middlewares:
    auth:
      basicAuth:
        users:
          - "admin:$apr1$ruca84Hq$mbjdMZBAG.KWn7vfN/SNK/"  # Passwort: changeme
```

#### 4. Umgebungsvariablen für Docker Compose

Erstelle `/opt/discordgym/.env`:

```ini
DB_ROOT_PASSWORD=StrongRootPassword123
DB_USER=discordgym
DB_PASSWORD=StrongDbPassword123
REDIS_PASSWORD=StrongRedisPassword123
GRAFANA_PASSWORD=StrongGrafanaPassword123
```

#### 5. Docker Compose und Deployment

```bash
# Kopiere die docker-compose.prod.yml auf den Server
scp docker-compose.prod.yml user@server:/opt/discordgym/

# Starte die Container
ssh user@server "cd /opt/discordgym && docker-compose -f docker-compose.prod.yml up -d"
```

### Option B: Cloud-Services

#### 1. Frontend (Vercel)

1. Verknüpfe GitHub-Repository mit Vercel
2. Konfiguriere Build-Einstellungen:
   - Framework: Angular
   - Build Command: `cd client && npm ci && npm run build:prod`
   - Output Directory: `client/dist/browser`
   - Environment Variables: (siehe Frontend-Konfiguration)

#### 2. Backend (Railway)

1. Verknüpfe GitHub-Repository mit Railway
2. Konfiguriere Service:
   - Root Directory: `server`
   - Start Command: `npm run start:prod`
   - Environment Variables: (siehe Backend-Konfiguration)
3. Füge Railway Domain zu CORS-Einstellungen hinzu

#### 3. Datenbank (PlanetScale/Neon)

1. Erstelle eine neue Datenbank
2. Importiere Datenbankschema: `npx prisma db push`
3. Setze die Verbindungs-URL im Backend

#### 4. Cache Layer (Upstash Redis)

1. Erstelle Redis-Datenbank bei Upstash
2. Konfiguriere Socket.IO im Backend für Redis-Adapter

## 🔄 CI/CD Pipeline {#ci-cd-pipeline}

### GitHub Actions Workflow

Die vorgefertigte CI/CD-Pipeline in `.github/workflows/ci-cd.yml` bietet:

1. **Automatische Tests** bei Pull Requests und Commits
2. **Automatisches Deployment** bei Merge in den Main-Branch
3. **Konfigurierbare Deployment-Ziele** über GitHub Variables/Secrets

### Einrichtung der GitHub Secrets

Für Option A (Selbst-Hosting):
- `SSH_PRIVATE_KEY`: SSH-Schlüssel für Server-Zugriff
- `SSH_USER`: SSH-Benutzername
- `SERVER_IP`: Server-IP-Adresse

Für Option B (Cloud-Services):
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `RENDER_API_KEY`, `RENDER_SERVICE_ID`

## 📊 Monitoring und Wartung {#monitoring-und-wartung}

### Prometheus & Grafana Setup

Die Docker Compose-Konfiguration enthält bereits ein Prometheus/Grafana-Setup.
Zugriff:
- Prometheus: https://metrics.your-domain.com
- Grafana: https://dashboard.your-domain.com (Standard-Login: admin/[GRAFANA_PASSWORD])

### Wichtige Metriken zu überwachen

- CPU/RAM-Auslastung
- API-Latenzzeiten und Fehlerraten
- Socket.IO-Verbindungen
- Datenbankverbindungen
- JWT-Token-Verwendung

### Backups

```bash
# Datenbank-Backup
docker exec discordgym-db sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" discord_gym_prod' > backup-$(date +%F).sql

# Automatisches tägliches Backup (Cron)
0 1 * * * cd /opt/discordgym/backups && docker exec discordgym-db sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" discord_gym_prod' > backup-$(date +%F).sql && find . -name "backup-*.sql" -type f -mtime +7 -delete
```

## 🔧 Troubleshooting {#troubleshooting}

### Häufige Probleme und Lösungen

1. **Datenbankverbindungsfehler**:
   - Überprüfe die DATABASE_URL in der .env-Datei
   - Stelle sicher, dass spezielle Zeichen URL-kodiert sind

2. **Socket.IO-Verbindungsprobleme**:
   - Überprüfe CORS-Einstellungen
   - Stelle sicher, dass das Frontend die korrekte Socket.IO-URL verwendet

3. **JWT-Token-Probleme**:
   - Überprüfe, ob die JWT_SECRET-Umgebungsvariable korrekt gesetzt ist
   - Stelle sicher, dass Token-Ablaufzeiten korrekt sind

4. **Container startet nicht**:
   - Überprüfe Logs mit `docker logs container_name`
   - Stelle sicher, dass alle Abhängigkeiten verfügbar sind

## 🔒 Security Best Practices {#security-best-practices}

### Umgebungsschutz

1. **Produktionsumgebungsvariablen**:
   - Verwende niemals Entwicklungswerte in Produktion
   - Verwende einen Password Manager für sichere Passworterstellung

2. **Datenbankzugriff**:
   - Beschränke Datenbankzugriff auf interne Netzwerke
   - Verwende minimale Berechtigungen für DB-Benutzer

3. **API-Sicherheit**:
   - Implementiere Rate Limiting
   - Verwende helmet.js für sichere HTTP-Header

4. **Frontend-Sicherheit**:
   - Implementiere CSP (Content Security Policy)
   - Verwende HTTPOnly-Cookies für Token-Speicherung

5. **Regelmäßige Updates**:
   - Aktualisiere regelmäßig alle NPM-Pakete
   - Führe regelmäßige `npm audit` und `docker scan` durch

### Zertifikatsmanagement

Let's Encrypt-Zertifikate werden automatisch von Traefik erneuert. Überprüfe den Status mit:

```bash
docker exec traefik traefik-certs-dumper -version
```

## 📞 Support und Weiterentwicklung

Bei Fragen oder Problemen bei der Implementierung, wende dich an:
- GitHub Issues: [https://github.com/KevDef1010/Discordgym-/issues](https://github.com/KevDef1010/Discordgym-/issues)
- Dokumentation: Sieh dir die anderen Markdown-Dateien im Projektverzeichnis an

---

Erstellt am: 04.08.2025 | Letzte Aktualisierung: 04.08.2025
