from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.agent import Agent, AgentStatus, AgentAccess, AgentSkill
from app.models.user import User
from app.models.audit import AuditLog
from app.services.rbac import require_permission
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/agents", tags=["agents"])


class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: str
    model: str = "claude-sonnet-4-20250514"
    allowed_tools: list[str] = []
    max_tokens: int = 1000
    temperature: float = 0.7


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    allowed_tools: Optional[list[str]] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    status: Optional[AgentStatus] = None


class SkillCreate(BaseModel):
    title: str
    instruction: str
    category: str = "behavior"  # behavior | restriction | preference | knowledge


class AccessGrant(BaseModel):
    user_id: str
    granted: bool = True


def agent_dict(a: Agent) -> dict:
    return {
        "id": a.id, "name": a.name, "description": a.description,
        "system_prompt": a.system_prompt, "model": a.model,
        "allowed_tools": a.allowed_tools or [], "max_tokens": a.max_tokens,
        "temperature": a.temperature, "status": a.status.value,
        "created_at": a.created_at, "updated_at": a.updated_at,
    }


@router.get("")
async def list_agents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:read")
    result = await db.execute(select(Agent).order_by(Agent.created_at.desc()))
    agents = result.scalars().all()
    return [agent_dict(a) for a in agents]


@router.get("/my")
async def my_agents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Agents the current user has access to."""
    require_permission(current_user.role, "agents:use")
    result = await db.execute(
        select(Agent).join(AgentAccess, (AgentAccess.agent_id == Agent.id) &
               (AgentAccess.user_id == current_user.id) & (AgentAccess.granted == True))
        .where(Agent.status == AgentStatus.ACTIVE)
    )
    agents = result.scalars().all()
    return [agent_dict(a) for a in agents]


@router.post("", status_code=201)
async def create_agent(
    data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:create")
    agent = Agent(id=str(uuid.uuid4()), **data.model_dump(), status=AgentStatus.DRAFT)
    db.add(agent)
    log = AuditLog(id=str(uuid.uuid4()), user_id=current_user.id, action="AGENT_CREATED",
                   resource=f"agent:{agent.id}", details={"name": data.name})
    db.add(log)
    await db.commit()
    return agent_dict(agent)


@router.patch("/{agent_id}")
async def update_agent(
    agent_id: str,
    data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:update")
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(agent, field, value)

    log = AuditLog(id=str(uuid.uuid4()), user_id=current_user.id, action="AGENT_UPDATED",
                   resource=f"agent:{agent_id}", details=data.model_dump(exclude_none=True))
    db.add(log)
    await db.commit()
    return agent_dict(agent)


# --- Skills ---

@router.get("/{agent_id}/skills")
async def get_skills(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:read")
    result = await db.execute(select(AgentSkill).where(AgentSkill.agent_id == agent_id))
    skills = result.scalars().all()
    return [{"id": s.id, "title": s.title, "instruction": s.instruction,
             "category": s.category, "is_active": s.is_active, "created_at": s.created_at}
            for s in skills]


@router.post("/{agent_id}/skills", status_code=201)
async def add_skill(
    agent_id: str,
    data: SkillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:manage_skills")
    skill = AgentSkill(id=str(uuid.uuid4()), agent_id=agent_id, **data.model_dump())
    db.add(skill)
    log = AuditLog(id=str(uuid.uuid4()), user_id=current_user.id, action="SKILL_ADDED",
                   resource=f"agent:{agent_id}", details={"title": data.title, "category": data.category})
    db.add(log)
    await db.commit()
    return {"id": skill.id, "title": skill.title, "instruction": skill.instruction,
            "category": skill.category, "is_active": skill.is_active}


@router.delete("/{agent_id}/skills/{skill_id}")
async def delete_skill(
    agent_id: str, skill_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:manage_skills")
    result = await db.execute(select(AgentSkill).where(AgentSkill.id == skill_id, AgentSkill.agent_id == agent_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    await db.delete(skill)
    await db.commit()
    return {"message": "Skill deleted"}


# --- Access management ---

@router.get("/{agent_id}/access")
async def get_access(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:manage_access")
    result = await db.execute(
        select(AgentAccess, User).join(User, User.id == AgentAccess.user_id)
        .where(AgentAccess.agent_id == agent_id)
    )
    rows = result.all()
    return [{"id": a.id, "user_id": a.user_id, "granted": a.granted,
             "user_email": u.email, "user_name": u.name}
            for a, u in rows]


@router.post("/{agent_id}/access")
async def grant_access(
    agent_id: str,
    data: AccessGrant,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:manage_access")
    existing = await db.execute(
        select(AgentAccess).where(AgentAccess.agent_id == agent_id, AgentAccess.user_id == data.user_id)
    )
    access = existing.scalar_one_or_none()
    if access:
        access.granted = data.granted
    else:
        access = AgentAccess(id=str(uuid.uuid4()), agent_id=agent_id,
                             user_id=data.user_id, granted=data.granted,
                             granted_by=current_user.id)
        db.add(access)
    log = AuditLog(id=str(uuid.uuid4()), user_id=current_user.id,
                   action="ACCESS_GRANTED" if data.granted else "ACCESS_REVOKED",
                   resource=f"agent:{agent_id}", details={"target_user": data.user_id})
    db.add(log)
    await db.commit()
    return {"message": "Access updated"}
