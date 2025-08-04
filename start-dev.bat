@echo off
echo Starting DiscordGym in Development Mode...
cd server
copy .env.development .env
npm run build && node dist/main.js
pause
