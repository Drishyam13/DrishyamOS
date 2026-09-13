# DrishyamOS - Real-Time AI Video Surveillance Platform 🎥

> **From Footage to Action** — Converting passive CCTV cameras into active, intelligent threat-detection networks.

DrishyamOS is an enterprise real-time AI-powered video surveillance platform. It ingests live RTSP/ONVIF streams from CCTV cameras, runs continuous computer vision threat detection (weapons, physical violence/altercations, perimeter intrusions, and loitering), buffers evidence video clips, and delivers sub-2-second WebSocket alerts to control room operators and mobile apps.

---

## 🌟 Key Features

1. **Sub-2-Second Real-Time Alerting**: Continuous video stream analysis via AI Edge Nodes with WebSocket broadcast to web and mobile control rooms.
2. **Threat Detection Classes (MVP)**:
   - 🔫 **Weapon Detection**: Firearms (handguns, rifles) and bladed weapons (knives, machetes).
   - 🥊 **Violence / Altercation Detection**: Physical fights and aggressive motion.
   - 🛑 **Perimeter Intrusion**: Polygonal zone breach detection with custom canvas zone editor.
   - ⏳ **Loitering Detection**: Frame-counter accumulator tracking subjects lingering past configurable thresholds.
3. **Interactive Polygonal Zone Drawer**: HTML5 canvas editor for site managers to draw custom intrusion & loitering zones directly on camera snapshots.
4. **Evidence Clip Generation**: Auto-buffers 5s before + 5s after threat events into MP4 evidence clips with bounding box visual overlays.
5. **Multi-Tenant Architecture**: Complete tenant isolation by Organization, Site, and Camera level with Role-Based Access Control (RBAC): `OrgAdmin`, `SiteManager`, `Operator`, `Viewer`.

---

## 🏗 System Architecture & Monorepo Structure

```
Drishyam/
├── apps/
│   ├── web/                 # Next.js 14 Web Dashboard & Control Room
│   └── edge-agent/          # Python RTSP Ingestion & AI Detection Engine
├── services/
│   └── api/                 # Node.js TypeScript API Backend & Socket.IO Server
├── packages/
│   └── shared/              # Shared types, enums, & domain models (@drishyam/shared)
├── infra/
│   └── docker-compose.yml   # Multi-service setup (Postgres, Redis, MinIO)
├── drishyam_docs/           # 17 Specification PDFs & Generator
└── README.md
```

---

## 🚀 Quick Start & Development Setup

### 1. Prerequisites
- **Node.js**: `v20+` (Tested on Node v24)
- **Python**: `3.10+` (Tested on Python 3.14)
- **Git**

### 2. Environment Setup
Clone the repository and copy the environment template:
```bash
git clone https://github.com/Drishyam13/DrishyamOS.git
cd Drishyam
cp .env.example .env
```

### 3. Install Dependencies & Push Database Schema
```bash
# Install root monorepo dependencies
npm install

# Push database schema & populate seed data
cd services/api
npx prisma db push
npm run db:seed
```

### 4. Running Local Development Servers

#### Launch Backend API & WebSocket Server
```bash
cd services/api
npm run dev
# Server running at http://localhost:4000
```

#### Launch Next.js SOC Control Room Web Dashboard
```bash
cd apps/web
npm run dev
# Open browser at http://localhost:3000
```

#### Launch Python AI Edge Agent Detector (Optional)
```bash
cd apps/edge-agent
pip install -r requirements.txt
python main.py
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Org Admin** | `admin@drishyam.ai` | `Drishyam123!` |
| **Control Operator** | `operator@drishyam.ai` | `Drishyam123!` |

---

## 📄 Documentation

All 17 original PDF engineering specifications are available in the [`drishyam_docs`](./drishyam_docs) folder:
1. `01_PRD_Product_Requirements.pdf`
2. `02_SRS_Software_Requirements.pdf`
3. `03_Architecture_Document.pdf`
4. `04_Database_Schema.pdf`
5. `05_API_Specification.pdf`
6. `06_AI_Requirements.pdf`
7. `07_Tech_Stack_Decision.pdf`
8. `08_Authentication_Authorization.pdf`
9. `09_User_Flow_Document.pdf`
10. `10_Security_Requirements.pdf`
11. `11_Edge_Cases_Document.pdf`
12. `12_Business_Logic_Document.pdf`
13. `13_Developer_Setup_README.pdf`
14. `14_Testing_Document.pdf`
15. `15_Deployment_Document.pdf`
16. `16_AI_Evaluation_and_Cost.pdf`
17. `17_UI_UX_Specification.pdf`
