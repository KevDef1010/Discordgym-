# 🎭 User Roles System - DiscordGym

## 📋 Verfügbare User Rollen

### **🔴 System-Level Rollen:**
- **SUPER_ADMIN** - Vollzugriff auf das gesamte System
  - Kann alle User verwalten
  - Kann System-Settings ändern
  - Kann Server erstellen/löschen

- **ADMIN** - Administrator-Rechte
  - Kann User verwalten
  - Kann Content moderieren
  - Kann Server-Settings ändern

### **🟡 Community-Level Rollen:**
- **MODERATOR** - Chat & Content Moderation
  - Kann Messages löschen
  - Kann User temporär bannen
  - Kann Workouts moderieren

- **TRAINER** - Fitness-Expert
  - Kann Workouts erstellen
  - Kann Challenges hosten
  - Kann anderen Usern helfen

### **🟢 User-Level Rollen:**
- **PREMIUM_USER** - Premium Features
  - Erweiterte Statistiken
  - Prioritäts-Support
  - Beta-Features Zugang

- **MEMBER** - Standard User (Default)
  - Kann Workouts tracken
  - Kann an Challenges teilnehmen
  - Kann in Chat schreiben

- **GUEST** - Begrenzte Rechte
  - Nur Lesezugriff
  - Kann nicht posten
  - Temporärer Zugang

## 🎯 Server-spezifische Rollen (zusätzlich):

### **Discord Server Member Rollen:**
- **OWNER** - Server Besitzer
- **ADMIN** - Server Administrator  
- **MODERATOR** - Server Moderator
- **TRAINER** - Fitness Trainer im Server
- **VIP** - VIP Member
- **MEMBER** - Reguläres Mitglied
- **GUEST** - Gast im Server

## 🚀 API Verwendung:

### **User mit Rolle registrieren:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moderator1",
    "email": "mod@example.com", 
    "password": "password123",
    "role": "MODERATOR"
  }'
```

### **Alle User mit Rollen anzeigen:**
```bash
curl http://localhost:3000/users | jq '.[] | {username, role, isActive}'
```

## 🎭 Quick Test Users:

| Username | Email | Password | Rolle |
|----------|-------|----------|-------|
| superadmin | super@admin.com | admin123 | SUPER_ADMIN |
| chatmod | mod@discord.com | mod123 | MODERATOR |
| gymtrainer | trainer@gym.com | train123 | TRAINER |
| vipuser | vip@premium.com | vip123 | PREMIUM_USER |

## 🔐 Permissions Matrix:

| Feature | GUEST | MEMBER | PREMIUM | TRAINER | MODERATOR | ADMIN | SUPER_ADMIN |
|---------|-------|---------|---------|---------|-----------|-------|-------------|
| View Content | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Workouts | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Join Challenges | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat Messages | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Challenges | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Moderate Content | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🎯 Für Professor Demo:

1. **Rolle bei Registrierung angeben** (optional, default: MEMBER)
2. **Verschiedene User-Typen** für realistische Demo
3. **Chat-System** bereit für Rollen-basierte Permissions
4. **Skalierbar** für große Discord-Communities

## 📊 In Prisma Studio sehen:
- **users** Tabelle zeigt `role` und `isActive` Spalten
- **server_members** zeigt Server-spezifische Rollen
- Filtern nach Rollen möglich
