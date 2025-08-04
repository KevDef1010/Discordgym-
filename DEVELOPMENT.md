# 🚀 DiscordGym - Next Development Steps

## 🚨 **CRITICAL Priority (Diese Woche):**

### **1. JWT Authentication Guards**
**Problem:** Chat Controller verwendet noch `temp-user` hardcoded
**Dateien:** `server/src/chat/chat.controller.ts` (Line 60, 82)

**Implementation:**
```typescript
// 1. JWT Strategy & Guards erstellen
server/src/auth/jwt.strategy.ts
server/src/auth/jwt-auth.guard.ts

// 2. Chat Controller mit Guards schützen
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  // User aus JWT Token extrahieren
  @Post('channels/:channelId/messages')
  async sendChannelMessage(
    @Param('channelId') channelId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req  // User aus JWT
  ) {
    return this.chatService.sendChannelMessage({
      content: sendMessageDto.content,
      senderId: req.user.id,  // ← Aus JWT statt hardcoded
      channelId: channelId
    });
  }
}
```

### **2. Real User Integration**
**Problem:** Frontend & Backend verwenden noch Mock-User
**Status:** Auth Service existiert, aber nicht integriert

**Tasks:**
- [ ] JWT Token nach Login speichern
- [ ] HTTP Interceptor für Authorization Header
- [ ] Chat Component mit echten User-Daten
- [ ] Socket.IO mit JWT Authentication

### **3. Admin & Friends Guards**
**Problem:** Alle Controller haben TODOs für Auth Guards
**Dateien:** 
- `admin.controller.ts` (Line 17)
- `friends.controller.ts` (Line 20, 29, 47)

## 🟡 **HIGH Priority (Nächste 2 Wochen):**

### **4. Error Handling & Notifications**
**Problem:** Friends Component hat unvollständige Error Handling
**Dateien:** `friends.ts` (Line 331, 360, 387)

### **5. API Integration vervollständigen**
**Problem:** Friends Component hat Mock-Calls
**Dateien:** `friends.ts` (Line 625, 642)

### **6. Production Security**
- Environment Variables für JWT Secrets
- CORS Configuration
- Rate Limiting
- Input Validation

## 🟢 **MEDIUM Priority (Nächster Monat):**

### **7. Feature Completions**
- File Upload für Avatars
- Message Attachments
- Voice Chat Integration
- Mobile Responsive Design

### **8. Performance Optimizations**
- Database Indexing
- Caching Strategy
- Lazy Loading
- Image Optimization

### **9. Testing & Documentation**
- Unit Tests für Services
- E2E Tests für Critical Flows
- API Documentation
- User Manual

## 📋 **Implementation Order:**

**Week 1:** JWT Guards + Real User Integration
**Week 2:** Error Handling + API Completions  
**Week 3:** Security Hardening
**Week 4:** Feature Polish + Testing

## 🔧 **Immediate Action Plan:**

1. **Start mit JWT Strategy** - Basis für alles andere
2. **Chat Authentication** - Kritisch für Funktionalität
3. **Frontend HTTP Interceptor** - User-Daten überall verfügbar
4. **Error Boundaries** - Bessere UX

**Ready to implement? Soll ich mit JWT Authentication anfangen?**

---

# 🛠️ Lokale Entwicklung starten

## ⚡ Quick Start (3 Schritte)

### 1. **Server starten** (Backend + Frontend)
```bash
cd c:\dev\DiscordGym
npm start
```
✅ **Das startet automatisch:**
- **Backend:** http://localhost:3000 (NestJS + Prisma)
- **Frontend:** http://localhost:4200 (Angular)

### 2. **Test-Daten erstellen**
```bash
# Test-User + Workouts erstellen
curl -X POST http://localhost:3000/database/seed-simple
```

### 3. **Datenbank verwalten** (optional)
```bash
cd server
npx prisma studio
```
✅ **Öffnet:** http://localhost:5555 (Grafische DB-Verwaltung)

---

## 🛠️ Einzelne Services starten

### **Nur Backend:**
```bash
cd server
npm run start:dev     # Development mode (auto-reload)
# oder
npm start            # Production mode
```

### **Nur Frontend:**
```bash
cd client
npm start
```

---

## 📋 **Development Checklist**

### **Server läuft?**
```bash
curl http://localhost:3000/health
# Erwartete Antwort: {"status":"OK","database":"Connected",...}
```

### **Frontend läuft?**
- Browser: http://localhost:4200
- Sollte die Angular App anzeigen

### **Datenbank funktioniert?**
```bash
curl http://localhost:3000/database/stats
# Zeigt Anzahl Users, Workouts, etc.
```

---

## 🔧 **Wichtige API-Endpoints**

| Endpoint | Beschreibung |
|----------|-------------|
| `GET /health` | Server-Status prüfen |
| `GET /users` | Alle Benutzer |
| `GET /workouts` | Alle Workouts |
| `POST /database/seed-simple` | Test-Daten erstellen |
| `POST /database/quick-user` | Einzelnen User erstellen |
| `GET /database/stats` | Datenbank-Statistiken |
| `DELETE /database/clear` | Datenbank leeren |

---

## 🐛 **Troubleshooting**

### **Server startet nicht?**
```bash
cd server
npm install          # Dependencies installieren
npx prisma generate   # Prisma Client generieren
npm run build        # TypeScript kompilieren
```

### **Frontend startet nicht?**
```bash
cd client
npm install          # Dependencies installieren
```

### **Datenbank-Probleme?**
```bash
cd server
npx prisma db push   # Schema in DB pushen
npx prisma studio    # DB visuell inspizieren
```

### **Port-Konflikte?**
- Backend: http://localhost:3000
- Frontend: http://localhost:4200  
- Prisma Studio: http://localhost:5555

---

## 🎯 **Typischer Workflow**

1. **Morgens:** `npm start` (startet alles)
2. **Test-Daten:** `curl -X POST http://localhost:3000/database/seed-simple`
3. **Entwickeln:** Code ändern (auto-reload aktiv)
4. **DB prüfen:** `npx prisma studio` bei Bedarf
5. **API testen:** curl-Commands oder Frontend


