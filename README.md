# 🏋️ DiscordGym - Full-Stack Fitness Application

Eine moderne Full-Stack Webanwendung mit **Angular Frontend** und **NestJS Backend** für Discord-basierte Fitness-Communities.

## 🚀 Quick Start für Professor

### **Option 1: Automatischer Start (empfohlen)**
```bash
# Windows:
double-click start.bat

# Linux/Mac:
./start.sh
```

### **Option 2: Manueller Start**
```bash
# Terminal 1 - Backend:
cd server
npm install
npm start

# Terminal 2 - Frontend:  
cd client
npm install
npm start
```

### **Demo öffnen:**
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000

---

## 🎯 Demo-Anleitung

### **1. Registrierung testen:**
- Gehe zu http://localhost:4200/register
- Fülle aus: Username, Email, Password
- Discord ID wird automatisch generiert! ✨

### **2. Dashboard erleben:**
- Automatische Weiterleitung nach Registrierung
- Personalisierte Fitness-Statistiken
- Recent Workouts & Active Challenges

### **3. API testen:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/database/stats
```

---

## 📋 Projektübersicht

**DiscordGym** ist eine moderne Webanwendung, die aus zwei Hauptkomponenten besteht:
- **Frontend**: Angular 20 mit Tailwind CSS
- **Backend**: NestJS mit TypeScript

## 🛠️ Technologie-Stack

### Frontend (Client)
- **Framework**: Angular 20.1.0
- **Styling**: Tailwind CSS 3.4.17
- **Language**: TypeScript 5.8.2
- **Server-Side Rendering**: Angular SSR
- **Build Tool**: Angular CLI

### Backend (Server)
- **Framework**: NestJS 11.0.1
- **Database**: MariaDB (Docker Container)
- **ORM**: Prisma 
- **Language**: TypeScript
- **Runtime**: Node.js
- **Testing**: Jest

## 📁 Projektstruktur

```
DiscordGym/
├── client/                 # Angular Frontend
│   ├── src/
│   │   ├── app/           # Angular Komponenten
│   │   ├── styles.scss    # Globale Styles mit Tailwind
│   │   └── ...
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── package.json
│   └── nest-cli.json
└── README.md
```

## 🚀 Installation und Setup

### Voraussetzungen
- **Node.js** (Version 18 oder höher)
- **npm** (wird mit Node.js installiert)
- **Git** (optional, für Versionskontrolle)

### 🎯 Ein-Befehl Setup (Empfohlen)

```bash
# Repository klonen
git clone <repository-url>
cd DiscordGym

# Alles installieren und starten
npm run install:all
npm start
```

**Das war's!** 🎉 
- Frontend läuft auf: **http://localhost:4200/**
- Backend läuft auf: **http://localhost:3000/**

### Alternative Methoden

#### Option 1: Batch-Datei (Windows)
```bash
# Doppelklick auf start.bat oder:
start.bat
```

#### Option 2: Shell-Script (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

#### Option 3: Manuell (wie bisher)
```bash
# Terminal 1 - Backend
cd server && npm install && npm run start:dev

# Terminal 2 - Frontend  
cd client && npm install && npm start
```

## 🖥️ Anwendung starten

### Option 1: Nur Frontend (Entwicklung)
```bash
cd client
npm start
```
- Frontend läuft auf: **http://localhost:4200/**
- Hot-Reload aktiviert (Änderungen werden automatisch übernommen)

### Option 2: Frontend + Backend
```bash
# Terminal 1 - Backend starten
cd server
npm run start:dev

# Terminal 2 - Frontend starten  
cd client
npm start
```
- Frontend: **http://localhost:4200/**
- Backend API: **http://localhost:3000/**

### Option 3: Production Build
```bash
# Frontend Build
cd client
npm run build

# Backend Build
cd server
npm run build
npm run start:prod
```

## 📝 Verfügbare Scripts

### Root-Level (Ein-Befehl-Lösungen)
- `npm start` - 🚀 **Startet Frontend + Backend parallel**
- `npm run dev` - Alias für `npm start`
- `npm run install:all` - Installiert alle Dependencies
- `npm run build` - Erstellt Production Builds für beide

### Frontend (client/)
- `npm run start:client-only` - Nur Frontend starten
- `npm run build:client` - Frontend Build
- `npm test` - Frontend Tests

### Backend (server/)
- `npm run start:server` - Nur Backend starten  
- `npm run build:server` - Backend Build
- `npm test` - Backend Tests

## 🎨 Styling mit Tailwind CSS

Das Projekt verwendet **Tailwind CSS 3.4.17** für das Styling:

- Konfiguration: `client/tailwind.config.js`
- Globale Styles: `client/src/styles.scss`
- PostCSS Setup: `client/src/postcss.config.js`

Beispiel für Tailwind-Klassen:
```html
<div class="bg-blue-500 text-white p-4 rounded-lg">
  Hello World
</div>
```

## 🔧 Entwicklung

### Neue Komponenten erstellen
```bash
cd client
ng generate component my-component
```

### Neue Services erstellen
```bash
cd client
ng generate service my-service
```

### Backend Endpoints hinzufügen
```bash
cd server
nest generate controller my-controller
nest generate service my-service
```

## 🐛 Fehlerbehebung

### Häufige Probleme

1. **Port bereits in Verwendung**
   ```bash
   # Anderen Port verwenden
   ng serve --port 4201
   ```

2. **Node Module Probleme**
   ```bash
   # Cache leeren und neu installieren
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Tailwind CSS wird nicht geladen**
   - Überprüfe `styles.scss` auf korrekte @tailwind Direktiven
   - Stelle sicher, dass PostCSS konfiguriert ist

## 📖 Weitere Informationen

### Angular
- [Angular Dokumentation](https://angular.dev/)
- [Angular CLI](https://cli.angular.io/)

### NestJS  
- [NestJS Dokumentation](https://nestjs.com/)
- [NestJS CLI](https://docs.nestjs.com/cli/overview)

### Tailwind CSS
- [Tailwind CSS Dokumentation](https://tailwindcss.com/)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs/utility-first)

## 👨‍🎓 Für den Professor

### Schnellstart-Anleitung:
1. Stelle sicher, dass Node.js installiert ist
2. Öffne Terminal im Projektverzeichnis
3. Führe folgende Befehle aus:
   ```bash
   npm run install:all
   npm start
   ```
4. Warte bis beide Server gestartet sind
5. Öffne Browser auf http://localhost:4200/

**Alternative (noch einfacher):**
- Windows: Doppelklick auf `start.bat`
- Linux/Mac: `./start.sh`

### Projektbewertung:
- **Frontend**: Modern Angular Setup mit TypeScript
- **Styling**: Professionelles Tailwind CSS Setup
- **Build**: Produktionsreife Konfiguration
- **Struktur**: Saubere Trennung von Frontend/Backend
- **Documentation**: Vollständige README mit Anweisungen

---

**Autor**: [Dein Name]  
**Datum**: Juli 2025  
**Version**: 1.0.0
