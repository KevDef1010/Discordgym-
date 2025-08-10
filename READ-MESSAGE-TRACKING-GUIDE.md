# Benachrichtigungssystem mit "Gelesen"-Markierung

## Übersicht

Das Chat-System wurde erweitert, um zu verhindern, dass bereits gelesene Nachrichten erneut als Benachrichtigungen angezeigt werden.

## Funktionsweise

### 1. Nachrichten-Tracking
- Jede Nachricht erhält einen eindeutigen Schlüssel basierend auf:
  - **Direktnachrichten**: `dm-{otherUserId}-{messageId}`
  - **Channel-Nachrichten**: `ch-{channelId}-{messageId}`

### 2. Markierung als gelesen
Nachrichten werden automatisch als "gelesen" markiert, wenn:
- Der Benutzer einen Chat oder Channel öffnet
- Der Benutzer eine neue Nachricht in einem bereits geöffneten Chat erhält

### 3. Benachrichtigungsfilterung
Das System prüft vor jeder Benachrichtigung:
- ✅ Ist es meine eigene Nachricht? → Keine Benachrichtigung
- ✅ Ist der Chat aktuell geöffnet? → Keine Benachrichtigung  
- ✅ Wurde die Nachricht bereits gelesen? → Keine Benachrichtigung

### 4. Persistente Speicherung
- Gelesene Nachrichten werden im `localStorage` gespeichert
- Maximale Anzahl: 1000 Nachrichten (um Speicher zu schonen)
- Key: `discordGym_readMessages`

## Implementierte Methoden

### Core-Funktionen
```typescript
// Initialisierung beim App-Start
initializeReadMessages(): void

// Nachricht als gelesen markieren
markMessageAsRead(messageId: string): void

// Prüfung ob Nachricht gelesen wurde
isMessageRead(messageId: string): boolean

// Ganzen Chat als gelesen markieren
markChatAsRead(chatId: string, type: 'direct' | 'channel'): void

// Entscheidung ob Benachrichtigung angezeigt werden soll
shouldShowNotification(message: any, type: 'direct' | 'channel'): boolean
```

### Integration
- **Chat-Auswahl**: Beim Öffnen eines Chats/Channels werden alle Nachrichten als gelesen markiert
- **Neue Nachrichten**: Werden automatisch als gelesen markiert wenn der Chat geöffnet ist
- **Benachrichtigungen**: Verwenden `shouldShowNotification()` um bereits gelesene Nachrichten zu filtern

## Benutzererfahrung

### Vorher
- Benachrichtigungen erschienen jedes Mal beim App-Start
- Bereits gelesene Nachrichten wurden erneut als ungelesen angezeigt
- Benutzer wurden von wiederkehrenden Benachrichtigungen gestört

### Nachher
- ✅ Benachrichtigungen erscheinen nur für wirklich neue, ungelesene Nachrichten
- ✅ Einmal gelesene Nachrichten werden nicht mehr als Benachrichtigung angezeigt
- ✅ Das System "merkt" sich über App-Neustarts hinweg, was gelesen wurde
- ✅ Saubere und intuitive Benachrichtigungserfahrung

## Technische Details

### Datenstruktur
```typescript
// Set für O(1) Lookup-Performance
private readMessages: Set<string> = new Set();

// LocalStorage-Keys
private readonly READ_MESSAGES_KEY = 'discordGym_readMessages';
private readonly MAX_READ_MESSAGES = 1000;
```

### Performance
- **Speicher-effizient**: Nur Nachrichten-IDs werden gespeichert, nicht der komplette Inhalt
- **Schnell**: Set-basierte Lookups in O(1) Zeit
- **Begrenzt**: Automatische Bereinigung alter Einträge

### Fehlerbehandlung
- Try-catch um localStorage-Fehler abzufangen
- Fallback zu leerer Set bei Parsing-Fehlern
- Graceful degradation wenn localStorage nicht verfügbar ist

## Testing

Um das System zu testen:

1. **Login durchführen** (mit Debug-Tool)
2. **Nachrichten von verschiedenen Benutzern erhalten**
3. **Chat öffnen** → Nachrichten werden als gelesen markiert
4. **App neu laden** → Keine Benachrichtigungen für bereits gelesene Nachrichten
5. **Neue Nachrichten senden** → Nur diese erscheinen als Benachrichtigungen

Das System ist jetzt bereit für produktiven Einsatz!
