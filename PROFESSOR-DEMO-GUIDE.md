# 🎓 Professor Demo Guide - Discord Gym Anwendung

## 📋 Überblick
Diese Anwendung ist eine **Discord-ähnliche Chat- und Fitness-Community-Plattform** mit umfangreichen Funktionen für Universitäten und Fitness-Communities.

## 🚀 Schnellstart

### 1. Anwendung starten
```bash
# In das Projektverzeichnis wechseln
cd DiscordGym

# Docker-Container starten (alle Services)
docker-compose -f docker-compose.dev.yml up -d

# Warten bis alle Services bereit sind (ca. 30 Sekunden)
```

### 2. Zugriff auf die Anwendung
- **Frontend (Benutzeroberfläche):** http://localhost:4200
- **Backend API:** http://localhost:3001
- **Prisma Studio (Datenbank-Interface):** http://localhost:5556

### 3. Demo Login-Daten

#### 🎯 Haupt-Demo-Account (Professor)
- **Email:** `professor@university.de`
- **Passwort:** `demo123`
- **Rolle:** Administrator

#### 👥 Weitere Demo-Accounts
- **Max Mustermann:** `max@student.de` / `demo123` (Student)
- **Anna Meier:** `anna@student.de` / `demo123` (Student & Admin)
- **Sara Weber:** `sara@student.de` / `demo123` (Student)
- **Fitness Coach:** `coach@discordgym.de` / `demo123` (Coach & Admin)
- **Lisa Klein:** `lisa@student.de` / `demo123` (Student)

## 🏢 Demo-Server und Communities

### 1. **Universität Fitness Gemeinschaft**
- **Beschreibung:** Offizielle Fitness-Community der Universität
- **Kanäle:**
  - `#allgemein` - Allgemeine Diskussionen
  - `#workout-tipps` - Trainingsroutinen und Tipps
  - `#ernährung` - Gesunde Ernährung und Rezepte
  - `#motivation` - Motivation und Erfolgsgeschichten
- **Mitglieder:** Professor (Owner), Students, Fitness Coach

### 2. **Informatik Lerngruppe WS24**
- **Beschreibung:** Private Lerngruppe für Informatikstudenten
- **Kanäle:**
  - `#general` - Allgemeine Diskussionen
  - `#algorithmen` - Algorithmen und Datenstrukturen
  - `#projekte` - Gemeinsame Projekte und Code-Reviews
- **Mitglieder:** Max (Owner), Anna, Sara, Lisa

### 3. **Discord Gym Challenges**
- **Beschreibung:** Wöchentliche Fitness-Challenges
- **Kanäle:**
  - `#current-challenge` - Aktuelle Wochenchallenge
  - `#leaderboard` - Rangliste und Erfolge
- **Mitglieder:** Fitness Coach (Owner), Professor, Students

## ✨ Kernfunktionen zum Testen

### 🔐 Authentifizierung & Benutzerkonten
- [x] Registrierung neuer Benutzer
- [x] Login/Logout mit E-Mail und Passwort
- [x] JWT-basierte Authentifizierung
- [x] Benutzerrollen (ADMIN, MEMBER, SUPER_ADMIN)

### 👥 Soziale Funktionen
- [x] **Freundschaftssystem**
  - Freundschaftsanfragen senden
  - Anfragen annehmen/ablehnen
  - Freundesliste verwalten
- [x] **Online-Status**
  - Echtzeitanzeige wer online/offline ist
  - Automatische Status-Aktualisierung

### 🏢 Server-Management
- [x] **Server erstellen und verwalten**
  - Öffentliche und private Server
  - Server-Beschreibungen und Avatare
  - Einladungscodes generieren
- [x] **Mitgliederverwaltung**
  - Mitglieder hinzufügen/entfernen
  - Rollen vergeben (OWNER, ADMIN, MEMBER)
  - Server verlassen
- [x] **Kanal-System**
  - Mehrere Kanäle pro Server
  - Kanalbeschreibungen
  - Kanalpositionen verwalten

### 💬 Chat-System
- [x] **Echtzeit-Messaging**
  - WebSocket-basierte Echtzeitkommunikation
  - Nachrichtenverlauf
  - Nachrichten bearbeiten
- [x] **Message Reactions**
  - Emoji-Reaktionen auf Nachrichten
  - Beliebte Reaktionen: 👍, ❤️, 💪, 🔥, 🏆, 👏
- [x] **Direkte Nachrichten**
  - 1:1 Chat zwischen Freunden

### 🛡️ High Availability & Sicherheit
- [x] **Load Balancing**
  - NGINX Reverse Proxy
  - Mehrere Backend-Instanzen
  - Automatisches Failover
- [x] **Datenbank-Redundanz**
  - MariaDB mit persistentem Storage
  - Redis für Session-Management
