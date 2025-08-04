#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "  ██████╗ ██╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗  ██████╗██╗   ██╗███╗   ███╗"
echo "  ██╔══██╗██║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝╚██╗ ██╔╝████╗ ████║"
echo "  ██║  ██║██║███████╗██║     ██║   ██║██████╔╝██║  ██║██║  ███╗╚████╔╝ ██╔████╔██║"
echo "  ██║  ██║██║╚════██║██║     ██║   ██║██╔══██╗██║  ██║██║   ██║ ╚██╔╝  ██║╚██╔╝██║"
echo "  ██████╔╝██║███████║╚██████╗╚██████╔╝██║  ██║██████╔╝╚██████╔╝  ██║   ██║ ╚═╝ ██║"
echo "  ╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝   ╚═╝   ╚═╝     ╚═╝"
echo -e "${NC}"
echo -e "${BLUE}                              🔒 SECURE SERVER STARTUP 🔒${NC}"
echo

cd "$(dirname "$0")/server"

echo -e "${YELLOW}🔧 Installing dependencies if needed...${NC}"
npm install --silent

echo
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

echo
echo -e "${GREEN}🚀 Starting secure server...${NC}"
echo -e "${YELLOW}⚠️  You will be prompted for:${NC}"
echo "   1. Database Password"
echo "   2. Admin Authentication"
echo

npm run start:prod
