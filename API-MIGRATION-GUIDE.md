# API Endpoints Migration Guide

## 🔄 API-Endpoint-Umbenennungen

### ✅ Bereits umbenannt:

#### 🔐 Authentication (auth → user)
```diff
- POST /auth/register        → POST /user/register
- POST /auth/login           → POST /user/login  
- GET  /auth/check           → GET  /user/exists
- DELETE /auth/account       → DELETE /user/delete-account
```

#### 👥 User Management (users → user)
```diff
- POST /users                → POST /user/create
- GET  /users                → GET  /user/list
- GET  /users/:id            → GET  /user/profile/:id
- PUT  /users/:id            → PUT  /user/update/:id
- GET  /users/:id/workouts   → GET  /user/:id/workouts
- GET  /users/:id/progress   → GET  /user/:id/progress
```

#### 🤝 Friends (friends → social)
```diff
- Controller: @Controller('friends') → @Controller('social')
- POST /friends/request              → POST /social/friend-request
```

### 🔄 Noch umzubenennen:

#### 🤝 Social (Fortsetzung)
```diff
- PUT  /friends/request/:id          → PUT  /social/friend-request/:id
- GET  /friends/list/:userId         → GET  /social/:userId/friends  
- GET  /friends/requests/pending     → GET  /social/:userId/friend-requests
- GET  /friends/search/:userId       → GET  /social/:userId/search-users
- DELETE /friends/:userId/remove     → DELETE /social/:userId/unfriend/:friendId
- GET  /friends/stats/:userId        → GET  /social/:userId/stats
```

#### 💬 Chat (chat → communication)
```diff
- @Controller('chat')                → @Controller('communication')
- GET  /chat/servers/:userId         → GET  /communication/servers/:userId
- POST /chat/servers                 → POST /communication/create-server
- POST /chat/channels                → POST /communication/create-channel
- GET  /chat/channels/:id/messages   → GET  /communication/channel/:id/messages
- POST /chat/channels/:id/messages   → POST /communication/channel/:id/send-message
- POST /chat/direct/:userId          → POST /communication/direct/:userId
- GET  /chat/invites/:code           → GET  /communication/join/:code
```

#### 🏋️ Fitness (workouts → fitness)
```diff
- @Controller('workouts')            → @Controller('fitness')
- POST /workouts                     → POST /fitness/create-workout
- GET  /workouts                     → GET  /fitness/workouts
- GET  /workouts/:id                 → GET  /fitness/workout/:id
- PUT  /workouts/:id                 → PUT  /fitness/workout/:id/update
- DELETE /workouts/:id               → DELETE /fitness/workout/:id/delete
- GET  /workouts/user/:userId        → GET  /fitness/user/:userId/workouts
- GET  /workouts/user/:userId/stats  → GET  /fitness/user/:userId/stats
```

#### 🛠️ Admin (admin → management)
```diff
- @Controller('admin')               → @Controller('management')
- GET  /admin/users                  → GET  /management/users
- GET  /admin/users/search           → GET  /management/users/search
- GET  /admin/users/:id              → GET  /management/user/:id
- PUT  /admin/users/:id/role         → PUT  /management/user/:id/role
- PUT  /admin/users/:id/status       → PUT  /management/user/:id/status
- DELETE /admin/users/:id            → DELETE /management/user/:id/delete
- GET  /admin/stats                  → GET  /management/statistics
```

#### 🗄️ Database (database → system)
```diff
- @Controller('database')            → @Controller('system')
- GET  /database/stats               → GET  /system/database-stats
- POST /database/seed-simple         → POST /system/seed-data
- DELETE /database/clear             → DELETE /system/clear-database
- POST /database/promote-admin       → POST /system/promote-admin
```

#### 💊 Health (health → system)
```diff
- @Controller('health')              → @Controller('system')
- GET  /health                       → GET  /system/health
- GET  /                             → GET  /system/status
```

## 📋 Neue API-Struktur (Ziel)

```
/user/
  ├── register
  ├── login
  ├── exists
  ├── delete-account
  ├── create
  ├── list
  ├── profile/:id
  ├── update/:id
  └── :id/workouts

/social/
  ├── friend-request
  ├── friend-request/:id
  ├── :userId/friends
  ├── :userId/friend-requests
  ├── :userId/search-users
  ├── :userId/unfriend/:friendId
  └── :userId/stats

/communication/
  ├── servers/:userId
  ├── create-server
  ├── create-channel
  ├── channel/:id/messages
  ├── channel/:id/send-message
  ├── direct/:userId
  └── join/:code

/fitness/
  ├── create-workout
  ├── workouts
  ├── workout/:id
  ├── workout/:id/update
  ├── workout/:id/delete
  ├── user/:userId/workouts
  └── user/:userId/stats

/management/
  ├── users
  ├── users/search
  ├── user/:id
  ├── user/:id/role
  ├── user/:id/status
  ├── user/:id/delete
  └── statistics

/system/
  ├── health
  ├── status
  ├── database-stats
  ├── seed-data
  ├── clear-database
  └── promote-admin
```

## 🎯 Vorteile der neuen Struktur:
- ✅ **Semantisch klar**: Endpoint-Namen beschreiben die Aktion
- ✅ **Gruppiert**: Verwandte Funktionen sind zusammen
- ✅ **Konsistent**: Einheitliche Namenskonventionen
- ✅ **REST-konform**: Bessere HTTP-Verb-Nutzung
- ✅ **Skalierbar**: Einfach erweiterbar
- ✅ **Dokumentation**: Selbsterklärende API
