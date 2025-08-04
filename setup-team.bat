@echo off
REM DiscordGym Team Setup-Script für Windows
REM Dieses Skript setzt die Entwicklungsumgebung für DiscordGym auf

echo 🚀 DiscordGym Team Setup-Script
echo ===============================

REM 1. Überprüfe Voraussetzungen
echo 1. Überprüfe Voraussetzungen...

REM Node.js überprüfen
where node >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=1,2,3 delims=v." %%a in ('node -v') do set NODE_MAJOR=%%b
    echo ✓ Node.js ist installiert: v%NODE_MAJOR%
    
    REM Überprüfe Mindestversion (v18)
    if %NODE_MAJOR% LSS 18 (
        echo ✗ Node.js Version ist zu alt. Bitte installiere v18 oder neuer
        exit /b 1k3v0@Kevin MINGW64 /c/dev/DiscordGym (main)
$ cd server

k3v0@Kevin MINGW64 /c/dev/DiscordGym/server (main)
$ npm start

> server@0.0.1 start
> nest start

🚀 Development mode - skipping security prompts
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [NestFactory] Starting Nest application...
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] PrismaModule dependencies initialized +15ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] PassportModule dependencies initialized +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] JwtModule dependencies initialized +2ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] DatabaseModule dependencies initialized +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] AppModule dependencies initialized +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] WorkoutModule dependencies initialized +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] AdminModule dependencies initialized +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] FriendsModule dependencies initialized +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] UserModule dependencies initialized +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] AuthModule dependencies initialized +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [InstanceLoader] ChatModule dependencies initialized +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "join-user-enhanced" message +6ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "join-user" message +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "update-user-status" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "heartbeat" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "get-online-friends" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "request-friend-status" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "get-current-status" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "join-chat-room" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] FriendsGateway subscribed to the "leave-chat-room" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] ChatGateway subscribed to the "joinChat" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] ChatGateway subscribed to the "joinChannel" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] ChatGateway subscribed to the "leaveChannel" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] ChatGateway subscribed to the "sendChannelMessage" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] ChatGateway subscribed to the "sendDirectMessage" message +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] ChatGateway subscribed to the "typing" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [WebSocketsController] ChatGateway subscribed to the "stopTyping" message +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] AppController {/}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/, GET} route +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/health, GET} route +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] UserController {/users}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users/:id, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users/discord/:discordId, GET} route +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users/:id, PUT} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users/:id, DELETE} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users/:id/workouts, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/users/:id/progress, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] DatabaseController {/database}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/database/stats, GET} route +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/database/seed-simple, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/database/clear, DELETE} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/database/users-with-data, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/database/promote-admin, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] WorkoutController {/workouts}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/workouts, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/workouts, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/workouts/:id, GET} route +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/workouts/:id, PUT} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/workouts/:id, DELETE} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/workouts/user/:userId, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/workouts/user/:userId/stats, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] AuthController {/auth}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/auth/register, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/auth/login, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/auth/check, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] AdminController {/admin}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/admin/users, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/admin/users/search, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/admin/users/:id, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/admin/users/:id/role, PUT} route +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/admin/users/:id/status, PUT} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/admin/users/:id, DELETE} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/admin/stats, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] FriendsController {/friends}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/request, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/request/:friendshipId, PUT} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/list/:userId, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/requests/pending/:userId, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/requests/sent/:userId, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/search/:userId, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/:userId/remove/:friendId, DELETE} route +1ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/friends/stats/:userId, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RoutesResolver] ChatController {/chat}: +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/servers/:userId, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/servers, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/channels, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/channels/:channelId/messages, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/channels/:channelId/messages, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/direct/:userId/:friendId/messages, GET} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/direct/:friendId/messages, POST} route +0ms
[Nest] 9540  - 04.08.2025, 16:44:30     LOG [RouterExplorer] Mapped {/chat/friends/:userId, GET} route +1ms
❌ Failed to start server: PrismaClientInitializationError: The provided database string is invalid. Error parsing connection string: invalid port number in database URL. Please refer to the documentation in https://www.prisma.io/docs/reference/database-reference/connection-urls for constructing a correct connection string. In some cases, certain characters must be escaped. Please check the string for any illegal characters.
    at r (C:\dev\DiscordGym\server\node_modules\@prisma\client\src\runtime\core\engines\library\LibraryEngine.ts:440:17)
    at async Proxy.onModuleInit (C:\dev\DiscordGym\server\src\prisma\prisma.service.ts:16:5)
    at async Promise.all (index 0)
    at async callModuleInitHook (C:\dev\DiscordGym\server\node_modules\@nestjs\core\hooks\on-module-init.hook.js:43:5)
    at async NestApplication.callInitHook (C:\dev\DiscordGym\server\node_modules\@nestjs\core\nest-application-context.js:242:13)
    at async NestApplication.init (C:\dev\DiscordGym\server\node_modules\@nestjs\core\nest-application.js:103:9)
    at async NestApplication.listen (C:\dev\DiscordGym\server\node_modules\@nestjs\core\nest-application.js:175:13)
    at async bootstrap (C:\dev\DiscordGym\server\src\main.ts:72:3) {
  clientVersion: '6.12.0',
  errorCode: 'P1013',
  retryable: undefined
}
    )
) else (
    echo ✗ Node.js ist nicht installiert. Bitte installiere Node.js v18 oder neuer
    exit /b 1
)

