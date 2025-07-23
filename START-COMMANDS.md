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
