# 🗺️ HeatTheMap

**AI-Powered Retail Store Analytics Platform**

Real-time customer tracking and heatmap visualization for physical retail stores. Transform customer behavior into actionable insights using AI and interactive analytics.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen" alt="PRs Welcome">
</p>

---

## ✨ Features

### 📹 Real-Time Person Detection
- Browser-based AI tracking using TensorFlow.js and COCO-SSD
- Automatic visitor counting and movement tracking
- No server-side ML processing required

### 🗺️ Interactive Heatmaps
- **2D Visualization** - Color-coded density maps (Blue → Yellow → Red)
- **3D Visualization** - Interactive 3D bar charts with camera controls
- **Zone-Based Analysis** - Configurable grid system for detailed insights
- **Auto-Refresh** - Real-time updates every 30 seconds

### 📊 Comprehensive Analytics Dashboard
- **Live KPI Cards** - Total visitors, current occupancy, average dwell time, peak hours
- **Weekly Trends** - 7-day comparative analysis with entry/exit patterns
- **Hourly Distribution** - Identify traffic patterns throughout the day
- **Zone Comparison** - Discover hot and cold spots in your store layout
- **Historical Data** - Daily footfall trends and performance metrics

### 🤖 AI-Powered Chatbot
- Natural language queries about your store analytics
- Ask questions like "How many visitors today?" or "What are the peak hours?"
- Powered by Ollama and LLaMA 3.1 local LLM
- Context-aware responses with real-time data analysis

### 🏪 Multi-Store Management
- Support for multiple retail locations
- Easy switching between stores via dropdown selector
- Store-specific analytics and heatmaps
- Centralized data management

### 🔐 Secure Authentication
- JWT-based authentication system
- Protected API endpoints
- Session management
- Configurable admin credentials

### ⚡ Real-Time Updates
- Live occupancy tracking
- Automatic data refresh
- WebSocket-ready architecture
- Responsive UI updates

## 🚀 Quick Start

### Prerequisites

- .NET 10 SDK
- Node.js 20+
- Docker (for PostgreSQL)
- Ollama (optional, for AI chatbot)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/xhyazgan/heatTheMap.git
cd heatTheMap
```

**2. Set up configuration files**
```bash
# API configuration
cp HeatTheMap.Api/appsettings.Development.json.example HeatTheMap.Api/appsettings.Development.json

# Web configuration
cp HeatTheMap.Web/.env.example HeatTheMap.Web/.env
```

**3. Configure JWT and credentials**

Edit `HeatTheMap.Api/appsettings.Development.json`:
```json
{
  "Jwt": {
    "Key": "YOUR-SECURE-256-BIT-KEY-HERE"
  },
  "Auth": {
    "DefaultUsername": "admin",
    "DefaultPassword": "your-secure-password"
  }
}
```

**Generate a secure JWT key:**
```powershell
# PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```
```bash
# Linux/Mac
openssl rand -base64 64
```

**4. Install Ollama and download models (Optional)**
```bash
# Install from https://ollama.ai/
ollama pull llama3.1
```

**5. Run the application**
```bash
dotnet run
```

The application will automatically open in your browser at `http://localhost:5173`

**Default credentials:** `admin` / `password` (or your configured password)

## 💡 Usage Guide

### Getting Started
1. Login with your admin credentials
2. Demo store data is pre-seeded for testing
3. Navigate through the dashboard to explore analytics

### Capturing Heatmap Data
1. Click "Start Detection" to begin person tracking
2. Allow camera access when prompted
3. System automatically detects and tracks visitors
4. View real-time heatmap updates

### Using Analytics
- **KPI Cards** - View quick metrics at the top
- **Charts** - Analyze trends, hourly patterns, and zone performance
- **Heatmaps** - Toggle between 2D and 3D views
- **Date Filters** - Select custom date ranges for analysis

### AI Chatbot Queries
- "How many visitors did we have today?"
- "What are the busiest hours?"
- "Which zone has the most traffic?"
- "Show me yesterday's statistics"

## 🛠️ Tech Stack

**Backend:** .NET 10, PostgreSQL, Entity Framework Core, JWT Authentication  
**Frontend:** React 19, TypeScript, TailwindCSS, Zustand  
**Visualization:** Three.js, Recharts  
**AI/ML:** TensorFlow.js, COCO-SSD, Ollama (LLaMA 3.1)  
**Infrastructure:** .NET Aspire, Docker

## 📁 Project Structure

```
heatTheMap/
├── HeatTheMap.Api/              # .NET 10 Web API
│   ├── Controllers/             # REST endpoints
│   ├── Services/                # Business logic
│   ├── Repositories/            # Data access
│   ├── Data/                    # Database entities
│   └── DTOs/                    # Data transfer objects
├── HeatTheMap.Web/              # React 19 SPA
│   ├── src/components/          # UI components
│   ├── src/pages/               # Page views
│   ├── src/services/            # API clients
│   ├── src/hooks/               # Custom hooks
│   └── src/stores/              # State management
└── HeatTheMap.ServiceDefaults/  # .NET Aspire defaults
```

## 🔒 Security Notice

> [!IMPORTANT]
> Configuration files with sensitive data are **NOT** included in this repository.

**Protected files:**
- `appsettings.Development.json` - JWT keys and credentials
- `.env` - Environment variables

**Example templates provided:**
- `appsettings.Development.json.example`
- `.env.example`

These files are excluded via `.gitignore` to prevent accidental commits.

## 🎯 Key Capabilities

✅ **Person Detection** - AI-powered visitor tracking  
✅ **Heatmap Generation** - 2D and 3D visualizations  
✅ **Analytics Dashboard** - Comprehensive KPIs and charts  
✅ **AI Chatbot** - Natural language queries  
✅ **Multi-Store Support** - Manage multiple locations  
✅ **Real-Time Updates** - Live data refresh  
✅ **Secure API** - JWT authentication  
✅ **Zone Analysis** - Grid-based tracking  
✅ **Historical Data** - Trend analysis  
✅ **Custom Date Ranges** - Flexible filtering

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgement

- [TensorFlow.js](https://www.tensorflow.org/js) - Browser ML
- [COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) - Object detection
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [.NET Aspire](https://learn.microsoft.com/dotnet/aspire/) - Cloud-ready orchestration
- [Recharts](https://recharts.org/) - Chart library
- [Three.js](https://threejs.org/) - 3D graphics

---
