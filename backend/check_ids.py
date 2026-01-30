import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.campus import Campus

async def check():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Campus))
        campuses = result.scalars().all()
        print(f"IDs encontrados: {[c.id for c in campuses]}")

if __name__ == "__main__":
    asyncio.run(check())
