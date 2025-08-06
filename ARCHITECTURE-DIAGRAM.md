# 🏗️ DiscordGym - System Architektur

## 📊 Erweiterte Systemarchitektur

```mermaid
graph TB
    subgraph "Frontend (Angular 20)"
        A[Browser Client<br/>app.your-domain.com]
        B[Auth Service]
        C[Dashboard]
        D[Login/Register]
        E[Route Guards]
        N[Socket.IO Client]
    end
    
    subgraph "Load Balancer & Reverse Proxy"
        T[NGINX]
        U[SSL/TLS Termination]
        W[Rate Limiting]
        X[Static Content Cache]
    end
    
    subgraph "Backend (NestJS)"
        F[API Server<br/>api.your-domain.com]
        G[Auth Controller]
        H[User Controller]
        I[Workout Controller]
        J[Auth Service<br/>JWT & Security]
        O[WebSocket Gateway]
        P[Friends Gateway]
        Q[Chat Gateway]
    end
    
    subgraph "Cache & Session Layer"
        R[Redis<br/>Primary]
        S[Redis<br/>Replica]
        AA[Socket.IO State]
        AB[Session Storage]
        AC[Message Queue]
        AD[Rate Limiting Data]
    end
    
    subgraph "Database"
        K[MariaDB<br/>Primary]
        Y[MariaDB<br/>Replica]
        L[Prisma ORM]
        M[Prisma Studio<br/>Development Only]
    end

    subgraph "Security Layer"
        V[Auth Guards]
        Z[JWT Validation]
        ZA[API Gateway]
    end
    
    %% Client connections
    A --> T
    
    %% NGINX handling
    T --> U
    T --> W
    T --> X
    T --> F
    T --> O
    
    %% Frontend service connections
    B --> G
    C --> H
    D --> G
    E --> B
    N --> O
    
    %% Backend service connections
    G --> J
    H --> L
    I --> L
    J --> L
    F --> V
    V --> Z
    
    %% WebSocket connections
    O --> R
    P --> R
    Q --> R
    
    %% Redis connections
    R --> S
    R --> AA
    R --> AB
    R --> AC
    R --> AD
    W --> AD
    
    %% Database connections
    L --> K
    K --> Y
    M --> K
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style K fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    style Y fill:#e8f5e8,stroke-dasharray:5 5
    style R fill:#fff8e1,stroke:#ff6f00,stroke-width:2px
    style S fill:#fff8e1,stroke-dasharray:5 5
    style T fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    style O fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
```

## 📊 Systemscale Architektur mit NGINX und Redis

```mermaid
graph TB
    subgraph "Client Layer"
        A[Browser Clients]
        B[Mobile Clients]
    end
    
    subgraph "Edge Network"
        C[CDN]
        D[DNS Load Balancing]
    end
    
    subgraph "Load Balancing Layer"
        E[NGINX Cluster]
        F[SSL Termination]
        G[Request Routing]
    end
    
    subgraph "Application Layer"
        H[NestJS Server Cluster]
        I[Socket.IO Nodes]
        J[API Gateway]
        K[Service Workers]
    end
    
    subgraph "Caching Layer"
        L[Redis Cluster]
        M[Redis Sentinel]
        N[Session Store]
        O[Real-time Data]
        P[API Cache]
    end
    
    subgraph "Database Layer"
        Q[MariaDB Primary]
        R[MariaDB Replicas]
        S[Database Backups]
    end
    
    subgraph "Monitoring & Logging"
        T[Prometheus]
        U[Grafana]
        V[Centralized Logging]
    end
    
    A --> C
    B --> C
    C --> E
    D --> E
    E --> F
    E --> G
    G --> H
    G --> I
    H --> J
    H --> K
    H --> L
    I --> L
    L --> M
    L --> N
    L --> O
    L --> P
    H --> Q
    Q --> R
    Q --> S
    H --> T
    I --> T
    L --> T
    Q --> T
    T --> U
    H --> V
    I --> V
    
    style A fill:#bbdefb
    style E fill:#c5cae9,stroke:#3f51b5,stroke-width:2px
    style H fill:#e1bee7,stroke:#9c27b0,stroke-width:2px
    style L fill:#ffe0b2,stroke:#ff6f00,stroke-width:2px
    style Q fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px
    style T fill:#ffecb3
```