- [x] **Sicherheitsfeatures**
  - Password Hashing (bcrypt)
  - CORS-Konfiguration
  - Input-Validierung

## 🧪 Test-Szenarien

### Scenario 1: Neue Benutzerregistrierung
1. Gehen Sie zu http://localhost:4200
2. Klicken Sie auf "Registrieren"
3. Erstellen Sie einen neuen Account
4. Loggen Sie sich ein

### Scenario 2: Chat-Funktionen testen
1. Einloggen als Professor
2. Navigieren Sie zu "Universität Fitness Gemeinschaft"
3. Wählen Sie den Kanal "#allgemein"
4. Senden Sie eine Nachricht
5. Fügen Sie Emoji-Reaktionen hinzu

### Scenario 3: Server-Management
1. Einloggen als Professor oder Max
2. Öffnen Sie die Server-Mitgliederliste
3. Verwalten Sie Mitgliederrollen
4. Entfernen Sie Mitglieder (falls berechtigt)

### Scenario 4: Freundschaftssystem
1. Einloggen als beliebiger Benutzer
2. Öffnen Sie die Freundesliste
3. Senden Sie Freundschaftsanfragen
4. Wechseln Sie zu einem anderen Account
5. Akzeptieren/Ablehnen von Anfragen

### Scenario 5: Online-Status
1. Öffnen Sie mehrere Browser-Tabs
2. Loggen Sie sich mit verschiedenen Accounts ein
3. Beobachten Sie die Echtzeit-Status-Updates
4. Testen Sie Offline/Online-Übergänge

## 📊 Monitoring & Administration

### Prisma Studio (Datenbank-Interface)
- **URL:** http://localhost:5556
- **Funktionen:**
  - Live-Datenbankanzeige
  - CRUD-Operationen
  - Datenmodell-Explorer
  - Echtzeitdaten der Demo-Benutzer

### Docker Container Status
```bash
# Container-Status prüfen
docker-compose -f docker-compose.dev.yml ps

# Logs anzeigen
docker-compose -f docker-compose.dev.yml logs -f

# Container stoppen
docker-compose -f docker-compose.dev.yml down
```

## 🎯 Bewertungskriterien

### Technische Implementierung
- [x] **Frontend:** Angular 18 mit TypeScript
- [x] **Backend:** NestJS mit TypeScript
- [x] **Datenbank:** MariaDB mit Prisma ORM
- [x] **Echtzeit:** Socket.IO für WebSocket-Kommunikation
- [x] **Containerisierung:** Docker & Docker Compose
- [x] **Load Balancing:** NGINX Reverse Proxy

### Architektur-Qualität
- [x] **Saubere Trennung:** Frontend/Backend separation
- [x] **RESTful APIs:** Standardkonforme API-Endpunkte
- [x] **Datenmodellierung:** Normalisierte Datenbankstruktur
- [x] **Sicherheit:** Authentifizierung und Autorisierung
- [x] **Skalierbarkeit:** High Availability Setup

### Benutzerfreundlichkeit
- [x] **Responsive Design:** Mobile-First Ansatz
- [x] **Intuitive UI:** Discord-ähnliche Benutzeroberfläche
- [x] **Echtzeit-Feedback:** Sofortige UI-Updates
- [x] **Fehlerbehandlung:** Benutzerfreundliche Fehlermeldungen

## 🔧 Technische Details für Evaluation

### Datenbankschema
- **Benutzer:** User-Management mit Rollen
- **Server:** Community-Struktur mit Hierarchien
- **Kanäle:** Organisierte Chat-Räume
- **Nachrichten:** Vollständiger Chat-Verlauf
- **Freundschaften:** Soziales Netzwerk
- **Reaktionen:** Interaktive Message-Features

### API-Endpunkte
- **Authentication:** `/auth/login`, `/auth/register`, `/auth/refresh`
- **Users:** `/users/profile`, `/users/friends`
- **Servers:** `/chat/servers`, `/chat/servers/:id/members`
- **Messages:** `/chat/messages`, `/chat/channels/:id/messages`
- **Real-time:** WebSocket events für Live-Updates

### Performance-Features
- **Connection Pooling:** Optimierte Datenbankverbindungen
- **Caching:** Redis für Session- und Daten-Caching
- **Lazy Loading:** Effiziente Datenladung
- **Pagination:** Skalierbare Datenabfragen

## 📞 Support & Kontakt

Bei Fragen zur Demo oder technischen Problemen:
- **Demo-Reset:** Führen Sie `npx prisma db seed` im server-Ordner aus
- **Container-Neustart:** `docker-compose -f docker-compose.dev.yml restart`
- **Port-Konflikte:** Prüfen Sie ob Ports 4200, 3001, 3307, 6379, 5556 frei sind

---

**Viel Erfolg bei der Evaluation! 🚀**
