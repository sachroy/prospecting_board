# Prospecting Board - Reference Architecture

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Web Browser]
        HTML[HTML5 Pages]
        CSS[CSS Stylesheets]
        JS[JavaScript Modules]
    end

    subgraph "Application Modules"
        PR[Product Research Module]
        CI[Competitive Intelligence Module]
        CR[Customer Research Module]
        CM[Contact Management Module]
        ES[Email Summary Module]
    end

    subgraph "Backend Services"
        API[Express.js API Server]
        AUTH[Authentication Service]
        DB[(PostgreSQL Database)]
    end

    subgraph "External Integrations"
        IBM[IBM Documentation API]
        OPENAI[OpenAI GPT-4]
        LINKEDIN[LinkedIn API]
        MSGRAPH[Microsoft Graph API]
        VERIFY[IBM Verify SSO]
    end

    UI --> HTML
    HTML --> CSS
    HTML --> JS
    JS --> PR
    JS --> CI
    JS --> CR
    JS --> CM
    JS --> ES
    
    PR --> API
    CI --> API
    CR --> API
    CM --> API
    ES --> API
    
    API --> AUTH
    API --> DB
    
    API --> IBM
    API --> OPENAI
    API --> LINKEDIN
    API --> MSGRAPH
    AUTH --> VERIFY

    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style DB fill:#ffe1e1
    style IBM fill:#e8f5e9
    style OPENAI fill:#e8f5e9
    style LINKEDIN fill:#e8f5e9
    style MSGRAPH fill:#e8f5e9
    style VERIFY fill:#e8f5e9
```

## Component Architecture

```mermaid
graph LR
    subgraph "Section 1: Customer & Industry"
        S1[Customer Input Form]
        S1 --> CTX[Context Store]
    end

    subgraph "Section 2: Research Client"
        S2[Research Questions]
        S2 --> AI1[AI Generator]
    end

    subgraph "Section 3: IBM Product Research"
        S3[NLP Query Interface]
        S3 --> PDB[Product Database]
        S3 --> AI2[AI Response Generator]
    end

    subgraph "Section 4: Tech Headlines"
        S4[News Aggregator]
        S4 --> NEWS[News APIs]
    end

    subgraph "Section 5: Contacts"
        S5[Contact Manager]
        S5 --> LI[LinkedIn Integration]
    end

    subgraph "Section 6: Competitive Intelligence"
        S6[Competitive Query NLP]
        S6 --> COMP[Competitor Database]
        S6 --> AI3[Battle Card Generator]
    end

    subgraph "Section 7: Email Summary"
        S7[Email Composer]
        S7 --> TMPL[Template Engine]
    end

    CTX --> S2
    CTX --> S3
    CTX --> S6
    CTX --> S7

    style CTX fill:#ffeb3b
    style AI1 fill:#4caf50
    style AI2 fill:#4caf50
    style AI3 fill:#4caf50
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    participant External

    User->>Frontend: Enter Customer Name & Industry
    Frontend->>Frontend: Store in Context
    
    User->>Frontend: Ask Product Question
    Frontend->>Frontend: Detect IBM Product
    Frontend->>API: Request Product Info
    API->>External: Query IBM Docs API
    External-->>API: Return Documentation
    API->>API: Generate AI Response
    API-->>Frontend: Return Response
    Frontend-->>User: Display Answer + Follow-ups

    User->>Frontend: Ask Competitive Question
    Frontend->>Frontend: Detect Competitor
    Frontend->>API: Request Competitive Analysis
    API->>Database: Fetch Competitor Data
    Database-->>API: Return Data
    API->>API: Generate Battle Card
    API-->>Frontend: Return Analysis
    Frontend-->>User: Display Competitive Intelligence

    User->>Frontend: Search Contacts
    Frontend->>API: Request LinkedIn Data
    API->>External: Query LinkedIn API
    External-->>API: Return Profile Data
    API->>Database: Store Contact
    Database-->>API: Confirm
    API-->>Frontend: Return Contact Info
    Frontend-->>User: Display Contact Card
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend Technologies"
        HTML5[HTML5]
        CSS3[CSS3 + Custom Properties]
        VJS[Vanilla JavaScript ES6+]
        RESP[Responsive Design]
    end

    subgraph "Backend Technologies"
        NODE[Node.js 18+]
        EXPRESS[Express.js]
        TS[TypeScript]
        PRISMA[Prisma ORM]
    end

    subgraph "Database"
        PG[PostgreSQL 14+]
        REDIS[Redis Cache]
    end

    subgraph "Authentication"
        JWT[JWT Tokens]
        IBMV[IBM Verify]
        OAUTH[OAuth 2.0]
    end

    subgraph "AI/ML Services"
        GPT4[OpenAI GPT-4]
        IBMDOCS[IBM Documentation API]
        NLP[Natural Language Processing]
    end

    subgraph "External APIs"
        LI2[LinkedIn API]
        MS[Microsoft Graph]
        NEWS2[News APIs]
    end

    HTML5 --> VJS
    CSS3 --> RESP
    VJS --> EXPRESS
    
    EXPRESS --> TS
    TS --> PRISMA
    PRISMA --> PG
    EXPRESS --> REDIS
    
    EXPRESS --> JWT
    JWT --> IBMV
    IBMV --> OAUTH
    
    EXPRESS --> GPT4
    EXPRESS --> IBMDOCS
    GPT4 --> NLP
    
    EXPRESS --> LI2
    EXPRESS --> MS
    EXPRESS --> NEWS2

    style HTML5 fill:#e3f2fd
    style NODE fill:#fff3e0
    style PG fill:#fce4ec
    style GPT4 fill:#e8f5e9
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        
        subgraph "Application Tier"
            APP1[App Server 1]
            APP2[App Server 2]
            APP3[App Server 3]
        end
        
        subgraph "Database Tier"
            DBPRI[(Primary DB)]
            DBREP[(Replica DB)]
        end
        
        subgraph "Cache Tier"
            REDIS1[Redis Master]
            REDIS2[Redis Replica]
        end
        
        subgraph "Static Assets"
            CDN[CDN]
            S3[Object Storage]
        end
    end

    subgraph "External Services"
        IBM2[IBM Cloud Services]
        OPENAI2[OpenAI API]
        LI3[LinkedIn API]
    end

    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> DBPRI
    APP2 --> DBPRI
    APP3 --> DBPRI
    
    DBPRI --> DBREP
    
    APP1 --> REDIS1
    APP2 --> REDIS1
    APP3 --> REDIS1
    
    REDIS1 --> REDIS2
    
    APP1 --> CDN
    CDN --> S3
    
    APP1 --> IBM2
    APP1 --> OPENAI2
    APP1 --> LI3

    style LB fill:#4caf50
    style DBPRI fill:#f44336
    style REDIS1 fill:#ff9800
    style CDN fill:#2196f3
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        WAF[Web Application Firewall]
        
        subgraph "Authentication"
            SSO[IBM Verify SSO]
            MFA[Multi-Factor Auth]
            JWT2[JWT Validation]
        end
        
        subgraph "Authorization"
            RBAC[Role-Based Access Control]
            PERM[Permission System]
        end
        
        subgraph "Data Protection"
            ENC[Encryption at Rest]
            TLS[TLS 1.3]
            HASH[Password Hashing]
        end
        
        subgraph "API Security"
            RATE[Rate Limiting]
            CORS2[CORS Policy]
            CSRF[CSRF Protection]
        end
    end

    WAF --> SSO
    SSO --> MFA
    MFA --> JWT2
    JWT2 --> RBAC
    RBAC --> PERM
    
    PERM --> ENC
    PERM --> TLS
    PERM --> HASH
    
    JWT2 --> RATE
    RATE --> CORS2
    CORS2 --> CSRF

    style WAF fill:#f44336
    style SSO fill:#ff9800
    style RBAC fill:#4caf50
    style ENC fill:#2196f3
