# 🧪 JWT Authentication Testing Guide

## 🚀 **Backend starten (manuell):**

### **Option 1: Mit npm scripts**
```bash
cd c:\dev\DiscordGym\server
npm run build
npm start
```

### **Option 2: Direkt mit Node**
```bash
cd c:\dev\DiscordGym\server
npm run build
cd dist
node main.js
```

### **Option 3: Mit nest CLI**
```bash
cd c:\dev\DiscordGym\server
npx nest start
```

## 🧪 **JWT Testing Steps:**

### **1. Backend Status prüfen:**
```bash
curl http://localhost:3000/health
# Erwartete Antwort: {"status":"OK","timestamp":"..."}
```

### **2. User registrieren (mit JWT Token):**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'
```

**Erwartete Antwort:**
```json
{
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "...",
    "createdAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful! Welcome to DiscordGym! 🏋️‍♂️"
}
```

### **3. User einloggen (mit JWT Token):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Erwartete Antwort:**
```json
{
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful! Welcome back! 💪"
}
```

### **4. JWT Token testen (Chat API):**

**WICHTIG:** Ersetze `YOUR_JWT_TOKEN` mit dem Token aus Schritt 2 oder 3!

```bash
curl -X POST http://localhost:3000/chat/channels/test-channel/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Hello from authenticated user!"
  }'
```

**Erwartete Antwort:**
```json
{
  "id": "...",
  "content": "Hello from authenticated user!",
  "senderId": "USER_ID_FROM_JWT",
  "channelId": "test-channel",
  "createdAt": "..."
}
```

### **5. Ohne JWT Token testen (sollte fehlen):**
```bash
curl -X POST http://localhost:3000/chat/channels/test-channel/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This should fail!"
  }'
```

**Erwartete Antwort:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## 🎯 **Was testet das?**

✅ **JWT Token Generation** - Register/Login gibt Token zurück  
✅ **JWT Token Validation** - API akzeptiert nur gültige Token  
✅ **User Extraction** - User ID wird aus Token extrahiert  
✅ **Protected Routes** - Chat API ist geschützt  
✅ **Authorization Header** - Bearer Token wird korrekt gelesen  

## 🛠️ **Troubleshooting:**

### **Backend startet nicht:**
```bash
# Prüfe Dependencies
cd c:\dev\DiscordGym\server
npm install

# Prüfe Build
npm run build

# Prüfe Ports
netstat -ano | findstr :3000
```

### **JWT Fehler:**
- Prüfe ob JWT_SECRET in .env.development steht
- Prüfe ob AuthModule korrekt konfiguriert ist
- Prüfe Browser Network Tab für Authorization Header

### **Database Fehler:**
```bash
cd c:\dev\DiscordGym\server
npx prisma generate
npx prisma db push
```

## 📋 **Success Criteria:**

✅ Backend läuft auf Port 3000  
✅ Register gibt JWT Token zurück  
✅ Login gibt JWT Token zurück  
✅ Chat API mit Token funktioniert  
✅ Chat API ohne Token wird abgelehnt  
✅ User ID wird aus JWT extrahiert (nicht mehr "temp-user")  

**Wenn alles funktioniert: JWT Authentication ist erfolgreich implementiert! 🎉**
