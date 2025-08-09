#!/bin/bash

# DiscordGym Mac Startup Script
# Dieses Skript startet die DiscordGym Anwendung auf macOS

echo "🚀 DiscordGym Mac Setup & Start Script"
echo "======================================"

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgaben
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Docker Desktop prüfen
echo ""
print_info "Checking Docker Desktop..."
if ! docker --version > /dev/null 2>&1; then
    print_error "Docker is not installed or not running!"
    print_warning "Please install Docker Desktop for Mac:"
    echo "   brew install --cask docker"
    echo "   OR download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker ps > /dev/null 2>&1; then
    print_error "Docker Desktop is not running!"
    print_warning "Please start Docker Desktop and try again."
    exit 1
fi

print_status "Docker Desktop is running"

# 2. Port-Verfügbarkeit prüfen
echo ""
print_info "Checking port availability..."

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port $1 is already in use"
        print_info "Process using port $1:"
        lsof -Pi :$1 -sTCP:LISTEN
        read -p "Do you want to kill the process on port $1? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:$1 | xargs kill -9 2>/dev/null || true
            print_status "Process on port $1 terminated"
        else
            print_error "Cannot start application with port $1 occupied"
            return 1
        fi
    else
        print_status "Port $1 is available"
    fi
}

check_port 80 || exit 1
check_port 3001 || exit 1
check_port 3307 || exit 1

# 3. Shell-Skripte ausführbar machen
echo ""
print_info "Making shell scripts executable..."
chmod +x *.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
print_status "Shell scripts are now executable"

# 4. Umgebungsvariablen setzen
echo ""
print_info "Setting up environment variables..."
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
print_status "Environment variables set"

# 5. Alte Container stoppen (falls vorhanden)
echo ""
print_info "Stopping any existing containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
print_status "Existing containers stopped"

# 6. Container starten
echo ""
print_info "Starting DiscordGym containers..."
if docker-compose -f docker-compose.dev.yml up -d; then
    print_status "All containers started successfully!"
else
    print_error "Failed to start containers"
    print_info "Trying to build and start..."
    if docker-compose -f docker-compose.dev.yml up -d --build; then
        print_status "Containers built and started!"
    else
        print_error "Failed to start containers even after building"
        exit 1
    fi
fi

# 7. Warten auf Services
echo ""
print_info "Waiting for services to be ready..."
sleep 10

# 8. Container Status prüfen
echo ""
print_info "Checking container status..."
docker-compose -f docker-compose.dev.yml ps

# 9. Gesundheitsprüfung
echo ""
print_info "Performing health checks..."

# Frontend Check
if curl -s http://localhost > /dev/null; then
    print_status "Frontend is accessible at http://localhost"
else
    print_warning "Frontend might not be ready yet at http://localhost"
fi

# API Check
if curl -s http://localhost:3001/system/health > /dev/null; then
    print_status "API is accessible at http://localhost:3001"
else
    print_warning "API might not be ready yet at http://localhost:3001"
fi

# Prisma Studio Check
if curl -s http://localhost:5556 > /dev/null; then
    print_status "Prisma Studio is accessible at http://localhost:5556"
else
    print_warning "Prisma Studio might not be ready yet at http://localhost:5556"
fi

# 10. Zusammenfassung
echo ""
echo "🎉 DiscordGym Setup Complete!"
echo "============================="
echo ""
echo "📱 Application URLs:"
echo "   Frontend:      http://localhost"
echo "   API:           http://localhost:3001"
echo "   Prisma Studio: http://localhost:5556"
echo ""
echo "🛠️  Management Commands:"
echo "   View logs:     docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop all:      docker-compose -f docker-compose.dev.yml down"
echo "   Restart:       docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "🆘 Troubleshooting:"
echo "   If issues occur, run: docker-compose -f docker-compose.dev.yml logs"
echo ""

# Optional: Browser öffnen
read -p "Do you want to open the application in your browser? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_info "Opening browser..."
    open http://localhost 2>/dev/null || true
fi

echo ""
print_status "Setup complete! Happy coding! 🚀"
