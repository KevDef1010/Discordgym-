# 🐳 DiscordGym Docker Management Scripts

## 📋 Verfügbare Befehle

### 🚀 Haupt-Befehle

| Befehl | Windows | Linux/Mac | Beschreibung |
|--------|---------|-----------|--------------|
| **Smart Start** | `docker-start.bat` | `./docker-start.sh` | **Intelligenter Start**: Baut Container nur wenn nötig, startet vorhandene |
| **Force Build** | `docker-build.bat` | `./docker-build.sh` | **Kompletter Neuaufbau**: Baut alle Container von Grund auf neu |
| **Stop** | `docker-stop.bat` | `./docker-stop.sh` | **Stoppen**: Stoppt alle Container |
| **Logs** | `docker-logs.bat` | `./docker-logs.sh` | **Log-Viewer**: Zeigt Logs einzelner Services |

### 🎯 Verwendung

#### Erste Verwendung oder nach Code-Änderungen:
```bash
# Windows
docker-build.bat

# Linux/Mac  
./docker-build.sh
```

#### Normaler Start (Container existieren bereits):
```bash
# Windows
docker-start.bat

# Linux/Mac
./docker-start.sh
```

#### Container stoppen:
```bash
# Windows
docker-stop.bat

# Linux/Mac
./docker-stop.sh
```

### 🔍 Smart Start Logik

Das `docker-start` Skript prüft automatisch:
- ✅ **Existieren Container bereits?** → Startet sie
- ❌ **Keine Container gefunden?** → Baut und startet sie

### 📊 Container Status

Nach dem Start werden folgende URLs verfügbar:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001  
- **Prisma Studio**: http://localhost:5556

### 🛠️ Manuelle Docker-Befehle

Falls Sie die Docker-Befehle direkt verwenden möchten:

```bash
# Status prüfen
docker-compose -f docker-compose.dev.yml ps

# Starten (wenn Container existieren)
docker-compose -f docker-compose.dev.yml start

# Bauen und starten (erste Verwendung)
docker-compose -f docker-compose.dev.yml up -d --build

# Stoppen
docker-compose -f docker-compose.dev.yml stop

# Komplett herunterfahren und Container löschen
docker-compose -f docker-compose.dev.yml down

# Logs anzeigen
docker-compose -f docker-compose.dev.yml logs -f
```

### 💡 Tipps

- **Erste Verwendung**: Verwenden Sie `docker-build` 
- **Tägliche Arbeit**: Verwenden Sie `docker-start`
- **Nach Code-Änderungen**: Verwenden Sie `docker-build`
- **Debugging**: Verwenden Sie `docker-logs`

Die Skripte erkennen automatisch Ihr Betriebssystem und zeigen die entsprechenden URLs an!
