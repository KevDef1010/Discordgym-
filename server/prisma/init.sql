-- Grundlegende MariaDB Initialisierung für DiscordGym
-- Diese Datei wird automatisch beim ersten Container-Start ausgeführt

-- Erstelle Database falls sie nicht existiert
CREATE DATABASE IF NOT EXISTS discordgym;

-- Nutze die Database
USE discordgym;

-- Erstelle User falls er nicht existiert
CREATE USER IF NOT EXISTS 'discordgym'@'%' IDENTIFIED BY 'discordgym123';

-- Gebe alle Rechte auf die Database
GRANT ALL PRIVILEGES ON discordgym.* TO 'discordgym'@'%';

-- Aktualisiere Privilegien
FLUSH PRIVILEGES;

-- Zeige bestehende Datenbanken
SHOW DATABASES;
