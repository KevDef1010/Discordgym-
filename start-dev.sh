#!/bin/bash
echo "Starting DiscordGym in Development Mode..."
cd server
cp .env.development .env
npm run build && node dist/main.js
