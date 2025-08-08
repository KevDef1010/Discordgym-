@echo off
REM High-Availability Docker Aliases für Windows

REM HA Docker Befehle (2 Backend Container)
doskey hastart=docker-compose -f docker-compose.ha.yml up -d
doskey hastop=docker-compose -f docker-compose.ha.yml stop
doskey habuild=docker-compose -f docker-compose.ha.yml up -d --build --force-recreate
doskey hastatus=docker-compose -f docker-compose.ha.yml ps
doskey halogs=docker-compose -f docker-compose.ha.yml logs -f

REM Standard Docker Befehle (1 Backend Container)
doskey dstart=docker-compose -f docker-compose.dev.yml up -d
doskey dstop=docker-compose -f docker-compose.dev.yml stop
doskey dbuild=docker-compose -f docker-compose.dev.yml up -d --build --force-recreate
doskey dstatus=docker-compose -f docker-compose.dev.yml ps
doskey dlogs=docker-compose -f docker-compose.dev.yml logs -f

echo 🚀 Docker Aliases wurden eingerichtet!
echo.
echo 📊 Standard Setup (1 Backend):
echo   dstart   - Startet Standard-Setup
echo   dstop    - Stoppt Standard-Setup
echo   dbuild   - Baut Standard-Setup neu
echo.
echo ⚖️ High-Availability Setup (2 Backend + Load Balancer):
echo   hastart  - Startet HA-Setup mit Load Balancing
echo   hastop   - Stoppt HA-Setup
echo   habuild  - Baut HA-Setup neu
echo   hastatus - Zeigt HA-Container Status
echo   halogs   - Zeigt HA-Container Logs
echo.
echo 💡 Empfehlung: Für Entwicklung 'dstart', für Produktion 'hastart'
