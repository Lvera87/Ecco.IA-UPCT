from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import get_async_session
from app.models import User
from app.core.security import decode_token, get_password_hash

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.api_v1_prefix}/auth/login",
    auto_error=not settings.dev_mode  # No error en dev mode si no hay token
)

async def get_current_user(
    db: AsyncSession = Depends(get_async_session),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    """
    Dependency para obtener el usuario actual desde el JWT.
    En dev_mode, permite acceso sin token creando un usuario de desarrollo.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token de acceso",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # DEV MODE: Bypass para desarrollo local
    if settings.dev_mode and not token:
        from sqlalchemy.orm import selectinload
        query = (
            select(User)
            .where(User.username == "developer")
            .options(
                selectinload(User.campuses)
            )
        )
        result = await db.execute(query)
        dev_user = result.scalar_one_or_none()
        
        if not dev_user:
            dev_user = User(
                username="developer",
                email="dev@ecco-ia.local",
                full_name="Developer Ecco-IA",
                hashed_password=get_password_hash("dev123")
            )
            db.add(dev_user)
            await db.commit()
            await db.refresh(dev_user)
        return dev_user

    
    # PRODUCTION MODE: Validación JWT estricta
    if not token:
        raise credentials_exception
    
    try:
        payload = decode_token(token, expected_type="access")
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    from sqlalchemy.orm import selectinload
    query = (
        select(User)
        .where(User.id == int(user_id))
        .options(
            selectinload(User.campuses)
        )
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verifica además que el usuario no esté bloqueado o inactivo."""
    return current_user
