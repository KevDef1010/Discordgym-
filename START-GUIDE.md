# 🚀 DiscordGym - Start Guide für Professor

## 📋 **Schritt-für-Schritt Anleitung**

### **Voraussetzungen:**
- ✅ Node.js (Version 18+)
- ✅ Git
- ✅ Terminal/Command Prompt

---

## 🔧 **1. Repository klonen & Setup**

```bash
# 1. Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd Discordgym-

# 2. Backend Dependencies installieren
cd server
npm install

# 3. Frontend Dependencies installieren  
cd ../client
npm install
cd ..
```

---

## 🗄️ **2. Datenbank vorbereiten (SQLite)**

> **💡 Info:** SQLite ist eine eingebettete Datenbank - kein separater DB-Server nötig!

```bash
# Im server/ Ordner:
cd server

# Datenbank Schema erstellen/aktualisieren
npx prisma db push

# Prisma Client generieren (für TypeScript-Support)
npx prisma generate

# ✅ SQLite Datenbank wird automatisch erstellt: server/prisma/dev.db
```

### **Optional - Test-Daten hinzufügen:**
```bash
# ERST nach dem Server-Start (Schritt 3):
curl -X POST http://localhost:3000/database/seed-simple
```

### **Datenbank-Features:**
- ✅ **Keine Installation** nötig (SQLite ist eingebettet)
- ✅ **Automatische Erstellung** beim ersten Start
- ✅ **File-basiert**: `server/prisma/dev.db`
- ✅ **Production-ready** für Demo-Zwecke

---

## 🚀 **3. Server starten (2 Terminals)**

### **Terminal 1 - Backend Server (inkl. Database):**
```bash
cd server
npm start

# ✅ Erfolgreich wenn Sie sehen:
# "�️ Database connected successfully" ← SQLite automatisch geladen!
# "�🚀 Server is running on http://localhost:3000"
```

### **Terminal 2 - Frontend Server:**
```bash
cd client  
npm start

# ✅ Erfolgreich wenn Sie sehen:
# "Local: http://localhost:4200/"
```

### **💡 Warum keine separate Datenbank?**
- **SQLite** läuft im Backend-Prozess mit
- **Keine Konfiguration** nötig
- **Perfekt für Demos** und Development

---

## 🌐 **4. Anwendung öffnen**

### **URLs:**
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000
- **Datenbank Admin:** http://localhost:3000/database/stats

---

## 🧪 **5. Demo-Registrierung testen**

### **Schritt 1:** Gehe zu http://localhost:4200/register

### **Schritt 2:** Registriere einen neuen User:
```
Username: TestProfessor
Email: professor@discordgym.com  
Password: password123
Confirm Password: password123
✅ Accept Terms
```

### **Schritt 3:** Klicke "Create Account"

### **Schritt 4:** Automatische Weiterleitung zu Dashboard
- ✅ Sieh personalisierte Fitness-Stats
- ✅ Recent Workouts
- ✅ Active Challenges

---

## 🔄 **6. Login testen**

### **Schritt 1:** Logout im Dashboard (Button oben rechts)

### **Schritt 2:** Gehe zu http://localhost:4200/login

### **Schritt 3:** Anmelden mit:
```
Email: professor@discordgym.com
Password: password123
```

---

## 🎯 **7. API Testing (Backend)**

### **Health Check:**
```bash
curl http://localhost:3000/health
```

### **Registrierung via API:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "APIUser",
    "email": "api@test.com",
    "password": "password123"
  }'
```

### **Datenbank Statistics:**
```bash
curl http://localhost:3000/database/stats
```

---

## 🏗️ **8. Architektur Overview**

### **Backend (NestJS):**
```
server/src/
├── auth/          ← Registrierung & Login
├── user/          ← User Management  
├── workout/       ← Fitness Features
├── database/      ← DB Utilities
└── prisma/        ← Database Client
```

### **Frontend (Angular):**
```
client/src/app/
├── pages/         ← UI Components
│   ├── home/      ← Landing Page
│   ├── login/     ← Login Form
│   ├── register/  ← Registration
│   └── dashboard/ ← User Dashboard
├── shared/        ← Services & Guards
└── app.routes.ts  ← Route Configuration
```

### **Database (SQLite + Prisma):**
```
Models: User, Workout, Exercise, Challenge, Progress
Features: Auto-generated Discord IDs, Password Hashing
```

---

## 🛠️ **9. Troubleshooting**

### **Port bereits belegt:**
```bash
# Windows:
taskkill //F //IM node.exe

# MacOS/Linux:
pkill node
```

### **Datenbank Probleme:**
```bash
cd server
npx prisma db push --force-reset
npx prisma generate
```

### **Dependencies Probleme:**
```bash
# Backend:
cd server && rm -rf node_modules && npm install

# Frontend:  
cd client && rm -rf node_modules && npm install
```

---

## 🎓 **10. Demo-Script für Präsentation**

### **"Ich zeige Ihnen eine moderne Full-Stack Anwendung:"**

1. **"Backend-API"** → `curl http://localhost:3000/health`
2. **"User Registration"** → Registrierung durchführen
3. **"Database Integration"** → `curl http://localhost:3000/database/stats`
4. **"Frontend Integration"** → Dashboard zeigen
5. **"Security Features"** → Password Hashing, Route Guards
6. **"Clean Architecture"** → Code-Struktur erklären

---

## 📊 **11. Key Features für Professor**

### **Technical Stack:**
- ✅ **NestJS** - Enterprise Backend Framework
- ✅ **Angular** - Modern Frontend Framework  
- ✅ **Prisma** - Type-safe Database ORM
- ✅ **SQLite** - Embedded Database
- ✅ **TypeScript** - Full-Stack Type Safety

### **Architecture Patterns:**
- ✅ **Clean Architecture** - Separation of Concerns
- ✅ **Domain-Driven Design** - Business Logic Modules
- ✅ **Repository Pattern** - Database Abstraction
- ✅ **DTO Pattern** - Input Validation & Transformation

### **Security Features:**
- ✅ **bcrypt** - Password Hashing
- ✅ **CORS** - Cross-Origin Protection  
- ✅ **Input Validation** - class-validator
- ✅ **Route Guards** - Authentication Protection

---

## 🎉 **Fertig!**

**Die Anwendung läuft jetzt vollständig mit:**
- ✅ User Registration & Login
- ✅ Dashboard mit Mock Fitness-Data
- ✅ REST API mit Dokumentation
- ✅ Sichere Authentication
- ✅ Modern Web Architecture

**"Professor, das ist ein production-ready Showcase moderner Web-Development!"** 🚀
