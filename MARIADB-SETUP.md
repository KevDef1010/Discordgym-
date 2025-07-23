# 🗄️ MariaDB Setup für DiscordGym

## � **Option 1: Docker (Empfohlen - Einfach & Sauber)**

```bash
# MariaDB Container starten
docker run --name discordgym-mariadb \
  -e MYSQL_ROOT_PASSWORD=discordgym123 \
  -e MYSQL_DATABASE=discordgym \
  -e MYSQL_USER=discordgym \
  -e MYSQL_PASSWORD=discordgym123 \
  -p 3306:3306 \
  -d mariadb:latest

# Container Status prüfen
docker ps

# Container Logs anzeigen
docker logs discordgym-mariadb
```

### **🎯 Vorteile Docker:**
- ✅ **Sauber**: Keine lokale MariaDB Installation
- ✅ **Einfach**: Ein Befehl und fertig
- ✅ **Isoliert**: Läuft separat vom System
- ✅ **Löschbar**: Container weg = MariaDB weg

---

## 📥 **Option 2: Lokale Installation**

### **Windows:**
1. Download: https://mariadb.org/download/
2. Installer ausführen
3. Setup-Optionen:
   - Root Password: `discordgym123`
   - Create Database: `discordgym`
   - Port: `3306` (Standard)

### **Alternative - Chocolatey:**
```bash
choco install mariadb
```

### **Linux:**
```bash
sudo apt update
sudo apt install mariadb-server
sudo mysql_secure_installation
```

### **macOS - Homebrew:**
```bash
brew install mariadb
brew services start mariadb
```

## 🔧 Database Setup

### **Nach Installation:**
```sql
-- MariaDB Console öffnen
mysql -u root -p

-- Database erstellen
CREATE DATABASE discordgym;
CREATE USER 'discordgym'@'localhost' IDENTIFIED BY 'discordgym123';
GRANT ALL PRIVILEGES ON discordgym.* TO 'discordgym'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## ✅ Connection Test
```bash
mysql -u discordgym -p discordgym
# Password: discordgym123
```

## 🚀 Quick Start mit Docker (falls verfügbar)
```bash
docker run --name mariadb-discordgym \
  -e MYSQL_ROOT_PASSWORD=discordgym123 \
  -e MYSQL_DATABASE=discordgym \
  -e MYSQL_USER=discordgym \
  -e MYSQL_PASSWORD=discordgym123 \
  -p 3306:3306 -d mariadb:latest
```
