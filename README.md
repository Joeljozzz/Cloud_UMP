<div align="center">

# 🛡️ Cloud UMP

### AI-Powered User & Agent Management Portal with Constitutional Guardrails

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cloud--ump.vercel.app-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://cloud-ump.vercel.app)
[![API Health](https://img.shields.io/badge/API-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://cloudump-production.up.railway.app/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)
[![Built by Joel](https://img.shields.io/badge/Built%20by-Joel%20Jose-4f46e5?style=for-the-badge)](https://github.com/Joeljozzz)

<p align="center">
  <strong>Cloud UMP</strong> is a full-stack user and AI agent management portal engineered around constitutional governance. It enforces runtime safety guardrails, persistent domain memory, and granular role-based access controls across all agent interactions.
</p>

<!-- Tech Stack Badges -->
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app/)

</div>

---

## 🌐 Live Deployment

Experience the live portal at: **[cloud-ump.vercel.app](https://cloud-ump.vercel.app)**

---

## 💡 The Core Architecture: Three-Layer Model

Traditional AI agent platforms rely solely on system prompts that can be bypassed or overridden. Cloud UMP injects instructions dynamically in strict priority order on every invocation:

```text
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — Constitutional Rules          [IMMUTABLE]    │
│  Confirmation before destruction · In-scope · No spoof  │
├─────────────────────────────────────────────────────────┤
│  LAYER 2 — Persistent Skills             [PER AGENT]    │
│  Domain rules in DB · Persists across all conversations  │
├─────────────────────────────────────────────────────────┤
│  LAYER 3 — Agent Configuration           [CONFIGURABLE] │
│  System prompt · Allowed tools · Hyperparameters        │
└─────────────────────────────────────────────────────────┘
                          ↓
               Runtime Prompt Assembly
    (Constitutional layer injected at prompt apex, always)
```

1. **Constitutional Layer (Immutable)**: Hardcoded safety rules that neither administrators, users, nor the model can alter or disregard.
2. **Persistent Skills Layer**: Granular rules and behavioral guardrails attached to agents that persist across conversations.
3. **Agent Configuration Layer**: Modifiable agent roles, tool permissions, and system prompts.

---

## ✨ Features

- **Constitutional Guardrails**: Enforces non-negotiable boundaries (confirmation before destructive operations, scope limits, impersonation prevention).
- **Persistent Skill Memory**: Assign modular skills (behavior, restriction, knowledge, preference) stored independently per agent.
- **Role-Based Access Control (RBAC)**: 5 distinct tiers—`Super Admin`, `Admin`, `Manager`, `User`, and `Viewer`.
- **Granular Agent Permissions**: Manage user-to-agent access matrices to prevent unauthorized model access.
- **Interactive Chat Interface**: Secure chat sessions evaluated with real-time constitutional context injection.
- **Audit Logging**: Comprehensive traceability tracking user actions, system modifications, and agent executions.
- **Zero-Cost Inference**: Integrated with Hugging Face Inference API (`Zephyr-7B-Beta`).
- **Responsive Theme**: Native light and dark mode with persistence.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, Lucide React
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy (Async), aiosqlite / asyncpg, Pydantic v2
- **Authentication**: JWT (JSON Web Tokens), passlib / bcrypt
- **AI / LLM**: Hugging Face Inference API (Zephyr-7B-Beta)
- **Deployment**: Vercel (Frontend), Railway (Backend)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- (Optional) Free Hugging Face Access Token

### 1. Clone Repository

```bash
git clone https://github.com/Joeljozzz/Cloud_UMP.git
cd Cloud_UMP
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The backend server starts at `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend application runs at `http://localhost:5173`.

---

## 📖 Usage

### Pre-Seeded Demo Credentials

The platform initializes demo accounts upon first startup:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Super Admin** | `admin@ump.dev` | `admin123` | Full administrative control, all agents & logs |
| **Manager** | `manager@ump.dev` | `user123` | User & agent management, Helpdesk & Analytics agents |
| **Demo User** | `user@ump.dev` | `user123` | Chat access to assigned agents (Helpdesk AI) |

### Testing Constitutional Guardrails

1. Log in as `user@ump.dev` and navigate to **Chat**.
2. Select the **Email Assistant** or **Help Desk AI**.
3. Attempt to bypass rules (e.g. asking the agent to delete records without confirmation or impersonate an administrator).
4. Observe the agent enforcing Layer 1 constitutional constraints regardless of prompt injection attempts.

---

## 📂 Project Structure

```text
Cloud_UMP/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, tokens, and app configuration
│   │   ├── db/             # SQLAlchemy async engine, base, and migrations
│   │   ├── models/         # User, Agent, AgentSkill, AgentAccess, AuditLog
│   │   ├── routers/        # auth, users, agents, chat, analytics
│   │   ├── schemas/        # Pydantic validation schemas
│   │   └── services/       # constitutional.py, agent_runner.py, rbac.py
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable templates
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (Layout, ThemeToggle, Cards)
│   │   ├── lib/            # Axios API client, Zustand state stores
│   │   ├── pages/          # Dashboard, Users, Agents, Chat, Analytics, About
│   │   ├── App.tsx         # Route configuration & protected routes
│   │   └── main.tsx        # Client entrypoint
│   ├── package.json        # Node dependencies and scripts
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── vite.config.ts      # Vite configuration
│
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — copyright (c) 2024 **Joel Jose**.