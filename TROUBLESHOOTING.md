# 🚨 Problemlösung - DATABASE_URL Fehler

## ❌ Fehler: "Environment variable not found: DATABASE_URL"

### 🔧 Schnelle Lösung:

**1. Ins server Verzeichnis wechseln:**
```bash
cd server
```

**2. .env Datei erstellen:**
```bash
cat > .env << 'EOF'
DATABASE_URL="mysql://discordgym:discordgym123@localhost:3306/discordgym"
JWT_SECRET="DgSecure2024!JWT#Secret$Random%Token&Key*2025"  
JWT_REFRESH_SECRET="DgRefresh2024!JWT#Secret$Random%Token&Key*2025"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:4200"
SOCKET_ORIGINS="http://localhost:4200"
EOF
```

**3. Backend neu starten:**
```bash
npm run start:dev
```

### ✅ Das sollte den Fehler beheben!

---

## 📋 Vollständige Checkliste:

1. ✅ Docker Container läuft (`docker ps`)
2. ✅ .env Datei existiert im `server/` Verzeichnis
3. ✅ DATABASE_URL zeigt auf `localhost:3306`
4. ✅ Backend startet ohne Fehler

## 🛠️ Weitere Probleme:

### Port 3306 bereits belegt:
```bash
# Bestehenden Container stoppen
docker stop discordgym-mariadb
docker rm discordgym-mariadb

# Neuen Container starten
docker run --name discordgym-mariadb \
  -e MYSQL_ROOT_PASSWORD=discordgym123 \
  -e MYSQL_DATABASE=discordgym \
  -e MYSQL_USER=discordgym \
  -e MYSQL_PASSWORD=discordgym123 \
  -p 3306:3306 \
  -d mariadb:latest
```

### Prisma Probleme:
```bash
cd server
npx prisma generate
npx prisma db push
```
