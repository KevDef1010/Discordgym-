# 🏋️ DiscordGym - Test-Anleitung für Freunde

## ⚡ Schnell-Setup (Empfohlen)

```bash
# Repository klonen
git clone https://github.com/KevDef1010/Discordgym-.git
cd Discordgym-

# Automatisches Setup ausführen
chmod +x test-setup.sh
./test-setup.sh

# Frontend starten (in neuem Terminal)
cd client
npm start
```

## 🌐 Anwendung öffnen
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000

---

## 🧪 Test-Checkliste

### ✅ **Basis-Funktionen**
- [ ] Registrierung mit neuen Daten
- [ ] Login/Logout funktioniert
- [ ] Profil-Seite erreichbar
- [ ] Dashboard wird geladen

### ✅ **Chat-System**
- [ ] Server erstellen möglich
- [ ] Nachrichten senden/empfangen
- [ ] Infinite Scroll beim Scrollen
- [ ] Server-Einladung erstellen
- [ ] Einladungslink kopieren funktioniert

### ✅ **Profil-Integration**
- [ ] Empfangene Einladungen werden angezeigt
- [ ] Einladung annehmen funktioniert
- [ ] Einladung ablehnen funktioniert
- [ ] Server wird nach Annahme beigetreten

### ✅ **Mobile/Responsive**
- [ ] Mobile Ansicht funktioniert
- [ ] Sidebar-Toggle auf mobilen Geräten
- [ ] Touch-Bedienung funktioniert

---

## 🔧 **Problembehebung**

### **Datenbank-Probleme:**
```bash
# Container neu starten
docker stop discordgym-mariadb
docker rm discordgym-mariadb
# Dann Setup-Script erneut ausführen
```

### **Port bereits belegt:**
```bash
# Prüfen welcher Prozess Port 3000/4200 verwendet
netstat -ano | findstr :3000
netstat -ano | findstr :4200
```

### **Node.js/NPM Probleme:**
```bash
# Cache leeren
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 **Feedback sammeln**
- Welche Funktionen funktionieren gut?
- Wo gibt es Bugs oder Probleme?
- Ist die Benutzeroberfläche intuitiv?
- Performance-Probleme bei vielen Nachrichten?
- Mobile Bedienung zufriedenstellend?

## 🛑 **Cleanup nach Tests**
```bash
# Alle Container stoppen
docker stop discordgym-mariadb
docker rm discordgym-mariadb

# Backend-Prozess beenden
# Ctrl+C im Backend-Terminal
```
