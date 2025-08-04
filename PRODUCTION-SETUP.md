# DiscordGym - Production & Development Setup

## 🚀 Was du noch abändern solltest:

### 1. **Environment Configuration** ✅ (Fertig erstellt)

**Angular Frontend:**
- `client/src/environments/environment.ts` - Development config
- `client/src/environments/environment.prod.ts` - Production config

**NestJS Backend:**
- `server/.env.development` - Development environment 
- `server/.env.production` - Production environment

### 2. **Für lokale Entwicklung:**

```bash
# Backend Setup
cd server
cp .env.development .env
npm run start:dev

# Frontend Setup  
cd client
npm run start:dev    # Läuft auf Port 4201
```

### 3. **Für Production Deployment:**

#### **Wichtige Änderungen vor Production:**

1. **Sichere JWT Secrets generieren:**
```bash
# Verwende starke, zufällige Secrets (mindestens 256-bit)
openssl rand -base64 32  # Für JWT_SECRET
openssl rand -base64 32  # Für JWT_REFRESH_SECRET
```

2. **Database URL anpassen:**
```bash
# In server/.env.production
DATABASE_URL="mysql://user:password@your-prod-db-host:3306/discord_gym_prod"
```

3. **Domain URLs setzen:**
```bash
# Backend: server/.env.production
CORS_ORIGIN="https://your-frontend-domain.com"
SOCKET_CORS_ORIGIN="https://your-frontend-domain.com"

# Frontend: client/src/environments/environment.prod.ts
apiUrl: 'https://your-api-domain.com'
socketUrl: 'https://your-api-domain.com'
```

4. **SSL/HTTPS aktivieren:**
```bash
# In server/.env.production
HTTPS=true
SECURE_COOKIES=true
```

### 4. **Build & Deploy Commands:**

```bash
# Frontend Production Build
cd client
npm run build:prod

# Backend Production Build  
cd server
npm run build
npm run start:prod
```

### 5. **Was noch fehlt für Production:**

1. **SSL Zertifikat** (Let's Encrypt empfohlen)
2. **Reverse Proxy** (Nginx/Apache) 
3. **Process Manager** (PM2 für Node.js)
4. **Database Backup** Strategy
5. **Monitoring** (Logs, Health Checks)

### 6. **Deployment Checklist:**

- [ ] Sichere JWT Secrets generiert
- [ ] Production Database erstellt  
- [ ] Domain Namen konfiguriert
- [ ] SSL Zertifikat installiert
- [ ] Environment Variables gesetzt
- [ ] Database Migrations ausgeführt
- [ ] Build Prozess getestet
- [ ] Health Checks eingerichtet

### 7. **Nützliche Commands:**

```bash
# Database Management
npm run db:push:prod     # Schema zu Production DB pushen
npm run db:migrate:prod  # Migrations in Production

# Development
npm run start:dev        # Backend Development
npm run start:dev        # Frontend Development (Port 4201)

# Production  
npm run start:prod       # Backend Production
npm run build:prod       # Frontend Production Build
```

**Dein Chat System ist vollständig implementiert! 🎉**
Jetzt nur noch die Environment Configs anpassen und deployen.
