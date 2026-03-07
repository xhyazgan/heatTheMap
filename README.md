# 🗺️ HeatTheMap

**AI-Powered Retail Store Analytics Platform**

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-FF6F00?logo=tensorflow)](https://www.tensorflow.org/js)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

HeatTheMap is an enterprise-grade analytics platform that revolutionizes retail store management through real-time AI-powered customer behavior tracking and visualization. Built with cutting-edge technologies including .NET 10, React 19, and TensorFlow.js, it transforms physical store traffic into actionable insights through interactive heatmaps, comprehensive analytics, and an intelligent AI chatbot.

[🚀 Quick Start](#-quick-start) | [📚 Documentation](docs/BUSINESS_ANALYSIS.md) | [🐛 Report Bug](https://github.com/xhyazgan/heatTheMap/issues) | [✨ Request Feature](https://github.com/xhyazgan/heatTheMap/issues)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Security](#-security)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Business Logic](#-business-logic)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Known Issues & Limitations](#-known-issues--limitations)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🔒 Security

### Initial Setup Required

⚠️ **IMPORTANT**: This project requires configuration files with sensitive information. These files are NOT included in the repository for security reasons.

Before running the project, you must:

1. **API Configuration**: Copy `HeatTheMap.Api/appsettings.Development.json.example` to `HeatTheMap.Api/appsettings.Development.json`
2. **Web Configuration**: Copy `HeatTheMap.Web/.env.example` to `HeatTheMap.Web/.env`
3. **Update Secret Values**: Modify the copied files with your own secure values

See **[SETUP.md](SETUP.md)** for detailed step-by-step instructions.

### Protected Files

The following files are automatically excluded from version control via `.gitignore`:

- ✅ `appsettings.Development.json`
- ✅ `appsettings.Production.json`
- ✅ `appsettings.*.json` (except base appsettings.json)
- ✅ `.env` and all `.env.*` files

### Security Best Practices

| Component | Recommendation |
|-----------|----------------|
| **JWT Secret Key** | Must be at least 256 bits (32 characters). Use a cryptographically secure random generator |
| **Default Credentials** | Change immediately! The example credentials are for development only |
| **Production Deployment** | Use environment variables or a secrets management service (Azure Key Vault, AWS Secrets Manager, etc.) |
| **Authentication System** | The current system uses hardcoded credentials for MVP. Implement proper user management for production |

### Generating Secure Keys

```powershell
# PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# OpenSSL (Linux/Mac)
openssl rand -base64 64

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## 🎯 Overview

### Problem Statement

Understanding customer behavior in physical retail stores is significantly more challenging than analyzing digital interactions. HeatTheMap addresses this gap by providing:

| Challenge | Solution |
|-----------|----------|
| Manual visitor counting | Automated camera-based person detection (TensorFlow.js + COCO-SSD) |
| Unknown in-store movement patterns | 2D/3D heatmap visualizations |
| Unpredictable peak hours | Hourly distribution and peak hour analysis |
| Difficulty tracking weekly trends | Week-over-week comparative trend analysis |
| Identifying hot/cold zones | Zone performance analytics with visual indicators |
| Lack of data-driven decisions | AI-powered natural language query chatbot (Ollama LLM) |

### Target Users

- **Store Managers**: Primary users accessing real-time data for daily operational decisions
- **Regional Directors**: Management viewing multi-store performance comparisons
- **Retail Analysts**: Specialists analyzing long-term trends and patterns

### Vision

Transform physical retail spaces into data-driven environments where every square meter is optimized for customer experience and business performance.

---

## 🌟 Key Features

### 📊 Real-Time Analytics Dashboard

#### Comprehensive KPI Metrics
- **Total Visitors**: Daily visitor count with week-over-week percentage change
- **Average Dwell Time**: Customer stay duration calculated from route tracking
- **Current Occupancy**: Real-time count of people currently in store
- **Peak Hours**: Identification of busiest time slots with traffic patterns

#### Advanced Analytics
- **Weekly Trend Analysis**: 7-day comparative performance charts showing entry/exit patterns
- **Hourly Distribution**: Hour-by-hour traffic analysis with configurable date ranges
- **Zone Performance Tracking**: Identification of hot zones (top 5 most visited) and cold zones (bottom 5)
- **Comparative Analytics**: Historical trend analysis with customizable time ranges

### 🎨 Advanced Visualization Engine

#### 2D Heatmap
- **Canvas-Based Rendering**: High-performance color gradient density visualization
- **Customizable Grid**: 20x15 default resolution with dynamic zone mapping
- **Color Gradient System**: Blue → Green → Yellow → Red (low to high density)
- **Real-Time Updates**: Auto-refresh every 30 seconds with React Query

#### 3D Heatmap
- **Three.js Integration**: Interactive 3D bar chart with InstancedMesh optimization
- **User Controls**: Mouse-based rotation, zoom, and pan with OrbitControls
- **Visual Elements**: Store floor plan, grid lines, entrance indicator
- **Performance Optimized**: Lazy loading and efficient rendering for 300+ bars

### 🤖 Artificial Intelligence Features

#### Camera-Based Person Detection
- **TensorFlow.js Runtime**: Browser-based machine learning with WebGL acceleration
- **COCO-SSD Model**: Pre-trained object detection model (lite_mobilenet_v2 variant)
- **High Accuracy**: 50%+ confidence threshold for reliable person detection
- **Real-Time Processing**: ~10 FPS detection rate (100ms throttle)
- **Bounding Box Visualization**: Real-time overlay on camera feed

#### Centroid Tracking Algorithm
- **Unique Visitor Counting**: Advanced object tracking prevents duplicate counting
- **Movement Path Analysis**: Track customer paths through store zones
- **Smart Matching**: Euclidean distance-based association (80-pixel max distance)
- **Loss Tolerance**: 30-frame disappearance tolerance for robust tracking
- **Zone Mapping**: Automatic coordinate-to-zone conversion system

#### AI-Powered Chatbot
- **Natural Language Processing**: Ollama LLM (LLaMA 3.1) integration
- **Function Calling**: Direct access to 4 analytics functions via tool use
- **Intelligent Responses**: Context-aware answers with relevant data
- **Fallback Mechanism**: Keyword-based responses when LLM unavailable
- **Conversational UI**: Natural language queries like "How many visitors today?"
- **Bilingual Support**: Both Turkish and English query understanding

### 🏗️ Modern Infrastructure

#### .NET Aspire Orchestration
- **Distributed Application Management**: Centralized service discovery and lifecycle management
- **Container Orchestration**: Automated PostgreSQL and pgAdmin container deployment
- **Health Monitoring**: Built-in health checks for all services
- **Configuration Management**: Environment-based settings with easy deployment

#### OpenTelemetry Observability
- **Distributed Tracing**: Request flow tracking across services
- **Metrics Collection**: Performance monitoring (GC, thread pool, HTTP requests)
- **Structured Logging**: Comprehensive application logs with correlation IDs

#### Polly Resilience Patterns
- **HTTP Retry Policies**: Automatic retry on transient failures
- **Circuit Breaker**: Prevent cascade failures
- **Timeout Strategies**: Request timeout management

#### Security
- **JWT Authentication**: Secure token-based authentication
- **Refresh Token Rotation**: Enhanced security with token rotation
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Authorized Endpoints**: All business APIs protected with [Authorize] attribute

---

## 🛠️ Technology Stack

### Backend Technologies

| Technology | Version | Purpose | Key Capabilities |
|------------|---------|---------|------------------|
| **ASP.NET Core** | 10.0 | Web API Framework | High-performance REST API, minimal APIs, dependency injection |
| **.NET Aspire** | 9.4.2 | Distributed App Host | Service orchestration, health checks, telemetry, service discovery |
| **PostgreSQL** | 16.x | Primary Database | JSONB support, full-text search, advanced indexing, data volumes |
| **Entity Framework Core** | 10.0 | ORM | Code-first approach, LINQ queries, change tracking, migrations |
| **JWT Bearer** | 10.0 | Authentication | Stateless authentication, HmacSha256 signing, role-based access |
| **Npgsql** | 10.0 | PostgreSQL Provider | Native .NET PostgreSQL driver with async support |
| **Ollama** | LLaMA 3.1 | Local LLM | Function calling, natural language processing, tool use |
| **OpenTelemetry** | 1.x | Observability | OTLP export, distributed tracing, metrics, logging |
| **Polly** | 8.x | Resilience | HTTP retry policies, circuit breakers, timeout handling |

### Frontend Technologies

| Technology | Version | Purpose | Key Capabilities |
|------------|---------|---------|------------------|
| **React** | 19.2.0 | UI Framework | Server components, concurrent features, automatic batching |
| **TypeScript** | 5.x | Type Safety | Strong typing, IDE intellisense, compile-time error detection |
| **Vite** | 7.x | Build Tool | Lightning-fast HMR, optimized production builds, ESM support |
| **TanStack Query** | 5.90 | Data Fetching | Smart caching, automatic refetching, optimistic updates, stale-while-revalidate |
| **Zustand** | 5.0 | State Management | Lightweight store (< 1KB), DevTools integration, middleware support |
| **Tailwind CSS** | 4.x | CSS Framework | Utility-first approach, JIT compilation, responsive design, dark theme |
| **Recharts** | 3.6 | Data Visualization | Responsive charts, customizable components, SVG-based rendering |
| **Three.js** | 0.183 | 3D Graphics | WebGL rendering, camera controls, scene management, geometries |
| **TensorFlow.js** | 4.22 | ML Runtime | Browser-based ML, WebGL acceleration, model loading, predictions |
| **COCO-SSD** | 2.2.3 | Object Detection | Pre-trained model, 80 object classes, real-time detection |
| **Axios** | 1.7 | HTTP Client | Request/response interceptors, automatic retries, timeout handling |
| **React Router** | 7.x | Routing | Client-side routing, lazy loading, nested routes, protected routes |
| **Lucide React** | Latest | Icons | Modern icon library, tree-shakeable, consistent design |

### Development & Infrastructure Tools

| Tool | Purpose |
|------|---------|
| **Docker** | Container runtime for PostgreSQL and pgAdmin |
| **pgAdmin** | Database administration and management |
| **ESLint** | Code linting and quality enforcement |
| **Prettier** | Consistent code formatting |
| **Git** | Version control |
| **Visual Studio Code** | Primary IDE |
| **Swagger/OpenAPI** | API documentation and testing |
| **date-fns** | Date manipulation and formatting |

---

## 📐 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        .NET ASPIRE APPHOST                              │
│                   Distributed Application Orchestrator                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Service Discovery │ Health Checks │ Telemetry │ Configuration    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────┬───────────────────────────────┘
                  │                       │
      ┌───────────▼──────────┐   ┌───────▼────────────────────┐
      │   PostgreSQL 16      │   │   HeatTheMap.Api           │
      │   + pgAdmin 4        │   │   (.NET 10 Web API)        │
      │   (Docker Container) │   │                            │
      │                      │   │  ┌──────────────────────┐  │
      │  • heatmap_db        │   │  │   Controllers        │  │
      │  • JSONB Support     │   │  │  • Auth              │  │
      │  • Full-Text Search  │   │  │  • Stores            │  │
      │  • Advanced Indexing │   │  │  • Analytics         │  │
      │  • Data Volumes      │   │  │  • Chat              │  │
      └──────────────────────┘   │  └──────────────────────┘  │
                                 │  ┌──────────────────────┐  │
                                 │  │   Services Layer     │  │
                                 │  │  • AuthService       │  │
                                 │  │  • AnalyticsService  │  │
                                 │  │  • OllamaService     │  │
                                 │  └──────────────────────┘  │
                                 │  ┌──────────────────────┐  │
                                 │  │   Repository Layer   │  │
                                 │  │  • Generic<T> Repo   │  │
                                 │  │  • Analytics Repo    │  │
                                 │  └──────────────────────┘  │
                                 │  ┌──────────────────────┐  │
                                 │  │   Data Layer         │  │
                                 │  │  • EF Core Context   │  │
                                 │  │  • Entities (4)      │  │
                                 │  │  • Data Seeder       │  │
                                 │  └──────────────────────┘  │
                                 └────────────┬───────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                    ┌────▼──────┐      ┌─────▼──────┐      ┌──────▼───────┐
                    │  Ollama   │      │    JWT     │      │ OpenTelemetry│
                    │   API     │      │ Auth Guard │      │   Exporter   │
                    │           │      │            │      │              │
                    │ • LLaMA   │      │ • Token    │      │ • Traces     │
                    │   3.1     │      │   Verify   │      │ • Metrics    │
                    │ • Function│      │ • Refresh  │      │ • Logs       │
                    │   Calling │      │   Rotation │      │ • OTLP       │
                    └───────────┘      └────────────┘      └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         HeatTheMap.Web                                  │
│                    React 19 + TypeScript SPA                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        Presentation Layer                         │ │
│  │  • Pages: Login │ Dashboard                                       │ │
│  │  • Layout: Header │ Sidebar │ Protected Routes                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      Component Architecture                       │ │
│  │  • Dashboard: KPI Grid │ Charts │ Heatmap 2D/3D                  │ │
│  │  • Detection: Camera Feed │ Detection Panel │ Person Detection   │ │
│  │  • Chatbot: Chat Button │ Message List │ Chat Panel              │ │
│  │  • Filters: Date Range Picker │ Store Selector                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│
