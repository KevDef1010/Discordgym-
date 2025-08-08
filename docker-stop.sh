#!/bin/bash

echo "================================="
echo "  Stopping DiscordGym Containers"
echo "================================="

docker-compose -f docker-compose.dev.yml stop

echo ""
echo "Containers stopped."
echo ""
echo "To start again: ./docker-start.sh"
echo "To rebuild:     ./docker-build.sh"
echo ""
