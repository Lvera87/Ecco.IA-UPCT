from typing import Optional, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User as UserModel
from app.core.security import verify_password, create_access_token, create_refresh_token

async def authenticate_user(db: AsyncSession, username_or_email: str, password: str) -> Optional[UserModel]:
    """Valida credenciales (username o email) y devuelve el usuario si es correcto."""
    import logging
    logger = logging.getLogger("app.auth")
    logger.info(f"Iniciando autenticación para: {username_or_email}")
    
    try:
        logger.info("Ejecutando consulta a la base de datos...")
        result = await db.execute(
            select(UserModel).where(
                (UserModel.username == username_or_email) | (UserModel.email == username_or_email)
            )
        )
        user = result.scalar_one_or_none()
        logger.info(f"Resultado de búsqueda: {'Encontrado' if user else 'No encontrado'}")
        
        if not user:
            return None
        
        logger.info("Verificando contraseña...")
        if not verify_password(password, user.hashed_password):
            logger.info("Contraseña incorrecta.")
            return None
            
        logger.info("Autenticación exitosa.")
        return user
    except Exception as e:
        logger.error(f"Error crítico en authenticate_user: {str(e)}", exc_info=True)
        raise

async def create_tokens_for_user(user: UserModel) -> Dict[str, str]:
    """Genera el set completo de tokens para una sesión."""
    payload = {"sub": str(user.id), "username": user.username}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload)
    }
