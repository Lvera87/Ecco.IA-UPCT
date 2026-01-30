"""Authentication endpoints (JWT login, register and refresh)."""
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_async_session
from app.services.auth import authenticate_user, create_tokens_for_user
from app.core.security import decode_token, get_password_hash
from app.models.user import User
from app.models.campus import Campus as CampusProfile

# =====================
# Schemas
# =====================

from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(tags=["auth"])

# =====================
# Endpoints
# =====================

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_async_session)) -> TokenResponse:
    """
    Registra un nuevo usuario con su perfil específico (residencial o industrial).
    Retorna tokens para auto-login inmediato.
    """
    import logging
    logger = logging.getLogger("app.auth")
    logger.info(f"Registrando nuevo usuario: {payload.username} ({payload.user_type})")
    # Verificar si el usuario ya existe
    existing = await db.execute(
        select(User).where((User.username == payload.username) | (User.email == payload.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario o email ya existe"
        )
    
    # Crear usuario
    new_user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        user_type="infrastructure"
    )
    db.add(new_user)
    await db.flush()  # Obtener ID sin commit
    
    # Crear Perfil de Campus UPTC
    campus = CampusProfile(
        user_id=new_user.id,
        campus_name=payload.campus_name,
        city=payload.city,
        total_area_sqm=payload.total_area_sqm,
        student_population=payload.student_population
    )
    db.add(campus)
    
    await db.commit()
    
    # Auto-login: generar tokens
    tokens = await create_tokens_for_user(new_user)
    return TokenResponse(**tokens, user_type=payload.user_type)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_async_session)) -> TokenResponse:
    """Inicia sesión y devuelve un par de tokens (Access + Refresh)."""
    import logging
    logger = logging.getLogger("app.auth")
    
    try:
        user = await authenticate_user(db, payload.username, payload.password)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
        
        tokens = await create_tokens_for_user(user)
        return TokenResponse(**tokens, user_type=user.user_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en login: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    """Permite obtener un nuevo access token usando un refresh token válido."""
    try:
        payload = decode_token(refresh_token, expected_type="refresh")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
            
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
            
        tokens = await create_tokens_for_user(user)
        return TokenResponse(**tokens)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de refresco inválido o expirado")
