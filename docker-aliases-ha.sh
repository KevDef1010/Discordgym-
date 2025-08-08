#!/bin/bash
# High-Availability Docker Aliases

# HA Docker Befehle (2 Backend Container)
alias hastart='docker-compose -f docker-compose.ha.yml up -d'
alias hastop='docker-compose -f docker-compose.ha.yml stop'
alias habuild='docker-compose -f docker-compose.ha.yml up -d --build --force-recreate'
alias hastatus='docker-compose -f docker-compose.ha.yml ps'
alias halogs='docker-compose -f docker-compose.ha.yml logs -f'

# Standard Docker Befehle (1 Backend Container)
alias dstart='docker-compose -f docker-compose.dev.yml up -d'
alias dstop='docker-compose -f docker-compose.dev.yml stop'
alias dbuild='docker-compose -f docker-compose.dev.yml up -d --build --force-recreate'
alias dstatus='docker-compose -f docker-compose.dev.yml ps'
alias dlogs='docker-compose -f docker-compose.dev.yml logs -f'

echo "🚀 Docker Aliases wurden eingerichtet!"
echo ""
echo "📊 Standard Setup (1 Backend):"
echo "  dstart   - Startet Standard-Setup"
echo "  dstop    - Stoppt Standard-Setup"
echo "  dbuild   - Baut Standard-Setup neu"
echo ""
echo "⚖️ High-Availability Setup (2 Backend + Load Balancer):"
echo "  hastart  - Startet HA-Setup mit Load Balancing"
echo "  hastop   - Stoppt HA-Setup"
echo "  habuild  - Baut HA-Setup neu"
echo "  hastatus - Zeigt HA-Container Status"
echo "  halogs   - Zeigt HA-Container Logs"
echo ""
echo "💡 Empfehlung: Für Entwicklung 'dstart', für Produktion 'hastart'"
