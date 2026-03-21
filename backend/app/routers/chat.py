from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.agent_runner import run_agent
from app.services.rbac import require_permission
from pydantic import BaseModel

router = APIRouter(prefix="/api/chat", tags=["chat"])


class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    agent_id: str
    messages: list[Message]


@router.post("")
async def chat(
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "agents:use")

    user_context = {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value,
    }

    try:
        result = await run_agent(
            db=db,
            agent_id=data.agent_id,
            user_id=current_user.id,
            user_context=user_context,
            messages=[{"role": m.role, "content": m.content} for m in data.messages],
        )
        return result
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
