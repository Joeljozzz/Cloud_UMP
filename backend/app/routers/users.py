from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from app.db.database import get_db
from app.core.deps import get_current_user
from app.core.security import hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.audit import AuditLog
from app.services.rbac import require_permission, can_manage_user
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str = "changeme123"
    role: UserRole = UserRole.VIEWER


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str]
    role: str
    status: str
    last_login_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("")
async def list_users(
    search: str = Query("", description="Search by name or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "users:read")
    q = select(User)
    if search:
        q = q.where((User.email.ilike(f"%{search}%")) | (User.name.ilike(f"%{search}%")))
    
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    
    q = q.offset((page - 1) * limit).limit(limit).order_by(User.created_at.desc())
    result = await db.execute(q)
    users = result.scalars().all()
    
    return {
        "users": [{"id": u.id, "email": u.email, "name": u.name,
                   "role": u.role.value, "status": u.status.value,
                   "last_login_at": u.last_login_at, "created_at": u.created_at}
                  for u in users],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", status_code=201)
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "users:create")
    if not can_manage_user(current_user.role, data.role):
        raise HTTPException(status_code=403, detail="Cannot create user with equal or higher role")

    exists = await db.execute(select(User).where(User.email == data.email))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already in use")

    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        role=data.role,
        status=UserStatus.ACTIVE,
    )
    db.add(user)
    log = AuditLog(id=str(uuid.uuid4()), user_id=current_user.id, action="USER_CREATED",
                   resource=f"user:{user.id}", details={"email": data.email, "role": data.role.value})
    db.add(log)
    await db.commit()
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role.value, "status": user.status.value}


@router.patch("/{user_id}")
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "users:update")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not can_manage_user(current_user.role, user.role):
        raise HTTPException(status_code=403, detail="Cannot modify user with equal or higher role")

    if data.name is not None: user.name = data.name
    if data.role is not None: user.role = data.role
    if data.status is not None: user.status = data.status

    log = AuditLog(id=str(uuid.uuid4()), user_id=current_user.id, action="USER_UPDATED",
                   resource=f"user:{user_id}", details=data.model_dump(exclude_none=True))
    db.add(log)
    await db.commit()
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role.value, "status": user.status.value}


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "users:delete")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if not can_manage_user(current_user.role, user.role):
        raise HTTPException(status_code=403, detail="Cannot delete user with equal or higher role")

    log = AuditLog(id=str(uuid.uuid4()), user_id=current_user.id, action="USER_DELETED",
                   resource=f"user:{user_id}", details={"email": user.email})
    db.add(log)
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}
