# ===================================
# Security Configuration für Docker
# ===================================

# Dieser Text erklärt wichtige Sicherheitsaspekte für die Docker-Deployment

## 1. Environment Variables
- Niemals Secrets in docker-compose.yml hardcoden
- Verwende separate .env-Dateien für verschiedene Umgebungen
- Verwende Docker Secrets in Production

## 2. Network Security
- Interne Services (DB, Redis) sind nur im internal_network verfügbar
- Nur Frontend und API sind extern erreichbar
- Traefik handled SSL-Terminierung

## 3. Container Security
- Verwende Non-Root User in Containern
- Minimale Base Images (Alpine)
- Health Checks implementiert
- Resource Limits setzen

## 4. Database Security
- Separate Benutzer für Application und Admin
- Starke Passwörter
- Database ist nur intern erreichbar
- Regular Backups

## 5. Secrets Management
Für Production sollten Sie Docker Secrets verwenden:

```yaml
secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

## 6. Monitoring & Logging
- Prometheus für Metriken
- Grafana für Dashboards
- Container Logs mit Docker Logging Driver
- Health Checks für alle Services

## 7. SSL/TLS
- Traefik automatische SSL-Zertifikate mit Let's Encrypt
- HTTPS Redirect
- Security Headers
