# 🎓 Professor Demo Commands - DiscordGym

## 🚀 One-Command Demo Start

```bash
./discord-gym.sh demo
```

**or**

```bash
make demo
```

## 📋 Essential Commands for Linux

### Option 1: Shell Script (Recommended)
```bash
./discord-gym.sh demo      # Complete demo setup
./discord-gym.sh status    # Check system status  
./discord-gym.sh kill-api  # Test failover
./discord-gym.sh test      # Test all components
./discord-gym.sh clean     # Stop and cleanup
```

### Option 2: Makefile (Alternative)
```bash
make demo        # Complete demo setup
make status      # Check system status
make kill-api    # Test failover  
make test        # Test all components
make clean       # Stop and cleanup
```

### Option 3: Direct Docker Compose
```bash
docker-compose -f docker-compose.ha.yml up --build -d   # Start everything
docker-compose -f docker-compose.ha.yml ps              # Check status
docker-compose -f docker-compose.ha.yml down            # Stop everything
```

## 🌐 Access URLs (After Demo)

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application |
| **API** | http://localhost:3001 | Load-balanced API |
| **Database Admin** | http://localhost:5556 | Prisma Studio |
| **Database** | localhost:3307 | MariaDB direct |
| **Cache** | localhost:6379 | Redis cache |

## 🎯 Demo Flow for Professor

1. **Start Demo**: `./discord-gym.sh demo`
2. **Check Status**: `./discord-gym.sh status`
3. **Test Frontend**: Open http://localhost
4. **Test Failover**: `./discord-gym.sh kill-api`
5. **Verify Still Works**: Refresh frontend
6. **Cleanup**: `./discord-gym.sh clean`

## 📊 System Architecture Demonstrated

- ✅ **n+1 High Availability** (3 API containers)
- ✅ **Load Balancing** (NGINX with health checks)
- ✅ **Auto Failover** (Container dies, system continues)
- ✅ **Microservices** (Separate containers for each service)
- ✅ **Database Persistence** (MariaDB with volumes)
- ✅ **Session Management** (Redis cache)
- ✅ **Modern Frontend** (Angular SPA)
- ✅ **RESTful API** (NestJS backend)
- ✅ **Containerization** (Docker multi-stage builds)
- ✅ **DevOps Pipeline** (Automated deployment)

---

**Quick Help**: `./discord-gym.sh help` or `make help`
