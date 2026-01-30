"""Security helpers: password hashing and JWT token creation/verification."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

settings = get_settings()

# Usar argon2 en lugar de bcrypt para compatibilidad con Python 3.13
# Argon2 es el ganador de Password Hashing Competition - más seguro y moderno
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# --- Constants ---
ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña plana contra su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera un hash seguro para la contraseña."""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crea un Access Token JWT de corta duración."""
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access",
        "iss": "ecco-ia-auth"
    })
    token = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return token.decode("utf-8") if isinstance(token, bytes) else token

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Crea un Refresh Token JWT de larga duración (ej. 30 días)."""
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + timedelta(days=30)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "refresh",
        "iss": "ecco-ia-auth"
    })
    token = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return token.decode("utf-8") if isinstance(token, bytes) else token

def decode_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
    """
    Decodifica y valida un token. 
    Verifica el tipo de token para prevenir el uso de refresh tokens como access tokens.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            raise JWTError(f"Invalid token type: expected {expected_type}")
        return payload
    except JWTError:
        raise
