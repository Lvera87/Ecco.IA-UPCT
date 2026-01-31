
import sys
import os
import asyncio

# Hack para path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.db.session import get_async_engine
from app.db.models import Infrastructure, Campus, User

async def populate():
    print("Iniciando población de datos semilla...")
    engine = get_async_engine()
    AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        # 1. Buscar Campus (Sogamoso o Tunja)
        stmt = select(Campus)
        result = await db.execute(stmt)
        campuses = result.scalars().all()
        
        target_campus = None
        for c in campuses:
            print(f"Encontrado Campus: {c.name}")
            if "sogamoso" in c.name.lower():
                target_campus = c
                break
        
        if not target_campus and campuses:
            target_campus = campuses[0] # Fallback al primero
            print(f"Usando fallback campus: {target_campus.name}")
            
        if not target_campus:
            print("ERROR: No hay campus en la base de datos.")
            return

        print(f"Insertando infraestructura para: {target_campus.name}")
        
        # 2. Verificar si ya tiene datos
        infra_check = await db.execute(select(Infrastructure).where(Infrastructure.campus_id == target_campus.id))
        if infra_check.scalars().first():
            print("El campus ya tiene infraestructura. Omitiendo inserción.")
            # Borrar para regenerar? No, mejor añadir si faltan tipos específicos.
            # return 
        
        # 3. Insertar Datos Semilla para activar los Modelos de Miguel
        new_units = [
            Infrastructure(
                name="Laboratorio de Hidráulica",
                campus_id=target_campus.id,
                unit_type="laboratory",
                area_sqm=350.0,
                avg_daily_consumption=0.0 # Dejar en 0 para que el sistema use la predicción del modelo
            ),
            Infrastructure(
                name="Sala de Cómputo Avanzado",
                campus_id=target_campus.id,
                unit_type="laboratory",
                area_sqm=120.0,
                avg_daily_consumption=0.0
            ),
             Infrastructure(
                name="Bloque Aulas C",
                campus_id=target_campus.id,
                unit_type="classroom",
                area_sqm=1200.0,
                avg_daily_consumption=0.0
            ),
             Infrastructure(
                name="Oficinas Administrativas Norte",
                campus_id=target_campus.id,
                unit_type="office",
                area_sqm=500.0,
                avg_daily_consumption=0.0
            )
        ]
        
        for u in new_units:
            db.add(u)
        
        await db.commit()
        print(f"Insertadas {len(new_units)} unidades de infraestructura.")

if __name__ == "__main__":
    asyncio.run(populate())
