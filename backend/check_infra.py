
import sys
import os
import asyncio

# Añadir el directorio actual al path para encontrar 'app'
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.db.session import get_async_engine
from app.db.models import Infrastructure, Campus

async def check_infrastructure():
    engine = get_async_engine()
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with AsyncSessionLocal() as db:
        print("--- Verificando Infraestructura ---")
        campuses = await db.execute(select(Campus))
        for c in campuses.scalars():
            print(f"Campus: {c.name} (ID: {c.id})")
            infra = await db.execute(select(Infrastructure).where(Infrastructure.campus_id == c.id))
            units = infra.scalars().all()
            if not units:
                print(f"  [ALERTA] No hay infraestructura registrada para este campus -> Gemini no tendrá datos para iterar.")
            else:
                print(f"  [OK] Encontradas {len(units)} unidades.")
                for u in units: # Mostrar todas para ver tipos
                    print(f"    - {u.name} ({u.unit_type}) Area: {u.area_sqm}m2")

if __name__ == "__main__":
    asyncio.run(check_infrastructure())