```

## Module Interaction Flow

```mermaid
graph LR
    subgraph "User Actions"
        UA1[Enter Customer Info]
        UA2[Ask Product Question]
        UA3[Ask Competitive Question]
        UA4[Search Contacts]
        UA5[Generate Email]
    end

    subgraph "Context Management"
        CTX2[Global Context Store]
    end

    subgraph "Processing"
        P1[Product Research Engine]
        P2[Competitive Analysis Engine]
        P3[Contact Search Engine]
        P4[Email Template Engine]
    end

    subgraph "Data Sources"
        D1[IBM Product DB]
        D2[Competitor DB]
        D3[Contact DB]
        D4[Template DB]
    end

    UA1 --> CTX2
    UA2 --> P1
    UA3 --> P2
    UA4 --> P3
    UA5 --> P4

    CTX2 --> P1
    CTX2 --> P2
    CTX2 --> P4

    P1 --> D1
    P2 --> D2
    P3 --> D3
    P4 --> D4

    style CTX2 fill:#ffeb3b
    style P1 fill:#4caf50
    style P2 fill:#4caf50
    style P3 fill:#4caf50
    style P4 fill:#4caf50
```

---

## PowerPoint Conversion Instructions

To convert these diagrams to PowerPoint:

### Option 1: Using Mermaid Live Editor
1. Go to https://mermaid.live/
2. Copy each diagram code block
3. Paste into the editor
4. Export as PNG or SVG
5. Insert into PowerPoint

### Option 2: Using VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Use "Markdown: Open Preview" command
4. Take screenshots of diagrams
5. Insert into PowerPoint

### Option 3: Manual Recreation
Use the diagram descriptions to manually create shapes and connections in PowerPoint using:
- SmartArt Graphics
- Shapes and Connectors
- Custom layouts

## Key Architecture Principles

1. **Modular Design**: Each section is an independent JavaScript module
2. **Context Preservation**: Customer data flows through all sections
3. **API-First**: Backend provides RESTful APIs for all operations
4. **Progressive Enhancement**: Works without JavaScript, enhanced with it
5. **Security by Design**: Authentication and authorization at every layer
6. **Scalable**: Horizontal scaling with load balancing
7. **Observable**: Comprehensive logging and monitoring
8. **Maintainable**: Clear separation of concerns and documentation
