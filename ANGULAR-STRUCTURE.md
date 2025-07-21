# DiscordGym - Angular Projektstruktur

## 📁 Wo was hingehört:

### 🏠 **Pages (Seiten)**
```
src/app/pages/
├── home/              # Landing Page
├── features/          # Features Übersicht  
├── pricing/          # Preise
├── about/            # Über uns
└── contact/          # Kontakt
```

### 🧩 **Shared Components (Wiederverwendbare Komponenten)**
```
src/app/shared/components/
├── button/           # Buttons (Primary, Secondary, etc.)
├── navbar/           # Navigation
├── footer/           # Footer
├── modal/            # Modals/Dialoge
├── card/             # Cards
├── input/            # Eingabefelder
└── spinner/          # Loading Spinner
```

### 🎨 **Features (Funktionalitäten)**
```
src/app/features/
├── auth/             # Login/Register
├── workouts/         # Workout Tracking
├── profile/          # User Profile
├── leaderboard/      # Rangliste
└── challenges/       # Fitness Challenges
```

### 🛠️ **Services (Logik)**
```
src/app/core/services/
├── auth.service.ts      # Authentifizierung
├── api.service.ts       # Backend API
├── discord.service.ts   # Discord Integration
└── workout.service.ts   # Workout Logic
```

## 🚀 **Nächste Schritte:**

### 1. **Neue Komponenten erstellen:**
```bash
# Page
ng generate component pages/features --standalone

# Shared Component  
ng generate component shared/components/modal --standalone

# Feature Component
ng generate component features/workouts/workout-form --standalone
```

### 2. **Services erstellen:**
```bash
ng generate service core/services/api
ng generate service core/services/auth
```

### 3. **Module verwenden:**
```typescript
// In jedem Component:
@Component({
  imports: [ButtonComponent, ModalComponent, ...], // Importierte Components
})
```

## 🎯 **Aktuelle Struktur:**
✅ Home Page mit Hero Section
✅ Reusable Button Component  
✅ Navigation mit Mobile Support
✅ Footer mit Social Links
✅ Routing konfiguriert
✅ Tailwind CSS integriert

## 📝 **Was als nächstes?**
1. **Features Page** erstellen
2. **Login/Auth** implementieren
3. **Workout Tracking** aufbauen
4. **Discord Bot Integration**
5. **Backend API** verbinden
