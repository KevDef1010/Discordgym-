# 🔐 DiscordGym - Registrierung & Login

## ✅ **Registrierung implementiert!**

### **Neue API-Endpoints:**

#### **1. Benutzer registrieren:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "discordId": "999888777666555444",
    "username": "NewGymUser",
    "email": "newuser@discordgym.com",
    "password": "securePassword123",
    "avatar": "https://example.com/avatar.png"
  }'
```

#### **2. Benutzer anmelden:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@discordgym.com",
    "password": "securePassword123"
  }'
```

#### **3. Verfügbarkeit prüfen:**
```bash
curl "http://localhost:3000/auth/check?email=test@test.com&username=TestUser&discordId=123456789"
```

---

## 🗄️ **Datenbank-Schema erweitert:**

### **User-Tabelle jetzt mit:**
- ✅ `password` (gehashed mit bcrypt)
- ✅ `username` (unique)
- ✅ Sichere Validierung

---

## 🔧 **Features:**

### **Sicherheit:**
- ✅ **Passwort-Hashing** mit bcrypt (Salt-Rounds: 10)
- ✅ **Unique-Constraints** (Email, Username, Discord ID)
- ✅ **Validierung** (Min. 6 Zeichen Passwort, 3 Zeichen Username)

### **Fehlerbehandlung:**
- ✅ **Duplikat-Erkennung** mit spezifischen Fehlermeldungen
- ✅ **Login-Validation** mit sicherer Passwort-Überprüfung
- ✅ **Daten-Schutz** (Passwort wird nie zurückgegeben)

### **API-Responses:**
```json
// Erfolgreiche Registrierung:
{
  "user": {
    "id": "...",
    "username": "NewGymUser",
    "email": "newuser@discordgym.com",
    "discordId": "999888777666555444",
    "avatar": "..."
  },
  "message": "Registration successful! Welcome to DiscordGym! 🏋️‍♂️"
}

// Erfolgreicher Login:
{
  "user": { ... },
  "message": "Login successful! Welcome back! 💪"
}
```

---

## 🚀 **Integration ins Frontend:**

### **Angular Service Beispiel:**
```typescript
// auth.service.ts
async register(userData: RegisterDto) {
  return this.http.post('http://localhost:3000/auth/register', userData);
}

async login(credentials: LoginDto) {
  return this.http.post('http://localhost:3000/auth/login', credentials);
}
```

### **Komponenten:**
- **Register-Form** mit Validierung
- **Login-Form** mit Fehlerbehandlung
- **User-Dashboard** nach erfolgreicher Anmeldung

---

## ⚡ **Quick Test:**

```bash
# 1. Server starten
npm start

# 2. Neuen User registrieren
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"discordId":"123456789","username":"TestGymmer","email":"test@gym.com","password":"password123"}'

# 3. Anmelden
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gym.com","password":"password123"}'
```

**Die Registrierung ist jetzt vollständig implementiert! 🎉**
