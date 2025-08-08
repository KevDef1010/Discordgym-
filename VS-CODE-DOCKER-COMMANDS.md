# VS Code Docker Terminal Commands

## Verwendung der VS Code Tasks

Nach der Erstellung der `tasks.json` Datei können Sie die Docker Container direkt aus VS Code verwalten:

### Terminal-Befehle

#### 1. Smart Start (empfohlen)
```bash
# Startet Container intelligent - baut nur wenn nötig
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Force Build (bei Problemen)
```bash
# Baut alle Container von Grund auf neu
docker-compose -f docker-compose.dev.yml up -d --build --force-recreate
```

### VS Code Task Palette verwenden

1. **Öffnen Sie die Command Palette**: `Ctrl+Shift+P` (Windows/Linux) oder `Cmd+Shift+P` (Mac)
2. **Tippen Sie**: `Tasks: Run Task`
3. **Wählen Sie eine der folgenden Tasks**:
   - `Docker: Smart Start` - Startet Container intelligent
   - `Docker: Force Build` - Baut alle Container neu
   - `Docker: Stop All` - Stoppt alle Container
   - `Docker: Show Status` - Zeigt Container Status

### Tastenkürzel (optional)

Sie können in VS Code auch Tastenkürzel für die häufigsten Tasks definieren:

1. **Öffnen Sie**: `File > Preferences > Keyboard Shortcuts`
2. **Suchen Sie nach**: `workbench.action.tasks.runTask`
3. **Fügen Sie Tastenkürzel hinzu** (z.B. `Ctrl+Shift+D` für Docker Start)

### Die zwei wichtigsten Befehle

1. **Smart Start**: `docker-compose -f docker-compose.dev.yml up -d`
   - Startet alle Services
   - Baut nur Container die sich geändert haben
   - Ideal für den täglichen Gebrauch

2. **Force Build**: `docker-compose -f docker-compose.dev.yml up -d --build --force-recreate`
   - Baut alle Container komplett neu
   - Nur verwenden wenn Probleme auftreten

### Zugriff auf die Anwendung

Nach dem Start sind die Services verfügbar unter:
- **Frontend**: http://localhost (Port 80)
- **API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5556
- **Database**: localhost:3307

### Troubleshooting

- **Container stoppen**: `docker-compose -f docker-compose.dev.yml stop`
- **Logs anzeigen**: `docker-compose -f docker-compose.dev.yml logs -f`
- **Status prüfen**: `docker-compose -f docker-compose.dev.yml ps`
