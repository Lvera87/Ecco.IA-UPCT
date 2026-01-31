import asyncio
from app.db.session import get_async_engine
from app.models.campus import Campus
from sqlalchemy import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

async def check_campuses():
    engine = get_async_engine()
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        result = await session.execute(select(Campus))
        campuses = result.scalars().all()
        print(f"CANTIDAD DE CAMPUS EN BD: {len(campuses)}")
        for c in campuses:
            print(f" - ID: {c.id}, NOMBRE: {c.name}")

if __name__ == "__main__":
    asyncio.run(check_campuses())
