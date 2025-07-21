# Prisma Datenbank-Verwaltung 🗄️

## 🎯 Prisma Studio (Grafische Oberfläche)

**Prisma Studio** ist die beste Methode zur visuellen Datenbank-Verwaltung!

### Installation & Start:
```bash
cd server

# Prisma Studio starten (grafische DB-Verwaltung)
npx prisma studio

# Oder mit globalem Prisma:
npm install -g prisma
prisma studio
```

**Prisma Studio läuft dann auf:** `http://localhost:5555`

### Features von Prisma Studio:
- ✅ **Visueller Editor** für alle Tabellen
- ✅ **Daten hinzufügen/bearbeiten/löschen** mit Klicks
- ✅ **Beziehungen verfolgen** (User → Workouts → Exercises)
- ✅ **Filterung und Suche**
- ✅ **Real-time Updates**

---

## 🛠️ Prisma CLI Befehle

### Datenbank verwalten:
```bash
cd server

# Schema-Änderungen in DB pushen
npx prisma db push

# Neue Migration erstellen
npx prisma migrate dev --name "add_new_feature"

# Datenbank zurücksetzen (VORSICHT!)
npx prisma migrate reset

# Prisma Client neu generieren
npx prisma generate
```

### Debugging & Inspektion:
```bash
# Schema validieren
npx prisma validate

# Datenbank-Status prüfen
npx prisma migrate status

# Schema formatieren
npx prisma format
```

---

## 📊 Alternative: Direkte DB-Zugriffe

### SQLite Browser (falls Prisma Studio nicht funktioniert):
```bash
# SQLite-Datei direkt öffnen
sqlite3 prisma/dev.db

# In SQLite-Shell:
.tables                    # Alle Tabellen zeigen
.schema User               # User-Tabelle Schema
SELECT * FROM User;        # Alle Benutzer anzeigen
SELECT * FROM Workout;     # Alle Workouts anzeigen
.quit                      # Beenden
```

### VS Code SQLite Extension:
1. **Extension installieren:** "SQLite Viewer"
2. **Datei öffnen:** `server/prisma/dev.db`
3. **Tabellen durchsuchen** im Explorer

---

## 🚀 Schnell-Workflow

### 1. Daten über Prisma Studio bearbeiten:
```bash
npx prisma studio
# Öffnet http://localhost:5555
# Klick auf "User" → Daten bearbeiten
```

### 2. Test-Daten über API erstellen:
```bash
# Test-Daten erstellen
curl -X POST http://localhost:3000/database/seed-simple

# Dann in Prisma Studio anschauen
```

### 3. Schema-Änderungen:
```bash
# 1. Schema bearbeiten: prisma/schema.prisma
# 2. Änderungen pushen:
npx prisma db push
# 3. Client neu generieren:
npx prisma generate
```

---

## 🔧 Package.json Scripts (empfohlen)

Füge diese Scripts zu deiner `package.json` hinzu:

```json
{
  "scripts": {
    "db:studio": "prisma studio",
    "db:push": "prisma db push", 
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset",
    "db:seed": "curl -X POST http://localhost:3000/database/seed-simple"
  }
}
```

### Dann einfach verwenden:
```bash
npm run db:studio      # Studio starten
npm run db:push        # Schema-Änderungen pushen
npm run db:seed        # Test-Daten erstellen
```

---

## 🎯 Empfohlener Workflow:

1. **Server starten:** `npm start`
2. **Prisma Studio starten:** `npx prisma studio` 
3. **Browser öffnen:** `http://localhost:5555`
4. **Test-Daten erstellen:** API-Call oder Studio
5. **Daten verwalten:** Direkt in Studio bearbeiten

**Prisma Studio ist der einfachste Weg zur DB-Verwaltung!** 🎉

## 🗄️ **Database Setup mit Prisma**

### **Technische Details**
- **ORM**: Prisma 6.12.0
- **Database**: SQLite (für Development)
- **Location**: `server/prisma/dev.db`
- **Schema**: `server/prisma/schema.prisma`

### **Database Models**

#### 👤 **User Model**
```typescript
model User {
  id          String   @id @default(cuid())
  discordId   String   @unique // Discord User ID
  username    String
  email       String   @unique
  avatar      String?  // Discord avatar URL
  // Relations: workouts, servers, challenges, progress
}
```

