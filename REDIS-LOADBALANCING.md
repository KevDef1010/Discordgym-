# 🚀 Redis Container - Was macht er?

## 📋 **Redis Verwendung in DiscordGym:**

### 1. **🔐 Session Storage**
- Speichert User-Sessions zwischen mehreren Backend-Containern
- JWT-Token Blacklisting
- Login-Status synchronisation

### 2. **💬 Socket.IO Adapter** 
- Chat-Nachrichten zwischen Container-Instanzen
- Real-time User-Status (online/offline)
- WebSocket-Verbindungen koordinieren

### 3. **⚡ Cache Layer**
- Workout-Daten caching
- User-Profile caching
- API-Response caching

### 4. **🔄 Pub/Sub System**
- Friend-Request Notifications
- Chat-Message Broadcasting
- Real-time Updates zwischen Services

---

# ⚖️ Load Balancing Setup

## 🎯 **Neue High-Availability Architektur:**

```
Internet → NGINX Load Balancer → Backend-1 (Primary)
                              → Backend-2 (Backup)
                              ↓
                           Redis (Shared Sessions)
                              ↓
                           MariaDB (Database)
```

## 🚀 **Neue Befehle für HA-Setup:**

### **Einzelner Container (bisherig):**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### **High-Availability (2 Backend-Container):**
```bash
docker-compose -f docker-compose.ha.yml up -d
```

## 🛡️ **Failover-Features:**

1. **Automatic Failover**: Wenn Backend-1 abstürzt → Backend-2 übernimmt
2. **Health Checks**: Überwacht Container-Gesundheit
3. **Session Persistence**: User bleiben eingeloggt bei Container-Wechsel
4. **Sticky Sessions**: Gleicher User → gleicher Container (wenn möglich)

## 🔧 **Load Balancing Strategien:**

- **ip_hash**: Gleiche IP → gleicher Backend (Session-Persistenz)
- **round_robin**: Gleichmäßige Verteilung
- **least_conn**: Wenigste aktive Verbindungen

## 📊 **Monitoring URLs:**

- **Frontend**: http://localhost (nginx → ui)
- **API**: http://localhost:3001 (nginx → api-1/api-2)
- **Health Check**: http://localhost:3001/health
- **Redis**: localhost:6379
- **Database**: localhost:3307

---

**Redis = Shared Memory zwischen allen Backend-Containern! 🧠**
