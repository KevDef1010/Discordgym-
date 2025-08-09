# DiscordGym auf Mac starten

## Voraussetzungen

1. **Docker Desktop für Mac installieren**
   ```bash
   # Mit Homebrew
   brew install --cask docker
   
   # Oder von der offiziellen Website herunterladen:
   # https://www.docker.com/products/docker-desktop/
   ```

2. **Git installieren** (falls nicht vorhanden)
   ```bash
   brew install git
   ```

## Setup und Start

1. **Repository klonen**
   ```bash
   git clone https://github.com/KevDef1010/Discordgym-.git
   cd Discordgym-
   ```

2. **Docker Desktop starten**
   - Docker Desktop aus dem Applications-Ordner starten
   - Warten bis Docker läuft (grünes Symbol in der Menüleiste)

3. **Anwendung starten**
   ```bash
   # Alle Container starten
   docker-compose -f docker-compose.dev.yml up -d
   
   # Oder mit den bereitgestellten Skripten:
   chmod +x *.sh
   ./docker-start.sh
   ```

4. **Status überprüfen**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

## Zugriff auf die Anwendung

- **Frontend**: http://localhost
- **API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5556
- **MariaDB**: localhost:3307

## Nützliche Befehle für Mac

### Container Management
```bash
# Container stoppen
docker-compose -f docker-compose.dev.yml stop

# Container neu bauen
docker-compose -f docker-compose.dev.yml build

# Container neu starten
docker-compose -f docker-compose.dev.yml restart

# Logs anzeigen
docker-compose -f docker-compose.dev.yml logs -f

# Spezifische Service-Logs
docker-compose -f docker-compose.dev.yml logs -f discordgym-api
```

### Entwicklung
```bash
# In einen Container einsteigen
docker-compose -f docker-compose.dev.yml exec discordgym-api sh

# Datenbank zurücksetzen
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Troubleshooting auf Mac

1. **Port-Konflikte prüfen**
   ```bash
   lsof -i :80
   lsof -i :3001
   lsof -i :3307
   ```

2. **Docker-Speicher freigeben**
   ```bash
   docker system prune -a
   docker volume prune
   ```

3. **Permissions-Probleme beheben**
   ```bash
   sudo chown -R $(whoami) ./
   ```

## Mac-spezifische Anpassungen

### 1. Shell-Skripte ausführbar machen
```bash
chmod +x *.sh
chmod +x scripts/*.sh
```

### 2. Umgebungsvariablen setzen (falls nötig)
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 3. Performance-Optimierung für Mac
In der `docker-compose.dev.yml` können Sie folgende Volume-Optimierungen hinzufügen:

```yaml
volumes:
  - ./client:/app:delegated  # Statt ./client:/app
  - ./server:/app:delegated  # Statt ./server:/app
```

## Entwicklungsumgebung einrichten

1. **Node.js installieren** (für lokale Entwicklung)
   ```bash
   brew install node@20
   ```

2. **VS Code Extensions** (empfohlen)
   - Docker
   - Angular Language Service
   - TypeScript
   - ESLint
   - Prettier

## Quick Start Befehl für Mac

```bash
# Alles in einem Befehl
git clone https://github.com/KevDef1010/Discordgym-.git && \
cd Discordgym- && \
chmod +x *.sh && \
docker-compose -f docker-compose.dev.yml up -d
```

## Fehlerbehebung

### Problem: "Permission denied"
```bash
sudo chown -R $(whoami) ./
chmod +x *.sh
```

### Problem: Port bereits in Verwendung
```bash
# Prozess finden und beenden
lsof -ti:80 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Problem: Docker-Container starten nicht
```bash
# Docker Desktop neu starten
# Oder Docker-Daemon neu starten (nur auf Linux):
# sudo systemctl restart docker
```
