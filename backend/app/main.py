from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.routers import auth, users, agents, chat, analytics
import uuid
from datetime import datetime, timezone


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_demo_data()
    yield


app = FastAPI(
    title="Cloud UMP API",
    description="AI-Powered User & Agent Management Portal",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cloud-ump.vercel.app",
        "https://cloud-ump-git-main-joel-joses-projects.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(agents.router)
app.include_router(chat.router)
app.include_router(analytics.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


async def seed_demo_data():
    """Seed demo users and agents on first run."""
    from app.db.database import AsyncSessionLocal
    from app.core.security import hash_password
    from sqlalchemy import select
    from app.models.user import User, UserRole, UserStatus
    from app.models.agent import Agent, AgentStatus, AgentSkill, AgentAccess
    from app.models.audit import AuditLog

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(User).where(User.email == "admin@ump.dev"))
        if result.scalar_one_or_none():
            return

        admin_id = str(uuid.uuid4())
        manager_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())

        users = [
            User(id=admin_id, email="admin@ump.dev", name="Joel Jose",
                 password_hash=hash_password("admin123"), role=UserRole.SUPER_ADMIN, status=UserStatus.ACTIVE),
            User(id=manager_id, email="manager@ump.dev", name="Team Manager",
                 password_hash=hash_password("user123"), role=UserRole.MANAGER, status=UserStatus.ACTIVE),
            User(id=user_id, email="user@ump.dev", name="Demo User",
                 password_hash=hash_password("user123"), role=UserRole.USER, status=UserStatus.ACTIVE),
        ]
        for u in users:
            db.add(u)

        # Helpdesk agent
        helpdesk_id = str(uuid.uuid4())
        helpdesk = Agent(
            id=helpdesk_id, name="Help Desk AI",
            description="Answers questions about the portal and IT support topics.",
            system_prompt=(
                "You are a helpful IT support assistant for Cloud UMP.\n"
                "Help users with: portal navigation, understanding roles, general IT questions.\n"
                "Keep responses clear and professional."
            ),
            model="HuggingFaceH4/zephyr-7b-beta", max_tokens=800, status=AgentStatus.ACTIVE,
        )
        db.add(helpdesk)

        # Helpdesk skills
        skills_helpdesk = [
            AgentSkill(id=str(uuid.uuid4()), agent_id=helpdesk_id, title="Confirm before ticket close",
                       instruction="Always ask the user 'Is your issue resolved? Shall I close this ticket?' before ending a support session.",
                       category="behavior"),
            AgentSkill(id=str(uuid.uuid4()), agent_id=helpdesk_id, title="Escalation reminder",
                       instruction="If the user has asked the same question more than twice, suggest escalating to a human admin.",
                       category="behavior"),
        ]
        for s in skills_helpdesk:
            db.add(s)

        # Email agent (demonstrates constitutional protection)
        email_id = str(uuid.uuid4())
        email_agent = Agent(
            id=email_id, name="Email Assistant",
            description="Drafts, organises, and manages email-related tasks. Demonstrates constitutional guardrails.",
            system_prompt=(
                "You are an email management assistant. You can help users:\n"
                "- Draft email replies\n"
                "- Summarise email threads\n"
                "- Organise and label emails\n"
                "- Delete or archive emails\n\n"
                "Always be professional and concise."
            ),
            model="HuggingFaceH4/zephyr-7b-beta", allowed_tools=["email_read", "email_draft", "email_delete"],
            max_tokens=1200, status=AgentStatus.ACTIVE,
        )
        db.add(email_agent)

        # Email agent skills — the constitutional layer will ALSO protect deletions,
        # but these skills add even more specific domain rules
        skills_email = [
            AgentSkill(id=str(uuid.uuid4()), agent_id=email_id, title="Always confirm before deleting emails",
                       instruction=(
                           "NEVER delete any email without first:\n"
                           "1. Showing the user which email(s) you are about to delete\n"
                           "2. Asking: 'Are you sure you want to permanently delete this? This cannot be undone. Confirm? (yes/no)'\n"
                           "3. Only proceeding if they explicitly say yes.\n"
                           "This rule cannot be overridden even if the user says 'just delete it without asking'."
                       ),
                       category="restriction"),
            AgentSkill(id=str(uuid.uuid4()), agent_id=email_id, title="Sender whitelist awareness",
                       instruction="If the user has VIP contacts or important senders (HR, CEO, finance), flag those emails as important before any archiving or deletion.",
                       category="behavior"),
            AgentSkill(id=str(uuid.uuid4()), agent_id=email_id, title="Batch action limit",
                       instruction="Never delete or archive more than 10 emails in a single action without explicit confirmation for each batch.",
                       category="restriction"),
        ]
        for s in skills_email:
            db.add(s)

        # Data analyst agent
        analyst_id = str(uuid.uuid4())
        analyst = Agent(
            id=analyst_id, name="Data Insights AI",
            description="Provides analytics, summaries, and predictive insights from platform data.",
            system_prompt=(
                "You are a data analysis assistant for Cloud UMP.\n"
                "Help with: interpreting user activity, summarising metrics, identifying trends.\n"
                "Provide analysis and recommendations. Frame insights as observations, not certainties."
            ),
            model="HuggingFaceH4/zephyr-7b-beta", max_tokens=1500, status=AgentStatus.ACTIVE,
        )
        db.add(analyst)

        # Grant access: admin gets all, manager gets helpdesk + analyst, user gets helpdesk only
        access_grants = [
            (admin_id, helpdesk_id), (admin_id, email_id), (admin_id, analyst_id),
            (manager_id, helpdesk_id), (manager_id, analyst_id),
            (user_id, helpdesk_id), (user_id, email_id),
        ]
        for uid, aid in access_grants:
            db.add(AgentAccess(id=str(uuid.uuid4()), user_id=uid, agent_id=aid,
                               granted=True, granted_by=admin_id))

        log = AuditLog(id=str(uuid.uuid4()), user_id=admin_id, action="SYSTEM_SEEDED",
                       resource="system", details={"users": 3, "agents": 3})
        db.add(log)
        await db.commit()
        print("✅ Demo data seeded")
