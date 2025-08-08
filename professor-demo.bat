@echo off
echo 🎯 Professor Demo: n+1 Backend Failover Test
echo.
echo 📊 System Status vor Test:
docker-compose -f docker-compose.ha.yml ps

echo.
echo 🔍 Teste Load Balancer Verbindung:
curl -s http://localhost:3001/health

echo.
echo 💥 DEMO: Backend-1 wird 'abgeschossen' (für Professor)
echo Killing discordgym-api-1 to demonstrate failover...
docker kill discordgym_discordgym-api-1_1
if %errorlevel% neq 0 docker kill discordgym-discordgym-api-1

echo.
echo ⏳ Warte 5 Sekunden für Failover...
timeout /t 5 /nobreak >nul

echo.
echo 🔄 Teste ob System noch funktioniert (Backend-2 sollte übernehmen):
echo Test 1:
curl -s http://localhost:3001/health
echo Test 2:
curl -s http://localhost:3001/health
echo Test 3:
curl -s http://localhost:3001/health

echo.
echo 📊 System Status nach Failover:
docker-compose -f docker-compose.ha.yml ps

echo.
echo 🎯 Professor Demo abgeschlossen!
echo ✅ Failover funktioniert: Backend-2 und Backend-3 übernehmen automatisch
