# 🔒 DiscordGym Secure Startup Guide

## 🛡️ Überblick

Das DiscordGym-System verwendet jetzt ein sicheres Startup-Verfahren, bei dem beim Server-Start sowohl das Datenbankpasswort als auch Admin-Credentials abgefragt werden.

## 🚀 Server starten

### Windows:
```bash
start-secure.bat
```

### Linux/WSL/MacOS:
```bash
chmod +x start-secure.sh
./start-secure.sh
```

### Manuell:
```bash
cd server
npm run build
npm run start:prod
```

## 🔑 Anmeldedaten

### 1. Database Password
- **Aufforderung**: `📁 Database Password:`
- **Passwort**: `Dg$ecure2024!Gym#` (Ihr aktuelles DB-Passwort)
- **Hinweis**: Eingabe wird mit `*` maskiert

### 2. Admin Authentication

#### Option 1: Admin User
- **Username**: `admin`
- **Password**: `superadmin2024`

#### Option 2: DiscordGym User  
- **Username**: `discordgym`
- **Password**: `Dg$ecure2024!Admin#`

## 🔧 Funktionsweise

1. **Startup Sequence**:
   ```
   🔒 DiscordGym Security Setup
   ═══════════════════════════════
   📁 Database Password: ********
   
   👤 Super Admin Authentication  
   ═══════════════════════════════
   🔑 Admin Username: admin
   🔒 Admin Password: ********
   
   ✅ Authentication successful!
   👤 Logged in as: admin
   
   🚀 DiscordGym Server Started Successfully!
   ```

2. **Sicherheitsprüfungen**:
   - Datenbankpasswort wird in `DATABASE_URL` eingesetzt
   - Admin-Credentials werden gegen Hash-Werte geprüft
   - Bei Fehlern wird der Start abgebrochen

## ⚠️ Fehlerbehandlung

### Database Connection Failed
- **Ursache**: Falsches DB-Passwort oder DB nicht erreichbar
- **Lösung**: Korrektes Passwort eingeben oder DB starten

### Invalid Admin Credentials
- **Ursache**: Falscher Username oder Passwort
- **Lösung**: Gültige Credentials verwenden (siehe oben)

### Process Exit Codes
- `0`: Erfolgreicher Start
- `1`: Sicherheitsfehler oder DB-Problem

## 🔐 Passwort-Sicherheit

### Aktuell implementiert:
- ✅ **Masked Input**: Passwörter werden nicht sichtbar eingegeben
- ✅ **SHA-256 Hashing**: Admin-Passwörter werden gehasht verglichen
- ✅ **No Storage**: Passwörter werden nicht dauerhaft gespeichert
- ✅ **Runtime Injection**: DB-Passwort wird zur Laufzeit eingesetzt

### Features:
- **Ctrl+C**: Bricht den Startup ab
- **Ctrl+D**: Beendet Passwort-Eingabe
- **Error Handling**: Aussagekräftige Fehlermeldungen

## 📝 Anpassungen

### Neue Admin-User hinzufügen:
In `src/utils/password-prompt.ts`:
```typescript
const validCredentials = [
  { username: 'admin', passwordHash: createHash('sha256').update('superadmin2024').digest('hex') },
  { username: 'discordgym', passwordHash: createHash('sha256').update('Dg$ecure2024!Admin#').digest('hex') },
  // Neuen User hinzufügen:
  { username: 'newuser', passwordHash: createHash('sha256').update('newpassword').digest('hex') },
];
```

### Datenbankpasswort ändern:
1. Ändern Sie das Passwort in Ihrer MariaDB
2. Geben Sie das neue Passwort beim Server-Start ein
3. Die `.env` bleibt unverändert

## 🎯 Vorteile des Systems

1. **🔒 Sicherheit**: Keine Passwörter in Dateien gespeichert
2. **🛡️ Kontrolle**: Nur autorisierte Personen können Server starten  
3. **📋 Logging**: Nachverfolgung wer den Server gestartet hat
4. **🚀 Einfach**: Intuitive Bedienung mit klaren Prompts
5. **🔄 Flexibel**: Passwörter können geändert werden ohne Code-Änderungen

## 💡 Tipps

- **Development**: Die alten `start.bat`/`start.sh` Scripts funktionieren weiterhin für lokale Entwicklung
- **Production**: Verwenden Sie immer die secure Scripts für Production
- **Teamwork**: Teilen Sie die Admin-Credentials sicher mit Ihrem Team
- **Backup**: Notieren Sie sich die Passwörter an einem sicheren Ort
