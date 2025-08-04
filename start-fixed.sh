#!/bin/bash

echo "=============================================="
echo "  DiscordGym - Sichere Entwicklungsumgebung"
echo "=============================================="

cd "$(dirname "$0")/server"

echo "1. Korrigiere Datenbankverbindungsstring..."
node fix-connection.js

echo ""
echo "2. Starte Server mit NODE_ENV=development..."
export NODE_ENV=development
node dist/main.js
