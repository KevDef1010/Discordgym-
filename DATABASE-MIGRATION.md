# 🔄 Database Migration Guide

## 🎯 Option 1: MariaDB (Empfohlen - Einfacher Wechsel)

### **Schritt 1: MariaDB Installation**
```bash
# Windows (mit Chocolatey):
choco install mariadb

# Oder Docker:
docker run --name mariadb-discordgym -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=discordgym -p 3306:3306 -d mariadb:latest
```

### **Schritt 2: Prisma Schema anpassen**
```prisma
// server/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  discordId String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Workout {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  duration    Int      // in minutes
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())

  @@map("workouts")
}
```

### **Schritt 3: Environment Variables**
```env
# server/.env
DATABASE_URL="mysql://root:password@localhost:3306/discordgym"
```

### **Schritt 4: Migration**
```bash
cd server
npx prisma migrate dev --name init-mariadb
npx prisma generate
```

---

## 🚀 Option 2: MongoDB (Moderne NoSQL)

### **Schritt 1: MongoDB Installation**
```bash
# Windows (mit Chocolatey):
choco install mongodb

# Oder Docker:
docker run --name mongodb-discordgym -p 27017:27017 -d mongo:latest
```

### **Schritt 2: Prisma Schema für MongoDB**
```prisma
// server/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  username  String   @unique
  email     String   @unique
  password  String
  discordId String   @unique
  workouts  Workout[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Workout {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  duration    Int      // in minutes
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())

  @@map("workouts")
}
```

### **Schritt 3: Environment Variables**
```env
# server/.env
DATABASE_URL="mongodb://localhost:27017/discordgym"
```

### **Schritt 4: Setup**
```bash
cd server
npx prisma db push
npx prisma generate
```

---

## 📋 Vergleich der Optionen

| Feature | SQLite | MariaDB | MongoDB |
|---------|---------|---------|---------|
| **Setup Aufwand** | ✅ Minimal | ⚠️ Mittel | ⚠️ Mittel |
| **Code Änderungen** | ✅ Keine | ✅ Minimal | ❌ Viele |
| **Performance** | ⚠️ Begrenzt | ✅ Hoch | ✅ Sehr hoch |
| **Skalierbarkeit** | ❌ Begrenzt | ✅ Gut | ✅ Exzellent |
| **Komplexität** | ✅ Einfach | ⚠️ Mittel | ⚠️ Hoch |
| **Deployment** | ✅ Einfach | ⚠️ Server nötig | ⚠️ Server nötig |

## 🎯 Empfehlung für Ihr Projekt

### **Für Professor-Demo:** SQLite behalten ✅
- Kein Setup erforderlich
- Funktioniert out-of-the-box
- Einfache Präsentation

### **Für Production:** MariaDB verwenden 🚀
- Professioneller
- Bessere Performance
- Einfacher Wechsel

### **Für moderne Apps:** MongoDB wählen 🌟
- Zukunftssicher
- Sehr flexibel
- Aber mehr Umbau nötig
