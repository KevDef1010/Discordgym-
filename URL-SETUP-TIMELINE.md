# 🎯 URL Configuration Timeline

## Wann solltest du die URLs setzen?

### **Phase 1: Lokale Entwicklung** ✅ (FERTIG)
- **Status:** Bereits konfiguriert
- **URLs:** localhost:3000 (Backend), localhost:4201 (Frontend)
- **Files:** environment.ts, .env.development

### **Phase 2: Domain Registration & Server Setup**
```bash
# 1. Domain kaufen/registrieren
your-domain.com

# 2. Server/Hosting bereitstellen
- VPS/Cloud Server mieten
- oder Hosting-Service wählen (Vercel, Netlify, DigitalOcean)

# 3. Subdomain Setup
api.your-domain.com     # für Backend API
app.your-domain.com     # für Frontend (optional)
```

### **Phase 3: SSL & DNS Setup** 
```bash
# 1. SSL Zertifikat installieren (Let's Encrypt)
# Option 1: Certbot für direktes Nginx
sudo certbot --nginx -d api.your-domain.com

# Option 2: Docker-basiertes Setup mit Traefik
docker-compose -f traefik-docker-compose.yml up -d

# 2. DNS A-Records setzen
api.your-domain.com -> Server IP
app.your-domain.com -> Server IP (oder CDN)
socket.your-domain.com -> Server IP (für Socket.IO)
```

### **Phase 4: Environment URLs setzen** (1-2 Tage vor Go-Live)
```bash
# Backend: server/.env.production
NODE_ENV=production
DATABASE_URL="mysql://user:pass@your-db-host:3306/discord_gym_prod"
CORS_ORIGIN="https://app.your-domain.com"
SOCKET_CORS_ORIGIN="https://app.your-domain.com"
JWT_SECRET="[SECURE_SECRET_HERE]"
JWT_REFRESH_SECRET="[SECURE_REFRESH_SECRET_HERE]"
REDIS_URL="redis://[REDIS_HOST]:6379" # Für Socket.IO State Management

# Frontend: client/src/environments/environment.prod.ts  
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com',
  socketUrl: 'https://socket.your-domain.com',
  recaptchaSiteKey: '[YOUR_RECAPTCHA_SITE_KEY]',
  version: '1.0.0',
}
```

### **Phase 5: Deployment & Testing**
```bash
# 1. Production Build testen
cd client && npm run build:prod
cd server && npm run build

# 2. Docker Container bauen (für Option A)
docker build -t discord-gym-api:latest ./server
docker build -t discord-gym-ui:latest ./client

# 3. Deployment
# Option A: Docker Compose auf Server
scp docker-compose.prod.yml user@your-server:/opt/discordgym/
ssh user@your-server "cd /opt/discordgym && docker-compose -f docker-compose.prod.yml up -d"

# Option B: CI/CD über GitHub Actions zu Cloud-Services
# (GitHub Actions Workflow läuft automatisch)

# 4. Security Hardening
ssh user@your-server "docker exec discordgym-api npm audit fix"

# 5. Testing
# URL Connectivity testen
curl https://api.your-domain.com/health
# Socket.IO Verbindung prüfen mit Tool wie socketio-tester
# Login/Registration Flow testen
# Monitoring einrichten (Prometheus/Grafana oder Datadog)
```

## 🚀 **Empfohlener Workflow:**

### **Option A: Alles selbst hosten**
1. **VPS mieten** (DigitalOcean, Hetzner, AWS EC2, Linode)
2. **Domain kaufen** (Namecheap, GoDaddy, Porkbun)
3. **Server Setup** (Nginx, Docker Compose, Traefik, Let's Encrypt)
4. **CI/CD Pipeline** (GitHub Actions, GitLab CI)
5. **URLs in Configs setzen**

### **Option B: Getrennt hosten** (Einfacher)
1. **Frontend:** Vercel/Netlify/Cloudflare Pages (automatisches SSL)
2. **Backend:** Railway/Render/Fly.io/DigitalOcean App Platform  
3. **Database:** PlanetScale/Neon/Railway/DigitalOcean Managed DB
4. **Cache Layer:** Redis Labs/Upstash (für Socket.IO State)
5. **URLs nach Deployment setzen**

## ⏰ **Konkrete Timeline:**

**Heute:** Weiter lokal entwickeln ✅

**Tag 1-2:** Domain registrieren + Hosting wählen

**Tag 3-4:** Server Setup + SSL + CI/CD Pipeline einrichten

**Tag 5:** URLs in Production configs setzen + Deploy

**Tag 6-7:** Lasttests + Security Checks + Monitoring einrichten

**Tag 8:** Go-Live + Post-Launch Überwachung

## 💡 **Pro-Tipps:**
1. Erstelle zuerst eine **Staging-Environment** mit temporären URLs zum Testen, bevor du die finalen Production URLs setzt.
2. Verwende **Docker Compose** für konsistente Entwicklungs- und Produktionsumgebungen.
3. Implementiere **Monitoring** (Prometheus/Grafana) von Anfang an.
4. Setze **CI/CD-Pipeline** (GitHub Actions) für automatisierte Tests und Deployment ein.
5. Erstelle einen **Rollback-Plan** für den Fall von Problemen nach dem Launch.

## 🔒 **Security Checklist:**
- [ ] SSL für alle Endpunkte (API, WebSocket, Frontend)
- [ ] Sichere Datenbank-Credentials und JWT-Secrets
- [ ] CORS korrekt konfiguriert
- [ ] Rate Limiting für API-Endpunkte
- [ ] Security Headers konfiguriert (CSP, HSTS, etc.)
- [ ] Regelmäßige Backups der Datenbank
- [ ] Access Logs aktivieren und überwachen

Möchtest du mit **Option A (selbst hosten)** oder **Option B (Cloud Services)** gehen?
