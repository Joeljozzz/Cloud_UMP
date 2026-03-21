# Cloud UMP — AI-Powered User & Agent Management Portal

> Showcasing **Constitutional Access Control**: the concept that AI agents should have immutable safety constraints that cannot be overridden by any configuration.

## Architecture

```
frontend/   React + Vite + Tailwind (deploy to Vercel)
backend/    FastAPI + SQLAlchemy + SQLite (deploy to Railway / Render)
```

## The 3-Layer Agent Model

| Layer | What it is | Who controls it |
|-------|-----------|-----------------|
| Constitutional | Immutable rules (confirm before delete, scope boundaries, audit trail) | Platform — hardcoded, cannot be removed |
| Skills | Persistent context that survives across conversations | Admins — stored in DB per agent |
| Capability | System prompt + allowed tools | Admins — configurable per agent |

**Free AI**: Uses HuggingFace `zephyr-7b-beta` via free inference API. No API key needed for basic usage.

## Quick start (Codespaces)

1. Open repo in GitHub Codespaces — everything auto-installs
2. Terminal 1: `cd backend && uvicorn app.main:app --reload`
3. Terminal 2: `cd frontend && npm run dev`
4. Open port 5173 in browser

Demo accounts (auto-seeded):
- `admin@ump.dev` / `admin123` — full access
- `manager@ump.dev` / `user123` — analytics + agents
- `user@ump.dev` / `user123` — chat only

## Deploy

**Frontend → Vercel**: Connect repo, root is `frontend/`, build cmd `npm run build`, output `dist/`

**Backend → Railway or Render**:
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set `DATABASE_URL` (PostgreSQL) and `SECRET_KEY` env vars

**HuggingFace token** (optional): Add `HF_TOKEN` env var for higher rate limits (1000 req/day free).

## Key concept

The constitutional layer in `backend/app/services/constitutional.py` is always injected at the TOP of every agent's system prompt — before skills, before the agent's own config, before user context. This means no amount of prompt engineering can remove it.

```
Constitutional rules      ← ALWAYS first, immutable
+ Skills layer            ← persistent memory per agent
+ Agent system prompt     ← what admin configured  
+ User context            ← who is talking
= Full agent prompt
```
