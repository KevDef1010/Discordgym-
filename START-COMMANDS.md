# 🚀 DiscordGym - Port Testing Commands

## 🎯 **Super Einfache Terminal-Befehle:**

### **🔥 Komplett-Start (Backend + Frontend):**

```bash
# Port 4200 (Production-like)
npm run start:4200

# Port 4201 (Development) 
npm run start:4201
```

### **⚡ Einzeln starten:**

```bash
# Nur Frontend Port 4200
cd client && npm run start:4200

# Nur Frontend Port 4201  
cd client && npm run start:4201

# Nur Backend (unterstützt beide Ports)
cd server && npm run start:dev
```

### **🎯 Schnell-Befehle:**

```bash
# Standard Development
npm run start:4201

# Production Testing  
npm run start:4200
```

---

# 🚀 DiscordGym - Schnellstart Commands

## 🎯 **Alles starten - Reihenfolge:**

### **1. MariaDB Container starten**
```bash
docker start discordgym-mariadb
# Prüfen: docker ps
```

### **2. Backend starten**
```bash
cd server
npm start
# Läuft auf: http://localhost:3000
```

### **3. Prisma Studio starten**
```bash
cd server
npx prisma studio
# Öffnet: http://localhost:5555
```

### **4. Frontend starten**
```bash
cd client
npm start
# Läuft auf: http://localhost:4200
```

## 🌐 **Wichtige URLs:**
- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000  
- **Prisma Studio:** http://localhost:5555
- **MariaDB:** localhost:3306 (intern)

## 🔧 **Container Commands:**
```bash
# Status prüfen
docker ps

# Stoppen
docker stop discordgym-mariadb

# Starten
docker start discordgym-mariadb

# Neu erstellen (falls Probleme)
docker run --name discordgym-mariadb \
  -e MYSQL_ROOT_PASSWORD=discordgym123 \
  -e MYSQL_DATABASE=discordgym \
  -e MYSQL_USER=discordgym \
  -e MYSQL_PASSWORD=discordgym123 \
  -p 3306:3306 \
  -d mariadb:latest
```

## 🧪 **Test Commands:**
```bash
# Backend testen
curl http://localhost:3000/health

# User registrieren
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```
