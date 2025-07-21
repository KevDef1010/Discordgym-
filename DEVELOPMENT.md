# 🚀 DiscordGym - Lokale Entwicklung starten

## ⚡ Quick Start (3 Schritte)

### 1. **Server starten** (Backend + Frontend)
```bash
cd c:\dev\DiscordGym
npm start
```
✅ **Das startet automatisch:**
- **Backend:** http://localhost:3000 (NestJS + Prisma)
- **Frontend:** http://localhost:4200 (Angular)

### 2. **Test-Daten erstellen**
```bash
# Test-User + Workouts erstellen
curl -X POST http://localhost:3000/database/seed-simple
```

### 3. **Datenbank verwalten** (optional)
```bash
cd server
npx prisma studio
```
✅ **Öffnet:** http://localhost:5555 (Grafische DB-Verwaltung)

---

## 🛠️ Einzelne Services starten

### **Nur Backend:**
```bash
cd server
npm run start:dev     # Development mode (auto-reload)
# oder
npm start            # Production mode
```

### **Nur Frontend:**
```bash
cd client
npm start
```

---

## 📋 **Development Checklist**

### **Server läuft?**
```bash
curl http://localhost:3000/health
# Erwartete Antwort: {"status":"OK","database":"Connected",...}
```

### **Frontend läuft?**
- Browser: http://localhost:4200
- Sollte die Angular App anzeigen

### **Datenbank funktioniert?**
```bash
curl http://localhost:3000/database/stats
# Zeigt Anzahl Users, Workouts, etc.
```

---

## 🔧 **Wichtige API-Endpoints**

| Endpoint | Beschreibung |
|----------|-------------|
| `GET /health` | Server-Status prüfen |
| `GET /users` | Alle Benutzer |
| `GET /workouts` | Alle Workouts |
| `POST /database/seed-simple` | Test-Daten erstellen |
| `POST /database/quick-user` | Einzelnen User erstellen |
| `GET /database/stats` | Datenbank-Statistiken |
| `DELETE /database/clear` | Datenbank leeren |

---

## 🐛 **Troubleshooting**

### **Server startet nicht?**
```bash
cd server
npm install          # Dependencies installieren
npx prisma generate   # Prisma Client generieren
npm run build        # TypeScript kompilieren
```

### **Frontend startet nicht?**
```bash
cd client
npm install          # Dependencies installieren
```

### **Datenbank-Probleme?**
```bash
cd server
npx prisma db push   # Schema in DB pushen
npx prisma studio    # DB visuell inspizieren
```

### **Port-Konflikte?**
- Backend: http://localhost:3000
- Frontend: http://localhost:4200  
- Prisma Studio: http://localhost:5555

---

## 🎯 **Typischer Workflow**

1. **Morgens:** `npm start` (startet alles)
2. **Test-Daten:** `curl -X POST http://localhost:3000/database/seed-simple`
3. **Entwickeln:** Code ändern (auto-reload aktiv)
4. **DB prüfen:** `npx prisma studio` bei Bedarf
5. **API testen:** curl-Commands oder Frontend

**Das war's! Happy Coding! 🏋️‍♂️💻**
