import asyncio
import logging
from app.db.session import get_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.campus import Campus
from app.models.user import User
from sqlalchemy import select

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Definir maker localmente
def get_session_maker():
    engine = get_async_engine()
    return sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

UPTC_CAMPUSES = [
    {
        "name": "Sede Central Tunja",
        "location_city": "Tunja",
        "population_students": 14500,
        "population_staff": 1200,
        "total_area_sqm": 450000.0, # Estimado grande
        "primary_usage": "Mixed", 
        "baseline_energy_kwh": 14500.0,
        "status": True # Online (Boolean en modelo original parece faltar mapped a 'status' string? Revisaré modelo)
        # Nota: modelo campus.py linea 54 tiene 'status' en Infrastructure, pero Campus no tiene status column visible en el view previo, 
        # Espera, vi el modelo en step 705.
        # Campus tiene: id, user_id, name, location_city, population..., baseline_energy_kwh
        # NO TIENE columna 'status' explícita en Campus (tiene en Infrastructure).
        # El frontend usaba c.status. Vamos a tener que inferirlo o agregarlo.
        # Por ahora, nos aseguramos que existan.
    },
    {
        "name": "Seccional Duitama",
        "location_city": "Duitama",
        "population_students": 6200,
        "population_staff": 450,
        "total_area_sqm": 120000.0,
        "primary_usage": "Technology",
        "baseline_energy_kwh": 8200.0,
    },
    {
        "name": "Seccional Sogamoso",
        "location_city": "Sogamoso",
        "population_students": 8500,
        "population_staff": 600,
        "total_area_sqm": 180000.0,
        "primary_usage": "Mining & Engineering",
        "baseline_energy_kwh": 11300.0,
    },
    {
        "name": "Sede Chiquinquirá",
        "location_city": "Chiquinquirá",
        "population_students": 2400,
        "population_staff": 150,
        "total_area_sqm": 45000.0,
        "primary_usage": "Administrative",
        "baseline_energy_kwh": 5400.0,
    }
]

async def seed_campuses():
    session_maker = get_session_maker()
    async with session_maker() as session:
        # 1. Obtener un usuario por defecto (admin o primero) para asignar las sedes
        result = await session.execute(select(User).limit(1))
        user = result.scalars().first()
        
        if not user:
            logger.error("No users found in DB. Please create a user first (register via API or seed users).")
            return

        logger.info(f"Assigning campuses to User ID: {user.id} ({user.email})")

        for campus_data in UPTC_CAMPUSES:
            # Check if exists
            query = select(Campus).where(Campus.name == campus_data["name"])
            existing = await session.execute(query)
            if existing.scalars().first():
                logger.info(f"Campus '{campus_data['name']}' already exists. Skipping.")
                continue
            
            # Create
            new_campus = Campus(
                user_id=user.id,
                name=campus_data["name"],
                location_city=campus_data["location_city"],
                population_students=campus_data["population_students"],
                population_staff=campus_data["population_staff"],
                total_area_sqm=campus_data["total_area_sqm"],
                primary_usage=campus_data["primary_usage"],
                baseline_energy_kwh=campus_data["baseline_energy_kwh"]
            )
            session.add(new_campus)
            logger.info(f"Created campus: {campus_data['name']}")
        
        await session.commit()
        logger.info("Campus seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_campuses())
