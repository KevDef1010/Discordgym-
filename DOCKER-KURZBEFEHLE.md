# 🚀 Kurze Docker Befehle - Schnellstart Guide

## ⚡ Super kurze Befehle (nach Setup)

### Windows Setup (einmalig):
```cmd
docker-aliases.bat
```

### Linux/Mac Setup (einmalig):
```bash
source docker-aliases.sh
```

## 🎯 Die 5 wichtigsten Kurzbefehle:

### 1. **`dstart`** - Container starten
```bash
dstart
```
- Startet alle Container intelligent
- Equivalent zu: `docker-compose -f docker-compose.dev.yml up -d`

### 2. **`dbuild`** - Container neu bauen
```bash
dbuild
```
- Baut alle Container komplett neu
- Bei Problemen verwenden

### 3. **`dstop`** - Container stoppen
```bash
dstop
```

### 4. **`dstatus`** - Status anzeigen
```bash
dstatus
```

### 5. **`dlogs`** - Logs anzeigen
```bash
dlogs
```

## 🎮 VS Code Tasks (noch kürzer):

**`Ctrl+Shift+P`** → Tippen Sie einfach:
- `dstart` - Container starten
- `dbuild` - Container neu bauen
- `dstop` - Container stoppen
- `dstatus` - Status prüfen

## 🏃‍♂️ Workflow Beispiel:

```bash
# 1. Container starten
dstart

# 2. Status prüfen
dstatus

# 3. Bei Problemen neu bauen
dbuild

# 4. Stoppen wenn fertig
dstop
```

## 🌐 Zugriff nach `dstart`:
- **Frontend**: http://localhost
- **API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5556

---
**Noch kürzer geht es nicht! 😎**
