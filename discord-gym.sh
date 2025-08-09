#!/bin/bash

# DiscordGym Docker Management Script
# Author: Kevin
# Date: August 9, 2025
# Description: Simple commands to manage DiscordGym Docker containers

set -e  # Exit on any error

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.ha.yml"
PROJECT_NAME="discordgym"

# Helper function to print colored output
print_status() {
    echo -e "${BLUE}[DiscordGym]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_help() {
    echo -e "${BLUE}DiscordGym Docker Management Commands:${NC}"
    echo ""
    echo "  ${GREEN}./discord-gym.sh start${NC}     - Start all containers (development mode)"
    echo "  ${GREEN}./discord-gym.sh build${NC}     - Build and start all containers"
    echo "  ${GREEN}./discord-gym.sh stop${NC}      - Stop all containers"
    echo "  ${GREEN}./discord-gym.sh restart${NC}   - Restart all containers"
    echo "  ${GREEN}./discord-gym.sh clean${NC}     - Stop and remove containers, clear caches"
    echo "  ${GREEN}./discord-gym.sh reset${NC}     - Complete reset (removes everything including volumes)"
    echo "  ${GREEN}./discord-gym.sh status${NC}    - Show container status"
    echo "  ${GREEN}./discord-gym.sh logs${NC}      - Show logs from all containers"
    echo "  ${GREEN}./discord-gym.sh test${NC}      - Test if system is working"
    echo "  ${GREEN}./discord-gym.sh demo${NC}      - Quick demo setup for professor"
    echo ""
    echo -e "${YELLOW}High Availability (n+1 Failover) Demo:${NC}"
    echo "  ${GREEN}./discord-gym.sh demo${NC}      - Start demo setup"
    echo "  ${GREEN}./discord-gym.sh kill-api${NC}  - Kill one API container to test failover"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./discord-gym.sh demo     # Quick start for professor demonstration"
    echo "  ./discord-gym.sh status   # Check what's running"
    echo "  ./discord-gym.sh reset    # Complete cleanup"
}

# Function to start containers
start_containers() {
    print_status "Starting DiscordGym containers..."
    docker-compose -f $COMPOSE_FILE up -d
    print_success "All containers started!"
    show_status
}

# Function to build and start containers
build_containers() {
    print_status "Building and starting DiscordGym containers..."
    docker-compose -f $COMPOSE_FILE up --build -d
    print_success "All containers built and started!"
    show_status
}

# Function to stop containers
stop_containers() {
    print_status "Stopping DiscordGym containers..."
    docker-compose -f $COMPOSE_FILE stop
    print_success "All containers stopped!"
}

# Function to restart containers
restart_containers() {
    print_status "Restarting DiscordGym containers..."
    docker-compose -f $COMPOSE_FILE restart
    print_success "All containers restarted!"
    show_status
}

# Function to clean containers and caches
clean_containers() {
    print_status "Cleaning containers and caches..."
    docker-compose -f $COMPOSE_FILE down
    docker system prune -f
    docker volume prune -f
    print_success "Containers stopped and caches cleared!"
}

# Function to completely reset everything
reset_everything() {
    print_warning "This will remove ALL containers, images, volumes, and data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Performing complete reset..."
        docker-compose -f $COMPOSE_FILE down --rmi all --volumes --remove-orphans
        docker system prune -af --volumes
        print_success "Complete reset finished!"
    else
        print_warning "Reset cancelled."
    fi
}

# Function to show container status
show_status() {
    print_status "Container Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    print_status "System Resources:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -8
}

# Function to show logs
show_logs() {
    print_status "Showing logs from all containers (last 20 lines each):"
    docker-compose -f $COMPOSE_FILE logs --tail=20
}

# Function to test system
test_system() {
    print_status "Testing DiscordGym system..."
    
    # Test frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        print_success "Frontend accessible at http://localhost"
    else
        print_error "Frontend not accessible!"
    fi
    
    # Test API via load balancer
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
        print_success "API accessible via load balancer at http://localhost:3001"
    else
        print_error "API not accessible via load balancer!"
    fi
    
    # Test database
    if docker-compose -f $COMPOSE_FILE exec -T db mysqladmin ping -h localhost --silent; then
        print_success "Database is running"
    else
        print_error "Database connection failed!"
    fi
    
    # Test Redis
    if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is running"
    else
        print_error "Redis connection failed!"
    fi
    
    print_status "Test completed!"
}

# Function for professor demo setup
demo_setup() {
    print_status "Setting up DiscordGym for professor demonstration..."
    print_status "This includes n+1 backend failover architecture"
    
    # Build and start everything
    build_containers
    
    # Wait for containers to be ready
    print_status "Waiting for containers to initialize..."
    sleep 15
    
    # Test the system
    test_system
    
    echo ""
    print_success "DEMO READY!"
    echo ""
    echo -e "${BLUE}Professor Demo Information:${NC}"
    echo -e "  🌐 Frontend:        ${GREEN}http://localhost${NC}"
    echo -e "  🔧 API Load Balancer: ${GREEN}http://localhost:3001${NC}"
    echo -e "  📊 Database Admin:   ${GREEN}http://localhost:5556${NC}"
    echo -e "  🗄️  Database Port:    ${GREEN}localhost:3307${NC}"
    echo -e "  📦 Redis Cache:      ${GREEN}localhost:6379${NC}"
    echo ""
    echo -e "${YELLOW}Architecture:${NC}"
    echo -e "  • 3x API Backend Containers (n+1 failover)"
    echo -e "  • NGINX Load Balancer with health checks"
    echo -e "  • MariaDB Database with persistent storage"
    echo -e "  • Redis for session management"
    echo -e "  • Angular Frontend with professional UI"
    echo ""
    echo -e "${BLUE}To test failover:${NC} ./discord-gym.sh kill-api"
    echo -e "${BLUE}To check status:${NC}  ./discord-gym.sh status"
}

# Function to kill one API container (for failover demo)
kill_api_container() {
    print_status "Killing one API container to demonstrate failover..."
    
    # Kill API container 1
    docker-compose -f $COMPOSE_FILE stop discordgym-api-1
    
    print_warning "API Container 1 stopped!"
    print_status "Load balancer should automatically route to remaining containers"
    
    # Test if system still works
    sleep 3
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
        print_success "Failover successful! System still operational with n+1 architecture"
    else
        print_error "Failover test failed!"
    fi
    
    echo ""
    print_status "To restart the killed container:"
    echo "  docker-compose -f $COMPOSE_FILE start discordgym-api-1"
}

# Main script logic
case "${1:-help}" in
    "start")
        start_containers
        ;;
    "build")
        build_containers
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        restart_containers
        ;;
    "clean")
        clean_containers
        ;;
    "reset")
        reset_everything
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "test")
        test_system
        ;;
    "demo")
        demo_setup
        ;;
    "kill-api")
        kill_api_container
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
