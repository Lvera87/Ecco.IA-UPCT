import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User

async def test_db():
    engine = create_async_engine("sqlite+aiosqlite:///./sql_app.db")
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with AsyncSessionLocal() as session:
        print("Intentando consultar usuario...")
        result = await session.execute(select(User))
        users = result.scalars().all()
        print(f"Usuarios encontrados: {len(users)}")
        for u in users:
            print(f"- {u.username} ({u.email})")

if __name__ == "__main__":
    asyncio.run(test_db())