## 🔐 Authentifizierung Flow

```mermaid
sequenceDiagram
    participant User
    participant Angular
    participant NestJS
    participant Database
    participant Redis
    
    User->>Angular: Registrierung
    Angular->>NestJS: POST /auth/register
    NestJS->>NestJS: generateDiscordId()
    NestJS->>NestJS: bcrypt.hash(password)
    NestJS->>Database: Speichere User
    Database-->>NestJS: User created
    NestJS->>NestJS: JWT Token generieren
    NestJS->>Redis: Cache user session
    NestJS-->>Angular: JWT Token & Refresh Token
    Angular-->>User: Dashboard redirect
    
    Note over Angular,NestJS: Security Layer: Passwort-Prompt im Production Mode
    Note over NestJS,Redis: Session-Tracking für mehrere Geräte
```

## 🗂️ Module Struktur

```mermaid
graph LR
    subgraph "NestJS Modules"
        AM[App Module]
        PM[Prisma Module]
        UM[User Module]
        AUM[Auth Module]
        WM[Workout Module]
        DM[Database Module]
        CM[Chat Module]
        FM[Friends Module]
        ADM[Admin Module]
    end
    
    AM --> PM
    AM --> UM
    AM --> AUM
    AM --> WM
    AM --> DM
    AM --> CM
    AM --> FM
    AM --> ADM
    
    UM --> PM
    AUM --> PM
    WM --> PM
    DM --> PM
    CM --> PM
    FM --> PM
    ADM --> PM
    
    CM --> UM
    FM --> UM
    ADM --> UM
    
    CM -.-> FM
    
    classDef core fill:#f9f9f9,stroke:#333,stroke-width:2px
    classDef feature fill:#e1f5fe,stroke:#333,stroke-width:1px
    
    class AM,PM core
    class UM,AUM,WM,DM,CM,FM,ADM feature
```

## 🚀 Deployment und Skalierung mit NGINX und Redis

```mermaid
flowchart TB
    subgraph "Production Environment"
        subgraph "Load Balancer Tier"
            LB1[NGINX Primary]
            LB2[NGINX Secondary]
        end
        
        subgraph "Web Application Tier"
            A1[Angular Instance 1]
            A2[Angular Instance 2]
            A3[Angular Instance n]
        end
        
        subgraph "API Tier"
            N1[NestJS Instance 1]
            N2[NestJS Instance 2]
            N3[NestJS Instance n]
        end
        
        subgraph "Cache Tier"
            R1[Redis Master]
            R2[Redis Replica 1]
            R3[Redis Replica 2]
            RS[Redis Sentinel]
        end
        
        subgraph "Database Tier"
            DB1[MariaDB Master]
            DB2[MariaDB Slave]
        end
        
        subgraph "Storage Tier"
            S1[File Storage]
            S2[Backup Storage]
        end
    end
    
    Client1[Web Clients] --> LB1 & LB2
    Mobile[Mobile Clients] --> LB1 & LB2
    
    LB1 & LB2 --> A1 & A2 & A3
    LB1 & LB2 --> N1 & N2 & N3
    
    A1 & A2 & A3 --> N1 & N2 & N3
    
    N1 & N2 & N3 --> R1
    R1 --> R2 & R3
    RS --> R1 & R2 & R3
    
    N1 & N2 & N3 --> DB1
    DB1 --> DB2
    
    N1 & N2 & N3 --> S1
    DB1 & DB2 --> S2
    
    style LB1 fill:#c5cae9,stroke:#3f51b5,stroke-width:2px
    style LB2 fill:#c5cae9,stroke:#3f51b5,stroke-width:1px,stroke-dasharray:5 5
    style A1 fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style A2 fill:#e1f5fe,stroke:#0277bd,stroke-width:1px,stroke-dasharray:5 5
    style A3 fill:#e1f5fe,stroke:#0277bd,stroke-width:1px,stroke-dasharray:5 5
    style N1 fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style N2 fill:#f3e5f5,stroke:#9c27b0,stroke-width:1px,stroke-dasharray:5 5
    style N3 fill:#f3e5f5,stroke:#9c27b0,stroke-width:1px,stroke-dasharray:5 5
    style R1 fill:#fff8e1,stroke:#ff6f00,stroke-width:2px
    style R2 fill:#fff8e1,stroke:#ff6f00,stroke-width:1px,stroke-dasharray:5 5
    style R3 fill:#fff8e1,stroke:#ff6f00,stroke-width:1px,stroke-dasharray:5 5
    style DB1 fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    style DB2 fill:#e8f5e8,stroke:#1b5e20,stroke-width:1px,stroke-dasharray:5 5
```

