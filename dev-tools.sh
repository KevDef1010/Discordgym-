#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'  
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🛠️  DiscordGym Development & Tools Menu${NC}"
echo "======================================"
echo
echo "Choose what you want to start:"
echo
echo -e "${BLUE}1)${NC} 🔒 Secure Production Server (with password prompts)"
echo -e "${BLUE}2)${NC} 🚀 Development Server (direct start, no prompts)"
echo -e "${BLUE}3)${NC} 📊 Prisma Studio (database browser)"
echo -e "${BLUE}4)${NC} 🔄 Database Push (sync schema)"
echo -e "${BLUE}5)${NC} 🧪 Run Tests"
echo -e "${BLUE}6)${NC} 📋 Show Database Status"
echo

read -p "Enter your choice (1-6): " choice

cd "$(dirname "$0")/server"

case $choice in
    1)
        echo
        echo -e "${RED}🔒 Starting SECURE Production Server...${NC}"
        echo -e "${YELLOW}⚠️  You will be prompted for credentials!${NC}"
        npm run start:prod
        ;;
    2)
        echo
        echo -e "${GREEN}🚀 Starting Development Server...${NC}"
        cp .env.development .env 2>/dev/null
        npm run start:dev
        ;;
    3)
        echo
        echo -e "${BLUE}📊 Opening Prisma Studio...${NC}"
        cp .env.development .env 2>/dev/null
        npm run db:studio
        ;;
    4)
        echo
        echo -e "${YELLOW}🔄 Pushing Database Schema...${NC}"
        cp .env.development .env 2>/dev/null
        npm run db:push
        ;;
    5)
        echo
        echo -e "${GREEN}🧪 Running Tests...${NC}"
        cp .env.development .env 2>/dev/null
        npm test
        ;;
    6)
        echo
        echo -e "${BLUE}📋 Database Status:${NC}"
        cp .env.development .env 2>/dev/null
        echo "Database URL configured for development"
        echo "Connection: mysql://discordgym:***@localhost:3306/discordgym"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice!${NC}"
        exit 1
        ;;
esac

echo
echo -e "${GREEN}✅ Operation completed!${NC}"