REM Docker überprüfen
where docker >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Docker ist installiert
) else (
    echo ⚠ Docker ist nicht installiert. Für Docker-basierte Entwicklung wird Docker benötigt
)

REM Git überprüfen
where git >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Git ist installiert
) else (
    echo ✗ Git ist nicht installiert. Bitte installiere Git
    exit /b 1
)

REM 2. Abhängigkeiten installieren
echo.
echo 2. Installiere Abhängigkeiten...

REM Server-Abhängigkeiten
echo    Installiere Server-Abhängigkeiten...
cd server
call npm install
if %errorlevel% == 0 (
    echo ✓ Server-Abhängigkeiten erfolgreich installiert
) else (
    echo ✗ Fehler beim Installieren der Server-Abhängigkeiten
    exit /b 1
)

REM Client-Abhängigkeiten
echo    Installiere Client-Abhängigkeiten...
cd ..\client
call npm install
if %errorlevel% == 0 (
    echo ✓ Client-Abhängigkeiten erfolgreich installiert
) else (
    echo ✗ Fehler beim Installieren der Client-Abhängigkeiten
    exit /b 1
)

cd ..

REM 3. Datenbank einrichten
echo.
echo 3. Datenbank einrichten...

set /p use_docker="Möchtest du Docker für die Datenbank verwenden? (j/n): "
if /i "%use_docker%" == "j" (
    REM Docker-Datenbank starten
    echo    Starte MariaDB in Docker...
    docker run --name discordgym-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=discordgym -e MYSQL_USER=discordgym -e MYSQL_PASSWORD=discordgym123 -p 3306:3306 -d mariadb:10.11
    
    if %errorlevel% == 0 (
        echo ✓ MariaDB-Container erfolgreich gestartet
        
        REM Warten, bis die Datenbank bereit ist
        echo    Warte, bis die Datenbank bereit ist...
        timeout /t 10 /nobreak
    ) else (
        echo ✗ Fehler beim Starten des MariaDB-Containers
        echo ⚠ Überprüfe, ob der Container bereits existiert oder Port 3306 bereits belegt ist
        echo ⚠ Du kannst versuchen: docker rm discordgym-db
    )
) else (
    echo ⚠ Bitte stelle sicher, dass du eine MariaDB/MySQL auf localhost:3306 hast
    echo ⚠ Benutzername: discordgym, Passwort: discordgym123, Datenbank: discordgym
    
    echo Drücke eine Taste, wenn deine Datenbank bereit ist...
    pause >nul
)

REM 4. Prisma Migrationen ausführen
echo.
echo 4. Führe Prisma Migrationen aus...

cd server
call npx prisma migrate dev --name init
if %errorlevel% == 0 (
    echo ✓ Prisma-Migration erfolgreich ausgeführt
) else (
    echo ✗ Fehler bei der Prisma-Migration
    exit /b 1
)

REM 5. Seed-Daten einfügen
echo.
echo 5. Füge Seed-Daten ein...
call npx prisma db seed
if %errorlevel% == 0 (
    echo ✓ Seed-Daten erfolgreich eingefügt
) else (
    echo ✗ Fehler beim Einfügen der Seed-Daten
    exit /b 1
)

cd ..

REM 6. Umgebungsvariablen einrichten
echo.
echo 6. Umgebungsvariablen prüfen...

REM Server .env prüfen
if exist "server\.env" (
    echo ✓ server/.env existiert bereits
) else (
    echo    Erstelle server/.env...
    (
        echo # Development Environment
        echo NODE_ENV=development
        echo DATABASE_URL="mysql://discordgym:discordgym123@localhost:3306/discordgym"
        echo JWT_SECRET="DgSecure2024!JWT#Secret$Random%%Token&Key*2025"
        echo JWT_REFRESH_SECRET="DgRefresh2024!JWT#Secret$Random%%Token&Key*2025"
        echo.
        echo # CORS Settings
        echo CORS_ORIGIN="http://localhost:4200,http://localhost:4201,http://localhost:4202"
        echo.
        echo # Socket.IO Settings
        echo SOCKET_CORS_ORIGIN="http://localhost:4200,http://localhost:4201,http://localhost:4202"
        echo.
        echo # Server Port
        echo PORT=3000
        echo.
        echo # File Upload
        echo MAX_FILE_SIZE=5242880
        echo UPLOAD_DIR="uploads"
    ) > server\.env
    echo ✓ server/.env erfolgreich erstellt
)

REM 7. Zeige Nutzungshinweise
echo.
echo ✅ DiscordGym-Setup abgeschlossen!
echo.
echo Anwendung starten:
echo    Option 1: start.bat verwenden
echo    Option 2: Manuell starten:
echo       - Terminal 1: cd server ^&^& npm run start:dev
echo       - Terminal 2: cd client ^&^& npm run start

echo.
echo Wichtige URLs:
echo    Frontend: http://localhost:4201
echo    Backend API: http://localhost:3000
echo    Prisma Studio: npx prisma studio (im server-Verzeichnis)

echo.
echo Test-Benutzer:
echo    Admin: admin@discordgym.com / password123
echo    Normaler Benutzer: user@discordgym.com / password123

echo.
echo Docker-Compose für vollständige Entwicklungsumgebung:
echo    docker-compose -f docker-compose.dev.yml up -d

echo.
echo Viel Spaß beim Entwickeln!
pause
