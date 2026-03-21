from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole, UserStatus
from app.models.agent import Agent, AgentStatus
from app.models.audit import AuditLog
from app.models.chat import ChatSession
from app.services.rbac import require_permission

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
async def overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "analytics:read")

    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()
    active_users = (await db.execute(select(func.count()).select_from(User).where(User.status == UserStatus.ACTIVE))).scalar()
    total_agents = (await db.execute(select(func.count()).select_from(Agent))).scalar()
    active_agents = (await db.execute(select(func.count()).select_from(Agent).where(Agent.status == AgentStatus.ACTIVE))).scalar()
    total_chats = (await db.execute(select(func.count()).select_from(ChatSession))).scalar()
    total_audit = (await db.execute(select(func.count()).select_from(AuditLog))).scalar()

    role_result = await db.execute(select(User.role, func.count()).group_by(User.role))
    role_breakdown = [{"role": r.value, "count": c} for r, c in role_result.all()]

    recent_audit = await db.execute(
        select(AuditLog, User).outerjoin(User, User.id == AuditLog.user_id)
        .order_by(AuditLog.created_at.desc()).limit(15)
    )
    audit_rows = [
        {
            "id": log.id, "action": log.action, "resource": log.resource,
            "success": log.success, "created_at": log.created_at,
            "user_email": user.email if user else None,
            "user_name": user.name if user else None,
        }
        for log, user in recent_audit.all()
    ]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_agents": total_agents,
        "active_agents": active_agents,
        "total_chats": total_chats,
        "total_audit_events": total_audit,
        "role_breakdown": role_breakdown,
        "recent_audit": audit_rows,
    }
