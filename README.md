# OptiChain AI — Local Setup Guide

## Prerequisites
- **Node.js** (v18+) → https://nodejs.org
- **Python** (v3.10+) → https://python.org

---

## ▶ Quick Start (2 terminals)

### Terminal 1 — Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend runs at: http://localhost:8000

---

### Terminal 2 — Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
App opens at: http://localhost:5173

---

## Features
- **Dashboard** — Command Center with KPI cards, shipments table with risk badges
- **Analytics** — 14-day efficiency trend, workforce load, fleet utilization, risk donut chart
- **Twin Sim** — Digital Twin with:
  - 🗺️ **Live Leaflet map** showing the shipment route (Sea/Air/Road with different colors)
  - Animated route line + origin/destination markers
  - Before/After simulation comparison
  - Apply optimization → updates data live across the whole app

## Map Colors
- 🔵 **Cyan** = Air routes (dashed line)
- 🟣 **Purple** = Sea routes
- 🟢 **Green** = Road routes

## Project Structure
```
optichain/
├── backend/
│   ├── main.py          # FastAPI server (all data + API routes)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx   # Command Center
    │   │   ├── Analytics.jsx   # Charts
    │   │   └── TwinSim.jsx     # Digital Twin + Map
    │   ├── components/
    │   │   └── RouteMap.jsx    # Leaflet map component
    │   ├── utils/api.js        # API calls
    │   ├── App.jsx             # Router + Sidebar
    │   └── index.css           # Dark theme styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Troubleshooting
- If map doesn't show: make sure `leaflet` CSS is loading (check `index.html`)
- If API fails: confirm backend is running on port 8000
- CORS errors: backend has `allow_origins=["*"]` — should work fine locally
