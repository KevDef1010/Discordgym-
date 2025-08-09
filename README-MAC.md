# DiscordGym für Mac 🍎

## Quick Start für Mac

```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd Discordgym-

# 2. Mac-Setup-Skript ausführen
chmod +x start-mac.sh
./start-mac.sh
```

## Manuelle Installation

### Voraussetzungen
```bash
# Docker Desktop installieren
brew install --cask docker

# Git installieren (falls nicht vorhanden)  
brew install git
```

### Container starten
```bash
# Standard Docker Compose (wie Windows)
docker-compose -f docker-compose.dev.yml up -d

# ODER Mac-optimierte Version (bessere Performance)
docker-compose -f docker-compose.mac.yml up -d
```

## URLs
- **Frontend**: http://localhost
- **API**: http://localhost:3001  
- **Prisma Studio**: http://localhost:5556

## Mac-spezifische Befehle

```bash
# Ports prüfen
lsof -i :80
lsof -i :3001

# Prozesse beenden
lsof -ti:80 | xargs kill -9

# Container-Status
docker-compose -f docker-compose.mac.yml ps

# Logs anzeigen
docker-compose -f docker-compose.mac.yml logs -f
```

## Performance-Tipps für Mac

1. **Verwende die Mac-optimierte Docker Compose**:
   ```bash
   docker-compose -f docker-compose.mac.yml up -d
   ```

2. **Docker Desktop Einstellungen**:
   - Resources → Advanced → Memory: Mindestens 4GB
   - Resources → Advanced → CPUs: Mindestens 2
   - Features in Development → Use Rosetta for x86/amd64 emulation (auf Apple Silicon)

3. **Volume-Performance**:
   - Die `docker-compose.mac.yml` verwendet `:delegated` für bessere Performance
   - Named volumes für Datenbank und Redis

## Troubleshooting auf Mac

### Problem: "Permission denied"
```bash
sudo chown -R $(whoami) ./
chmod +x *.sh
```

### Problem: Port bereits verwendet
```bash
# Alle Prozesse auf Port 80 beenden
sudo lsof -ti:80 | xargs kill -9

# Oder spezifischen Prozess finden
lsof -i :80
```

### Problem: Docker Desktop startet nicht
```bash
# Docker Desktop neu installieren
brew uninstall --cask docker
brew install --cask docker
```

### Problem: Langsame Performance
```bash
# Docker-Cache leeren
docker system prune -a

# Mac-optimierte Compose-Datei verwenden
docker-compose -f docker-compose.mac.yml up -d
```

## Entwicklung auf Mac

### VS Code Extensions
- Docker
- Angular Language Service  
- TypeScript Importer

### Terminal-Setup
```bash
# Zsh/Bash Aliase hinzufügen
echo 'alias dstart="docker-compose -f docker-compose.mac.yml up -d"' >> ~/.zshrc
echo 'alias dstop="docker-compose -f docker-compose.mac.yml down"' >> ~/.zshrc
echo 'alias dlogs="docker-compose -f docker-compose.mac.yml logs -f"' >> ~/.zshrc
source ~/.zshrc
```

Dann können Sie einfach verwenden:
```bash
dstart  # Container starten
dstop   # Container stoppen  
dlogs   # Logs anzeigen
```
