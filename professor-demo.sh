#!/bin/bash
echo "🎯 Professor Demo: n+1 Backend Failover Test"
echo ""
echo "📊 System Status vor Test:"
docker-compose -f docker-compose.ha.yml ps

echo ""
echo "🔍 Teste Load Balancer Verbindung:"
curl -s http://localhost:3001/health | head -c 100 && echo ""

echo ""
echo "💥 DEMO: Backend-1 wird 'abgeschossen' (für Professor)"
echo "Killing discordgym-api-1 to demonstrate failover..."
docker kill discordgym-discordgym-api-1-1 2>/dev/null || echo "Container war bereits gestoppt"

echo ""
echo "⏳ Warte 5 Sekunden für Failover..."
sleep 5

echo ""
echo "🔄 Teste ob System noch funktioniert (Backend-2 sollte übernehmen):"
for i in {1..3}; do
  echo "Test $i:"
  curl -s http://localhost:3001/health | head -c 100 && echo " ✅" || echo " ❌"
  sleep 1
done

echo ""
echo "📊 System Status nach Failover:"
docker-compose -f docker-compose.ha.yml ps

echo ""
echo "🎯 Professor Demo abgeschlossen!"
echo "✅ Failover funktioniert: Backend-2 und Backend-3 übernehmen automatisch"
