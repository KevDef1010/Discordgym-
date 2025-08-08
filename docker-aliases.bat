@echo off
REM Docker Aliases für Windows

REM Einfache Docker Befehle
doskey dstart=docker-compose -f docker-compose.dev.yml up -d
doskey dstop=docker-compose -f docker-compose.dev.yml stop
doskey dbuild=docker-compose -f docker-compose.dev.yml up -d --build --force-recreate
doskey dstatus=docker-compose -f docker-compose.dev.yml ps
doskey dlogs=docker-compose -f docker-compose.dev.yml logs -f

echo Docker Aliases wurden eingerichtet!
echo.
echo Verfügbare Befehle:
echo   dstart  - Startet alle Container (smart)
echo   dbuild  - Baut alle Container neu
echo   dstop   - Stoppt alle Container
echo   dstatus - Zeigt Container Status
echo   dlogs   - Zeigt Container Logs
echo.
echo Beispiel: Tippen Sie einfach "dstart" und Enter
