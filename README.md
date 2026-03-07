# 🗺️ HeatTheMap

**AI-Powered Retail Store Analytics Platform**

Real-time customer tracking and visualization platform for physical retail stores. Analyze customer behavior using camera-based AI and generate insightful heatmaps.

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

Transform your retail space into a data-driven environment:

- 📹 **Real-Time Person Detection** - Browser-based ML powered by TensorFlow.js and COCO-SSD model
- 🗺️ **Interactive Heatmaps** - 2D and 3D visualizations showing customer density zones
- 📊 **Comprehensive Analytics** - Track visitor count, peak hours, dwell time, and zone performance
- 🤖 **AI Chatbot** - Natural language queries powered by Ollama LLM (LLaMA 3.1)
- ⚡ **Live Updates** - Real-time occupancy tracking and automatic data refresh

## 🚀 Quick Start

### Prerequisites

- .NET 10 SDK
- Node.js 20+
- Docker (for PostgreSQL)
- Ollama (optional, for AI chatbot features)

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

**3. Update secret values**

Edit `HeatTheMap.Api/appsettings.Development.json` and replace the JWT key:
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

**Generate a secure key:**
```powershell
# PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```
```bash
# Linux/Mac
openssl rand -base64 64
```

**4. Run the application**
```bash
dotnet run
```

The application will automatically open in your browser. Default credentials: `admin` / `password`

📚 **Detailed setup instructions:** [SETUP.md](SETUP.md)

## 🔒 Security Notice

> [!IMPORTANT]
> Configuration files containing sensitive information are **NOT** included in this repository. You must create your own configuration files before running the project.

**Protected files:**
- ✅ `appsettings.Development.json` - JWT keys and credentials
- ✅ `.env` - Environment variables

These files are automatically excluded via `.gitignore`

**Making the repo public?** See [CLEANUP_GIT_HISTORY.md](CLEANUP_GIT_HISTORY.md) for instructions on cleaning sensitive data from Git history.

## 💡 What You Get

### 📈 Analytics Dashboard
- **KPI Cards** - Total visitors, average dwell time, current occupancy, peak hours
- **Weekly Trends** - 7-day comparative analysis with entry/exit patterns
- **Hourly Distribution** - Identify traffic patterns throughout the day
- **Zone Analysis** - Discover hot and cold spots in your store

### 🎨 Heatmap Visualizations
- **2D Heatmap** - Color-coded density map (Blue → Yellow → Red)
- **3D Heatmap** - Interactive 3D bar chart with full camera controls
- **Auto-Refresh** - Updates every 30 seconds for real-time insights

### 🤖 AI-Powered Features
- **Person Detection** - Automatic visitor counting via COCO-SSD ML model
- **Centroid Tracking** - Tracks customer movement paths through zones
- **Smart Chatbot** - Ask questions like "How many visitors today?" in natural language

## 🛠️ Tech Stack

**Backend:** .NET 10, PostgreSQL, Entity Framework Core, JWT Authentication  
**Frontend:** React 19, TypeScript, TailwindCSS, Three.js, Recharts  
**AI/ML:** TensorFlow.js, COCO-SSD, Ollama (LLaMA 3.1)  
**Infrastructure:** .NET Aspire, Docker, OpenTelemetry

## 📁 Project Structure

```
heatTheMap/
├── HeatTheMap.Api/              # .NET 10 Web API
│   ├── Controllers/             # REST API endpoints
│   ├── Services/                # Business logic layer
│   ├── Repositories/            # Data access layer
│   ├── Data/                    # EF Core context & entities
│   └── DTOs/                    # Data transfer objects
├── HeatTheMap.Web/              # React 19 SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components (Login, Dashboard)
│   │   ├── services/            # API client services
│   │   ├── hooks/               # Custom React hooks
│   │   └── stores/              # Zustand state management
│   └── public/
├── HeatTheMap.ServiceDefaults/  # .NET Aspire service defaults
└── docs/                        # Additional documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) - Browser-based machine learning
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [.NET Aspire](https://learn.microsoft.com/dotnet/aspire/) - Cloud-ready app orchestration
- [COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) - Object detection model

---

<p align="center">
  <sub>Built with ❤️ for retail analytics</sub>
</p>

<p align="center">
  <sub>⚠️ Note: For production use, implement proper user management and secret management solutions (e.g., Azure Key Vault, AWS Secrets Manager)</sub>
</p>
