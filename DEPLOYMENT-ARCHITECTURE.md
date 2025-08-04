## 🌐 Deployment Architecture

```mermaid
graph TB
    subgraph "Client-Facing Services"
        A[DNS Service]
        B[CDN Optional]
        C[User Browser]
    end
    
    subgraph "Production Environment"
        subgraph "Traefik Layer"
            D[Traefik Proxy]
            E[SSL/TLS Management]
            F[Load Balancing]
        end
        
        subgraph "Application Services"
            G[Frontend Container]
            H[API Container]
            I[Socket.IO Container]
        end
        
        subgraph "Data Layer"
            J[MariaDB]
            K[Redis]
        end
        
        subgraph "Monitoring"
            L[Prometheus]
            M[Grafana]
        end
    end
    
    C --> A
    A --> D
    B -.-> A
    
    D --> E
    D --> F
    F --> G
    F --> H
    F --> I
    
    G -.-> H
    G --> I
    H --> J
    H --> K
    I --> K
    
    H -.-> L
    I -.-> L
    J -.-> L
    L --> M
    
    style C fill:#fff2cc
    style A fill:#e1f5fe
    style D fill:#e8eaf6
    style G,H,I fill:#f3e5f5
    style J,K fill:#e8f5e8
    style L,M fill:#ffecb3
```

## 🔄 CI/CD Pipeline Workflow

```mermaid
graph LR
    A[Developer Push] --> B{GitHub Actions}
    B --> C[Run Tests]
    C -->|Pass| D[Build Images]
    C -->|Fail| E[Notify Developer]
    D --> F{Deployment Type?}
    F -->|Self-Hosted| G[SSH to Server]
    F -->|Cloud Services| H[Deploy to Services]
    G --> I[Pull Images]
    G --> J[Run Docker Compose]
    H --> K[Deploy Frontend to Vercel]
    H --> L[Deploy Backend to Railway]
    H --> M[Configure Database]
    J --> N[Verify Deployment]
    M --> N
    N -->|Success| O[Send Success Notification]
    N -->|Failure| P[Rollback & Alert]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C,D fill:#e8f5e8
    style E,P fill:#ffcdd2
    style O fill:#c8e6c9
```

## 🔒 Security Architecture

```mermaid
graph TB
    A[User Request] --> B[Traefik SSL]
    B --> C{JWT Valid?}
    
    C -->|Yes| D[Rate Limiter]
    C -->|No| E[401 Unauthorized]
    
    D -->|Pass| F[NestJS Guards]
    D -->|Fail| G[429 Too Many Requests]
    
    F -->|Authorized| H[Controller]
    F -->|Unauthorized| I[403 Forbidden]
    
    H --> J[Business Logic]
    J --> K[Database]
    
    subgraph "Security Layers"
        B
        C
        D
        F
    end
    
    style A fill:#e1f5fe
    style B,C,D,F fill:#ffecb3
    style E,G,I fill:#ffcdd2
    style H,J fill:#f3e5f5
    style K fill:#e8f5e8
```

## 🌟 Produktionsumgebung (Option A: Selbst-Hosting)

```mermaid
graph TB
    subgraph "Internet"
        A[User Browser]
    end
    
    subgraph "VPS/Dedicated Server"
        subgraph "Docker Network"
            B[Traefik Container]
            C[Frontend Container]
            D[API Container]
            E[Database Container]
            F[Redis Container]
            G[Prometheus]
            H[Grafana]
        end
        
        I[Docker Volumes]
        J[Backups]
    end
    
    A --> B
    B --> C
    B --> D
    B --> G
    B --> H
    
    D --> E
    D --> F
    C --> D
    
    E --> I
    F --> I
    G --> I
    H --> I
    
    I -.-> J
    
    style A fill:#e1f5fe
    style B fill:#e8eaf6
    style C,D fill:#f3e5f5
    style E,F fill:#e8f5e8
    style G,H fill:#ffecb3
    style I,J fill:#fff2cc
```

## 🌟 Produktionsumgebung (Option B: Cloud Services)

```mermaid
graph TB
    subgraph "Internet"
        A[User Browser]
    end
    
    subgraph "Cloudflare"
        B[CDN]
        C[DNS]
    end
    
    subgraph "Vercel"
        D[Frontend Hosting]
    end
    
    subgraph "Railway/Render"
        E[API Service]
    end
    
    subgraph "PlanetScale/Neon"
        F[Managed Database]
    end
    
    subgraph "Upstash"
        G[Redis Service]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    D --> E
    E --> F
    E --> G
    
    style A fill:#e1f5fe
    style B,C fill:#e8eaf6
    style D fill:#c8e6c9
    style E fill:#f3e5f5
    style F fill:#e8f5e8
    style G fill:#fff8e1
```
