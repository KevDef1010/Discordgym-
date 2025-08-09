# DiscordGym Makefile - Alternative Simple Commands
# Usage: make demo, make start, make stop, etc.

.PHONY: help demo start stop build clean reset status test kill-api logs

# Default target
help:
	@echo "DiscordGym Docker Commands (Makefile version):"
	@echo ""
	@echo "  make demo      - Quick demo setup for professor"
	@echo "  make start     - Start all containers"
	@echo "  make stop      - Stop all containers"
	@echo "  make build     - Build and start containers"
	@echo "  make clean     - Clean containers and caches"
	@echo "  make reset     - Complete system reset"
	@echo "  make status    - Show container status"
	@echo "  make test      - Test system functionality"
	@echo "  make kill-api  - Test failover (kill one API)"
	@echo "  make logs      - Show all container logs"
	@echo ""
	@echo "For more options, use: ./discord-gym.sh help"

# Quick demo setup
demo:
	@./discord-gym.sh demo

# Basic container management
start:
	@./discord-gym.sh start

stop:
	@./discord-gym.sh stop

build:
	@./discord-gym.sh build

# Cleanup commands
clean:
	@./discord-gym.sh clean

reset:
	@./discord-gym.sh reset

# Monitoring commands
status:
	@./discord-gym.sh status

test:
	@./discord-gym.sh test

logs:
	@./discord-gym.sh logs

# Failover demo
kill-api:
	@./discord-gym.sh kill-api

# Quick shortcuts for professor
up: demo
down: stop
restart:
	@./discord-gym.sh restart
