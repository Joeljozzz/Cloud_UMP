from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import uuid
from app.db.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.audit import AuditLog
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        log = AuditLog(id=str(uuid.uuid4()), action="LOGIN_FAILED", resource="auth",
                       details={"email": data.email}, success=False)
        db.add(log)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

    token = create_access_token({"sub": user.id, "role": user.role.value})
    user.last_login_at = datetime.now(timezone.utc)
    log = AuditLog(id=str(uuid.uuid4()), user_id=user.id, action="LOGIN_SUCCESS", resource="auth")
    db.add(log)
    await db.commit()

    return LoginResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role.value, "status": user.status.value}
    )


@router.post("/logout")
async def logout():
    return {"message": "Logged out"}


@router.get("/me")
async def me(db: AsyncSession = Depends(get_db),
             current_user: User = Depends(__import__("app.core.deps", fromlist=["get_current_user"]).get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value,
        "status": current_user.status.value,
    }
