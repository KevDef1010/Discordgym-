# DiscordGym API - Datenbank Zugriff 🏋️‍♂️

## Server starten
```bash
cd server
npm start
```

Der Server läuft auf: **http://localhost:3000**

## API Endpoints

### 🏥 Health Check
```bash
curl -X GET http://localhost:3000/health
```
Prüft ob die API und Datenbank verfügbar sind.

### 📊 Datenbank Statistiken
```bash
curl -X GET http://localhost:3000/database/stats
```
Zeigt Anzahl von Users, Workouts, Exercises, etc.

### 🌱 Test-Daten erstellen
```bash
curl -X POST http://localhost:3000/database/seed-simple
```
Erstellt 2 Test-Benutzer mit Workouts und Progress-Daten:
- **FitnessKing**: Strength Training (Bench Press, Pull-ups)
- **CardioQueen**: Cardio Session (Running, Walking)

### 🧹 Datenbank leeren
```bash
curl -X DELETE http://localhost:3000/database/clear
```
Löscht alle Daten aus der Datenbank.

### 👥 Alle Benutzer anzeigen
```bash
curl -X GET http://localhost:3000/users
```
Zeigt alle Benutzer mit ihren Workouts und Progress-Daten.

### 📋 Detaillierte Benutzer-Daten
```bash
curl -X GET http://localhost:3000/database/users-with-data
```
Zeigt alle Benutzer mit vollständigen Details inkl. Exercises.

### 🔍 Spezifischer Benutzer
```bash
curl -X GET http://localhost:3000/users/[USER_ID]
```
Zeigt einen bestimmten Benutzer (ID aus der Liste nehmen).

### 🔗 Benutzer über Discord ID finden
```bash
curl -X GET http://localhost:3000/users/discord/111111111111111111
```
Findet FitnessKing über seine Discord ID.

## Beispiel-Workflow

1. **Server starten und testen:**
   ```bash
   curl -X GET http://localhost:3000/health
   ```

2. **Aktuelle Daten prüfen:**
   ```bash
   curl -X GET http://localhost:3000/database/stats
   ```

3. **Test-Daten erstellen:**
   ```bash
   curl -X POST http://localhost:3000/database/seed-simple
   ```

4. **Benutzer anzeigen:**
   ```bash
   curl -X GET http://localhost:3000/users
   ```

## Datenbank Schema

### User
- `id`, `discordId`, `username`, `email`, `avatar`
- Hat viele: `workouts`, `progress`, `challenges`

### Workout
- `id`, `userId`, `name`, `description`, `type`, `duration`, `caloriesBurned`
- Hat viele: `exercises`

### Exercise
- `id`, `workoutId`, `name`, `sets`, `reps`, `weight`, `distance`, `duration`

### Progress
- `id`, `userId`, `type`, `value`, `unit`, `notes`

## Frontend Integration

Die Angular App läuft auf **http://localhost:4200** und kann diese API verwenden:

```typescript
// In einem Angular Service
async getUsers() {
  return this.http.get('http://localhost:3000/users').toPromise();
}

async createTestData() {
  return this.http.post('http://localhost:3000/database/seed-simple', {}).toPromise();
}
```

## Nächste Schritte

1. **Workout-API erweitern** - CRUD für Workouts
2. **Challenge-System** - Wettkämpfe zwischen Benutzern
3. **Discord Bot Integration** - Commands für Workout-Tracking
4. **Frontend Components** - Dashboard, Workout-Tracking UI
