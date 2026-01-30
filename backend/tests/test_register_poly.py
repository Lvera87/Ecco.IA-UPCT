import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from polyfactory.factories.pydantic_factory import ModelFactory as PydanticFactory
from typing import AsyncGenerator

from app.schemas.auth import RegisterRequest
from app.models.user import User
from app.models.infrastructure import CampusProfile
from app.db.base import Base

# Factory para generar datos de registro aleatorios pero válidos
class RegisterRequestFactory(PydanticFactory[RegisterRequest]):
    __model__ = RegisterRequest

@pytest.fixture(autouse=True)
def clear_db_engine():
    """Limpia el engine global para forzar su recreación en cada test."""
    import app.db.session
    app.db.session._engine = None
    yield

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Fixture para obtener una sesión de base de datos para cada test."""
    from app.db.session import get_async_engine
    engine = get_async_engine()
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture(scope="function", autouse=True)
async def clean_db_users():
    """Limpia los usuarios creados después de cada test."""
    from app.db.session import get_async_engine
    from sqlalchemy import text
    yield
    engine = get_async_engine()
    async with engine.begin() as conn:
        # El orden es vital por las FKs
        await conn.execute(text("DELETE FROM campus_profiles"))
        await conn.execute(text("DELETE FROM users"))

@pytest.mark.asyncio
async def test_register_infrastructure_user_persistence(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Generar datos
    payload = RegisterRequestFactory.build(user_type="infrastructure").model_dump()
    
    # 2. Ejecutar registro
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    
    # 3. Verificar en DB
    result = await db_session.execute(select(User).where(User.username == payload["username"]))
    user = result.scalar_one_or_none()
    
    assert user is not None, f"Usuario {payload['username']} no encontrado"
    assert user.email == payload["email"]
    
    # Verificar perfil
    profile_result = await db_session.execute(
        select(CampusProfile).where(CampusProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    assert profile is not None
    assert profile.campus_name == payload["campus_name"]