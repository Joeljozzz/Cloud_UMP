"""Role-Based Access Control — simple, explicit, readable."""
from app.models.user import UserRole
from fastapi import HTTPException, status

ROLE_HIERARCHY = {
    UserRole.SUPER_ADMIN: 5,
    UserRole.ADMIN: 4,
    UserRole.MANAGER: 3,
    UserRole.USER: 2,
    UserRole.VIEWER: 1,
}

PERMISSIONS = {
    "users:read":         [UserRole.VIEWER, UserRole.USER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "users:create":       [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "users:update":       [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "users:delete":       [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "users:manage_roles": [UserRole.SUPER_ADMIN],

    "agents:read":          [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "agents:use":           [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "agents:create":        [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "agents:update":        [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "agents:delete":        [UserRole.SUPER_ADMIN],
    "agents:manage_access": [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "agents:manage_skills": [UserRole.ADMIN, UserRole.SUPER_ADMIN],

    "analytics:read":   [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "audit:read":       [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "settings:update":  [UserRole.SUPER_ADMIN],
}


def has_permission(role: UserRole, permission: str) -> bool:
    return role in PERMISSIONS.get(permission, [])


def require_permission(role: UserRole, permission: str):
    if not has_permission(role, permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions: {permission} required",
        )


def can_manage_user(requester_role: UserRole, target_role: UserRole) -> bool:
    return ROLE_HIERARCHY[requester_role] > ROLE_HIERARCHY[target_role]
