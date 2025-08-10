# 🎓 Quick Start für Professor Demo

## ⚡ Sofort loslegen (3 Schritte)

### 1. Docker starten
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Browser öffnen
http://localhost:4200

### 3. Einloggen
- **Email:** `professor@university.de`
- **Passwort:** `demo123`

## 🔧 Nützliche Kommandos

```bash
# Alle Container stoppen
docker-compose -f docker-compose.dev.yml down

# Container-Status prüfen
docker-compose -f docker-compose.dev.yml ps

# Demo-Daten neu laden
cd server && npx prisma db seed

# Logs anzeigen
docker-compose -f docker-compose.dev.yml logs -f
```

## 🌐 Wichtige URLs
- **App:** http://localhost:4200
- **API:** http://localhost:3001
- **Datenbank:** http://localhost:5556

## 👥 Demo-Accounts
- `professor@university.de` / `demo123` (Hauptaccount)
- `max@student.de` / `demo123`
- `anna@student.de` / `demo123`
- `coach@discordgym.de` / `demo123`

📖 **Vollständige Anleitung:** Siehe `PROFESSOR-DEMO-GUIDE.md`