## 📋 NGINX und Redis Konfigurationsdetails

### NGINX Konfiguration

```nginx
# Hauptkonfiguration für DiscordGym
http {
    # Upstreams für Load Balancing
    upstream nestjs_api {
        least_conn;
        server api1.internal:3000 max_fails=3 fail_timeout=30s;
        server api2.internal:3000 max_fails=3 fail_timeout=30s;
        server api3.internal:3000 max_fails=3 fail_timeout=30s;
    }
    
    upstream socketio_servers {
        ip_hash; # Sticky Sessions für WebSockets
        server socket1.internal:3001;
        server socket2.internal:3001;
    }
    
    # GZIP Kompression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    # SSL Konfiguration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    
    # API Server Konfiguration
    server {
        listen 443 ssl http2;
        server_name api.discordgym.com;
        
        # SSL Zertifikate
        ssl_certificate /etc/nginx/ssl/discordgym.crt;
        ssl_certificate_key /etc/nginx/ssl/discordgym.key;
        
        # API Proxy
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://nestjs_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # WebSocket Proxy
        location /socket.io/ {
            proxy_pass http://socketio_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
    
    # Frontend Server Konfiguration
    server {
        listen 443 ssl http2;
        server_name app.discordgym.com;
        
        ssl_certificate /etc/nginx/ssl/discordgym.crt;
        ssl_certificate_key /etc/nginx/ssl/discordgym.key;
        
        root /var/www/discordgym/public;
        
        # Statische Assets mit Caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }
        
        # SPA Routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Redis Konfiguration

```javascript
// redis.config.ts
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  
  // Cluster Konfiguration
  cluster: process.env.REDIS_CLUSTER === 'true',
  clusterNodes: process.env.REDIS_CLUSTER_NODES?.split(',') || [],
  
  // Sentinel Konfiguration für Hochverfügbarkeit
  sentinel: process.env.REDIS_SENTINEL === 'true',
  sentinelName: process.env.REDIS_SENTINEL_NAME || 'mymaster',
  sentinels: process.env.REDIS_SENTINELS 
    ? JSON.parse(process.env.REDIS_SENTINELS) 
    : [{ host: 'localhost', port: 26379 }],
    
  // Weitere Optionen
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: 'discordgym:',
  
  // Socket.IO spezifische Einstellungen
  pubClient: null, // Wird zur Laufzeit initialisiert
  subClient: null, // Wird zur Laufzeit initialisiert
};

// socket.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { redisConfig } from './redis.config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: `redis://${redisConfig.host}:${redisConfig.port}`,
      password: redisConfig.password,
    });
    
    const subClient = pubClient.duplicate();
    
    await Promise.all([pubClient.connect(), subClient.connect()]);
    
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

## � Redis Integration und Funktionen

