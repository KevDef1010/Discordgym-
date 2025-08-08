#!/bin/bash
# Docker Aliases für Linux/Mac

# Einfache Docker Befehle
alias dstart='docker-compose -f docker-compose.dev.yml up -d'
alias dstop='docker-compose -f docker-compose.dev.yml stop'
alias dbuild='docker-compose -f docker-compose.dev.yml up -d --build --force-recreate'
alias dstatus='docker-compose -f docker-compose.dev.yml ps'
alias dlogs='docker-compose -f docker-compose.dev.yml logs -f'

echo "Docker Aliases wurden eingerichtet!"
echo ""
echo "Verfügbare Befehle:"
echo "  dstart  - Startet alle Container (smart)"
echo "  dbuild  - Baut alle Container neu"
echo "  dstop   - Stoppt alle Container"
echo "  dstatus - Zeigt Container Status"
echo "  dlogs   - Zeigt Container Logs"
echo ""
echo "Beispiel: Tippen Sie einfach 'dstart' und Enter"
