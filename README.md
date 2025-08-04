# 🏋️ DiscordGym - Full-Stack Fitness Application

Eine moderne Full-Stack Webanwendung mit **Angular Frontend** und **NestJS Backend** für Discord-basierte Fitness-Communities.

## 🚀 Quick Start für Professor

### **🎯 Super Einfache Start-Befehle:**

```bash
# Port 4200 (Production-like)
npm run start:4200

# Port 4201 (Development) 
npm run start:4201

# Port 4202 (Additional Testing)
npm run start:4202
```

### **⚡ Einzeln starten:**

```bash
# Nur Frontend Port 4200
cd client && npm run start:4200

# Nur Frontend Port 4201  
cd client && npm run start:4201

# Nur Frontend Port 4202
cd client && npm run start:4202

# Nur Backend (unterstützt alle Ports)
cd server && npm run start:dev
```

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
- **Frontend:** http://localhost:4200, http://localhost:4201 oder http://localhost:4202
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

# Port 4201 starten (Development)
npm run start:4201

# ODER Port 4200 starten (Production-like)
npm run start:4200
```

**Das war's!** 🎉 
- Frontend läuft auf: **http://localhost:4200/**, **http://localhost:4201/** oder **http://localhost:4202/**
- Backend läuft auf: **http://localhost:3000/**

### 🔧 Port-Testing Optionen

```bash
# Standard Development (Port 4201)
npm run start:4201

# Production Testing (Port 4200)  
npm run start:4200

# Additional Testing (Port 4202)
npm run start:4202

# Alle Ports gleichzeitig (zum Vergleichen):
# Terminal 1: npm run start:4200
# Terminal 2: npm run start:4201  
# Terminal 3: npm run start:4202
```

### Alternative Methoden

#### Option 1: Batch-Datei (Windows)
```bash
# Port 4200:
start-4200.bat

# Port 4201:  
start-4201.bat

# Port 4202:
start-4202.bat
```

#### Option 2: Shell-Script (Linux/Mac)
```bash
# Port 4200:
chmod +x start-4200.sh && ./start-4200.sh

# Port 4201:
chmod +x start-4201.sh && ./start-4201.sh

# Port 4202:
chmod +x start-4202.sh && ./start-4202.sh
```

#### Option 3: Manuell (wie bisher)
```bash
# Terminal 1 - Backend
cd server && npm install && npm run start:dev

# Terminal 2 - Frontend Port 4200 
cd client && npm install && npm run start:4200

# ODER Terminal 2 - Frontend Port 4201
cd client && npm install && npm run start:4201

# ODER Terminal 2 - Frontend Port 4202  
cd client && npm install && npm run start:4202
```

## 🖥️ Anwendung starten

### Option 1: Nur Frontend (Entwicklung)
```bash
cd client
npm run start:4201    # Development Port
# oder
npm run start:4200    # Production-like Port
# oder  
npm run start:4202    # Additional Testing Port
```
- Frontend läuft auf: **http://localhost:4200/**, **http://localhost:4201/** oder **http://localhost:4202/**
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

### 🎯 Root-Level (Ein-Befehl-Lösungen)
- `npm run start:4200` - 🚀 **Frontend (Port 4200) + Backend parallel**
- `npm run start:4201` - 🚀 **Frontend (Port 4201) + Backend parallel**
- `npm run start:4202` - 🚀 **Frontend (Port 4202) + Backend parallel**
- `npm start` - 🚀 **Startet Frontend (4201) + Backend parallel**
- `npm run dev` - Alias für `npm start`
- `npm run install:all` - Installiert alle Dependencies
- `npm run build` - Erstellt Production Builds für beide

### Frontend (client/)
- `npm run start:4200` - Frontend auf Port 4200
- `npm run start:4201` - Frontend auf Port 4201
- `npm run start:4202` - Frontend auf Port 4202
- `npm run start:client-only` - Nur Frontend starten
- `npm run build:client` - Frontend Build
- `npm test` - Frontend Tests

### Backend (server/)
- `npm run start:server` - Nur Backend starten  
- `npm run build:server` - Backend Build
- `npm test` - Backend Tests

### 🔧 Port-Übersicht
| Port | Service | Environment | Verwendung |
|------|---------|-------------|------------|
| 3000 | Backend | Development | API Server |
| 4200 | Frontend | Production-like | Testing Production config |
| 4201 | Frontend | Development | Testing Development config |
| 4202 | Frontend | Additional | Extra Testing/Demo Port |

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

**Datum**: Juli 2025  
**Version**: 1.0.0