```mermaid
graph TB
    subgraph "Socket.IO Integration"
        A[Socket.IO Adapter]
        B[Redis Adapter]
        C[Socket Namespaces]
        D[Room Management]
        E[Event Broadcasting]
        F[Connected Clients]
    end
    
    subgraph "Redis Core Functions"
        G[Redis Server]
        H[Pub/Sub Mechanismus]
        I[Key-Value Store]
        J[Sorted Sets]
        K[Lists]
        L[Hashes]
    end
    
    subgraph "Application Features"
        M[Online Status Tracking]
        N[Chat History Caching]
        O[Rate Limiting]
        P[Session Management]
        Q[Typing Indicators]
        R[Notification Queue]
    end
    
    A --> B
    B --> G
    B --> C
    B --> D
    B --> E
    D --> F
    
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    
    H --> E
    H --> Q
    I --> P
    I --> M
    J --> O
    K --> R
    L --> N
    
    style A fill:#e1bee7
    style G fill:#ffe0b2,stroke:#ff6f00,stroke-width:2px
    style M fill:#c5cae9
    style E fill:#e1bee7,stroke:#9c27b0,stroke-width:1px
```

## 🌐 NGINX Konfiguration und Routing

```mermaid
graph TD
    subgraph "Client Requests"
        A[HTTP/HTTPS Request]
        B[WebSocket Connection]
        C[Static Asset Request]
    end
    
    subgraph "NGINX Server"
        D[TLS Termination]
        E[Request Routing]
        F[Load Balancing]
        G[Rate Limiting]
        H[Static File Serving]
        I[Compression]
        J[Caching]
    end
    
    subgraph "Backend Services"
        K[NestJS API Server<br>localhost:3000]
        L[Socket.IO Server<br>localhost:3001]
        M[Angular Assets<br>/var/www/html]
    end
    
    subgraph "Health & Monitoring"
        N[Health Checks]
        O[Metrics Collection]
        P[Error Logging]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> E
    E --> F
    F --> G
    
    E --> H
    H --> I
    I --> J
    
    F --> K
    F --> L
    H --> M
    
    K --> N
    L --> N
    N --> O
    E --> P
    
    style A fill:#bbdefb
    style D fill:#c5cae9,stroke:#3f51b5,stroke-width:2px
    style K fill:#e1bee7,stroke:#9c27b0,stroke-width:1px
    style N fill:#ffecb3
```

## �📁 Folder Struktur

```mermaid
graph TD
    Root[DiscordGym/]
    Root --> Client[client/]
    Root --> Server[server/]
    Root --> Docs[*.md Docs]
    Root --> Docker[Docker Files]
    Root --> GitHub[.github/]
    Root --> Nginx[nginx/]
    
    Client --> Angular[Angular 20 App]
    Client --> Pages[pages/]
    Client --> Services[shared/services/]
    Client --> Environments[environments/]
    
    Server --> NestJS[NestJS Backend]
    Server --> Prisma[prisma/]
    Server --> SrcModules[src/modules/]
    Server --> Utils[src/utils/]
    Server --> Config[src/config/]
    Server --> Redis[redis/]
    
    Redis --> RedisConfig[redis.config.ts]
    Redis --> Adapters[socket.adapter.ts]
    Redis --> Services[redis.service.ts]
    
    Nginx --> NginxConf[nginx.conf]
    Nginx --> Sites[sites-available/]
    Nginx --> SSL[ssl/]
    
    Prisma --> Schema[schema.prisma]
    Prisma --> Migrations[migrations/]
    
    Docker --> Compose[docker-compose.prod.yml]
    Docker --> NginxDocker[nginx-docker-compose.yml]
    Docker --> RedisDocker[redis-docker-compose.yml]
    
    GitHub --> Workflows[workflows/]
    Workflows --> CICD[ci-cd.yml]
    
    Utils --> Security[password-prompt.ts]
    Utils --> Helpers[helpers/]
    
    SrcModules --> Auth[auth/]
    SrcModules --> User[user/]
    SrcModules --> Chat[chat/]
    SrcModules --> Friends[friends/]
    SrcModules --> Workout[workout/]
    SrcModules --> Admin[admin/]
    
    style Root fill:#fff2cc
    style Client fill:#e1f5fe
    style Server fill:#f3e5f5
    style Docker fill:#e8eaf6
    style GitHub fill:#ffecb3
    style Redis fill:#ffe0b2,stroke:#ff6f00,stroke-width:1px
    style Nginx fill:#c5cae9,stroke:#3f51b5,stroke-width:1px
```
