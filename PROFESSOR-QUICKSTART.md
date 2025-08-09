# DiscordGym - Professor Quick Start Guide

## 🚀 Quick Demo Setup (One Command)

```bash
./discord-gym.sh demo
```

This command will:
- Build all containers from scratch
- Start the complete n+1 failover system
- Test all components automatically
- Display all access URLs

## 📋 Essential Commands

| Command | Description |
|---------|-------------|
| `./discord-gym.sh demo` | **Complete demo setup** (recommended for first run) |
| `./discord-gym.sh status` | Show current system status |
| `./discord-gym.sh test` | Test all components |
| `./discord-gym.sh kill-api` | **Demonstrate failover** (kills one API container) |
| `./discord-gym.sh clean` | Stop containers and clear caches |
| `./discord-gym.sh reset` | Complete system reset |

## 🌐 Access URLs (After Demo Setup)

- **Frontend Application**: http://localhost
- **API Load Balancer**: http://localhost:3001  
- **Database Admin**: http://localhost:5556
- **Database Direct**: localhost:3307
- **Redis Cache**: localhost:6379

## 🏗️ System Architecture

### n+1 Failover Setup
- **3x API Backend Containers**:
  - `discordgym-api-1` (primary)
  - `discordgym-api-2` (primary)  
  - `discordgym-api-3` (backup)
- **NGINX Load Balancer** with health checks
- **Automatic failover** when containers fail

### Core Components
- **Frontend**: Angular SPA with professional UI
- **Backend**: NestJS API with JWT authentication
- **Database**: MariaDB with persistent storage
- **Cache**: Redis for session management
- **Load Balancer**: NGINX with least-connection algorithm

## 🎯 Professor Demonstration Flow

### 1. Initial Setup
```bash
./discord-gym.sh demo
```
*Wait for "DEMO READY!" message*

### 2. Show Running System
```bash
./discord-gym.sh status
```

### 3. Test User Registration
- Open http://localhost
- Create a test user account
- Verify login functionality

### 4. Demonstrate n+1 Failover
```bash
./discord-gym.sh kill-api
```
- System continues working with remaining containers
- Load balancer automatically routes traffic
- Zero downtime demonstrated

### 5. Check System Health
```bash
./discord-gym.sh test
```

### 6. View Logs (Optional)
```bash
./discord-gym.sh logs
```

## 🔧 Troubleshooting

### If containers won't start:
```bash
./discord-gym.sh reset
./discord-gym.sh demo
```

### If ports are occupied:
```bash
sudo lsof -i :80 -i :3001 -i :3307 -i :5556 -i :6379
```

### If Docker issues:
```bash
sudo systemctl restart docker
./discord-gym.sh clean
./discord-gym.sh demo
```

## 📊 System Requirements

- **Docker**: 20.0+
- **Docker Compose**: 2.0+
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space
- **Ports**: 80, 3001, 3307, 5556, 6379 must be available

## 🎓 Academic Features Demonstrated

1. **Microservices Architecture**
2. **Load Balancing & Failover**
3. **Containerization with Docker**
4. **Database Persistence**
5. **Session Management**
6. **RESTful API Design**
7. **Modern Frontend Framework**
8. **Health Check Implementation**
9. **Horizontal Scaling**
10. **DevOps Best Practices**

## 📝 Additional Commands

```bash
# Show help
./discord-gym.sh help

# Build without starting
docker-compose -f docker-compose.ha.yml build

# View specific container logs
docker-compose -f docker-compose.ha.yml logs discordgym-api-1

# Access container shell
docker-compose -f docker-compose.ha.yml exec discordgym-api-1 sh

# Monitor real-time container stats
docker stats
```

---

**Created by**: Kevin  
**Date**: August 9, 2025  
**System**: n+1 High Availability Docker Setup  
**Purpose**: Academic Demonstration of Enterprise Architecture