#### 🏋️ **Workout Model**
```typescript
model Workout {
  id          String      @id @default(cuid())
  userId      String
  name        String
  description String?
  type        WorkoutType // CARDIO, STRENGTH, FLEXIBILITY, etc.
  duration    Int?        // Duration in minutes
  caloriesBurned Int?
  // Relations: user, exercises
}
```

#### 💪 **Exercise Model**
```typescript
model Exercise {
  id          String   @id @default(cuid())
  workoutId   String
  name        String
  sets        Int?
  reps        Int?
  weight      Float?   // Weight in kg
  distance    Float?   // Distance in km
  duration    Int?     // Duration in seconds
  notes       String?
}
```

#### 🏆 **Challenge & Progress Models**
- **Challenge**: Server-wide fitness challenges
- **UserChallenge**: User participation in challenges
- **Progress**: User progress tracking (weight, body fat, etc.)
- **Server**: Discord server management
- **ServerMember**: User membership in servers

### **Available API Endpoints**

#### **Health & Testing**
```http
GET    /health           # Database connection status
POST   /seed             # Seed database with test data
```

#### **Users**
```http
GET    /users            # Get all users (with pagination)
POST   /users            # Create new user
GET    /users/:id        # Get user by ID
GET    /users/discord/:discordId  # Get user by Discord ID
PUT    /users/:id        # Update user
DELETE /users/:id        # Delete user
GET    /users/:id/workouts       # Get user's workouts
GET    /users/:id/progress       # Get user's progress
```

### **Database Commands**

#### **Prisma Commands**
```bash
# Navigate to server directory
cd server

# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio

# Deploy migrations to production
npx prisma migrate deploy
```

#### **Database Seeding**
```bash
# Seed via API endpoint
curl -X POST http://localhost:3001/seed

# Or programmatically in your application
```

### **Environment Variables**
```env
# For SQLite (current setup)
DATABASE_URL="file:./dev.db"

# For PostgreSQL (production)
DATABASE_URL="postgresql://username:password@host:port/database"
```

### **Database Schema Diagram**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Workout   │    │  Exercise   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │───▶│ id (PK)     │───▶│ id (PK)     │
│ discordId   │    │ userId (FK) │    │ workoutId   │
│ username    │    │ name        │    │ name        │
│ email       │    │ type        │    │ sets/reps   │
│ avatar      │    │ duration    │    │ weight      │
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Progress   │    │ Challenge   │    │    Server   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ userId (FK) │    │ serverId    │    │ discordId   │
│ type        │    │ name        │    │ name        │
│ value       │    │ target      │    │ ownerId     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Example Usage**

#### **Create User**
```typescript
const user = await prisma.user.create({
  data: {
    discordId: "123456789",
    username: "FitnessUser",
    email: "user@discordgym.com",
    avatar: "https://cdn.discordapp.com/avatars/..."
  }
});
```

#### **Create Workout with Exercises**
```typescript
const workout = await prisma.workout.create({
  data: {
    userId: user.id,
    name: "Upper Body Strength",
    type: "STRENGTH",
    duration: 45,
    exercises: {
      create: [
        {
          name: "Bench Press",
          sets: 3,
          reps: 10,
          weight: 80,
          order: 1
        },
        {
          name: "Pull-ups",
          sets: 3,
          reps: 8,
          order: 2
        }
      ]
    }
  },
  include: { exercises: true }
});
```

### **Next Steps**
1. ✅ Database Schema & Models erstellt
2. ✅ User & Workout Services implementiert
3. ✅ REST API Endpoints verfügbar
4. 🔄 Frontend Integration mit Angular
5. 🔄 Discord Bot Integration
6. 🔄 Real-time Features mit WebSockets

### **Production Migration**
Für Production solltest du von SQLite zu PostgreSQL wechseln:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **Testing**
```bash
# Test database connection
curl http://localhost:3001/health

# Seed test data
curl -X POST http://localhost:3001/seed

# Get all users
curl http://localhost:3001/users
```

## 🎯 **Integration mit Frontend**

Die API ist jetzt bereit für die Integration mit deinem Angular Frontend. Du kannst HTTP-Services erstellen, um mit den Prisma-basierten Endpoints zu kommunizieren.
