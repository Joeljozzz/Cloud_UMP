<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=4f46e5&height=180&section=header&text=Cloud%20UMP&fontSize=56&fontColor=ffffff&fontAlignY=38&animation=fadeIn" width="100%"/>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=DM+Mono&size=18&duration=3000&pause=1000&color=4F46E5&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=80&lines=AI-Powered+User+%26+Agent+Management+Portal;Who+controls+your+AI+agents%3F;Constitutional+access+control+%E2%80%94+built+by+Joel+Jose)](https://cloud-ump.vercel.app)

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://cloud-ump.vercel.app)
[![Backend](https://img.shields.io/badge/API-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://cloudump-production.up.railway.app/api/health)
[![Built by Joel](https://img.shields.io/badge/Built%20by-Joel%20Jose-4f46e5?style=for-the-badge)](https://github.com/Joeljozzz)
[![Stars](https://img.shields.io/github/stars/Joeljozzz/Cloud_UMP?style=for-the-badge&color=4f46e5)](https://github.com/Joeljozzz/Cloud_UMP/stargazers)

<br/>

</div>

---

## The Problem

Most AI agent platforms let you configure what an agent can do.  
But configuration can be changed. Overridden. Forgotten.

**What if there were rules the agent could never escape — no matter what?**

---

## The Three-Layer Model

<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=DM+Mono&size=14&duration=2000&pause=500&color=4F46E5&center=true&vCenter=true&multiline=false&repeat=true&width=600&lines=Layer+1+%E2%80%94+Constitutional+Rules+%5BIMMUTABLE%5D;Layer+2+%E2%80%94+Persistent+Skills+%5BPER+AGENT%5D;Layer+3+%E2%80%94+Agent+Configuration+%5BCONFIGURABLE%5D;All+3+layers+injected+at+runtime+in+priority+order)](https://github.com/Joeljozzz/Cloud_UMP)

</div>

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — Constitutional Rules          [IMMUTABLE]    │
│  Confirm before delete · Stay in scope · No imperson.   │
├─────────────────────────────────────────────────────────┤
│  LAYER 2 — Persistent Skills             [PER AGENT]    │
│  Domain rules stored in DB · Survive all conversations  │
├─────────────────────────────────────────────────────────┤
│  LAYER 3 — Agent Configuration           [CONFIGURABLE] │
│  System prompt · Allowed tools · Temperature            │
└─────────────────────────────────────────────────────────┘
                          ↓
              Agent runtime at request time
        (All 3 layers injected in priority order)
```

> The constitutional layer sits at the **top of every agent prompt**, always.  
> No skill, no system prompt, no user message can remove it.

---

## Features

| Feature | Description |
|---|---|
| **Constitutional AI guardrails** | Immutable rules injected into every agent prompt |
| **Persistent skill memory** | Agent rules that survive across all conversations |
| **Role-based access control** | 5 roles — Viewer, User, Manager, Admin, Super Admin |
| **Agent access management** | Grant/revoke per-user access to specific agents |
| **Full audit trail** | Every action logged with user, timestamp, outcome |
| **Light / Dark mode** | System-aware with manual toggle |
| **Free AI inference** | HuggingFace Zephyr-7B, zero API cost |

---

## Stack

**Frontend** — React 18 · TypeScript · Vite · Tailwind CSS · DM Sans  
**Backend** — Python · FastAPI · SQLAlchemy · SQLite / PostgreSQL  
**AI** — HuggingFace Inference API · Zephyr-7B-Beta (free tier)  
**Deploy** — Vercel (frontend) · Railway (backend)  
**Auth** — JWT · bcrypt

---

## Quick Start

```bash
# Clone
git clone https://github.com/Joeljozzz/Cloud_UMP.git
cd Cloud_UMP

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Project Structure

```
Cloud_UMP/
├── backend/
│   └── app/
│       ├── services/
│       │   ├── constitutional.py   ← The core concept
│       │   ├── agent_runner.py     ← HF inference + layer assembly
│       │   └── rbac.py             ← Permission matrix
│       ├── routers/                # auth, users, agents, chat, analytics
│       └── models/                 # User, Agent, Skill, Audit
└── frontend/
    └── src/
        ├── pages/                  # About, Login, Dashboard, Chat...
        ├── components/             # Layout, Badge, Card, ThemeToggle
        └── lib/                    # API client, Zustand store
```

---

## Deploy

**Backend → Railway** — root: `backend` · start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
**Frontend → Vercel** — root: `frontend` · env: `VITE_API_URL=https://your-railway-url.railway.app`

---

<div align="center">

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=DM+Mono&size=13&duration=4000&pause=1000&color=6B7280&center=true&vCenter=true&repeat=true&width=500&lines=Designed+and+built+with+care+by+Joel+Jose;Data+Science+%7C+ML+%7C+Cloud+%7C+Mumbai;github.com%2FJoeljozzz)](https://github.com/Joeljozzz)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=4f46e5&height=100&section=footer&animation=fadeIn" width="100%"/>

</div>