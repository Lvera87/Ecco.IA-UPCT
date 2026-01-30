"""Database session management."""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from typing import AsyncGenerator

settings = get_settings()

# Lazily create the engine to avoid requiring DB driver packages during
# import-time (useful for lightweight test environments).
_engine = None

import logging
logger = logging.getLogger("app.db")

def get_async_engine():
    """Return a lazily-initialized AsyncEngine instance."""
    global _engine
    if _engine is None:
        logger.info(f"Creando nuevo engine para {settings.database_url}")
        _engine = create_async_engine(
            settings.database_url,
            echo=True,
            future=True,
            pool_pre_ping=True,
            connect_args={"timeout": 15}
        )
    return _engine

# Export for scripts
async_engine = get_async_engine()


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session in async context."""
    logger.info("Solicitando sesión asíncrona...")
    engine = get_async_engine()
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with AsyncSessionLocal() as session:
        logger.info("Sesión abierta.")
        yield session
        logger.info("Sesión finalizada.")
