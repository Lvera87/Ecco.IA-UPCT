import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import async_engine
from app.models.user import User
from app.models.campus import Campus, Infrastructure, ConsumptionRecord
from app.core.security import get_password_hash
from sqlalchemy.orm import sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_data")

async def seed_data():
    AsyncSessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with AsyncSessionLocal() as db:
        logger.info("Verificando si ya existen datos...")
        result = await db.execute(select(User).where(User.email == "admin@uptc.edu.co"))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            logger.info("El usuario mock ya existe. Saltando seeding.")
            return

        logger.info("Creando usuario administrador institucional...")
        admin_user = User(
            username="admin_uptc",
            email="admin@uptc.edu.co",
            full_name="Administrador Sostenibilidad UPTC",
            hashed_password=get_password_hash("Password123!"),
            user_type="campus_admin"
        )
        db.add(admin_user)
        await db.flush() # Para obtener el ID

        logger.info(f"Creando sedes para el usuario {admin_user.username}...")
        
        # Sede Tunja
        tunja = Campus(
            user_id=admin_user.id,
            name="Sede Central Tunja",
            location_city="Tunja",
            population_students=15400,
            population_staff=1200,
            total_area_sqm=52300.0,
            primary_usage="Mixed/Academic",
            baseline_energy_kwh=4500.0, # promedio diario
            target_reduction_percent=10.0
        )
        db.add(tunja)
        
        # Sede Duitama
        duitama = Campus(
            user_id=admin_user.id,
            name="Seccional Duitama",
            location_city="Duitama",
            population_students=4200,
            population_staff=350,
            total_area_sqm=12500.0,
            primary_usage="Engineering/Technical",
            baseline_energy_kwh=1200.0,
            target_reduction_percent=8.0
        )
        db.add(duitama)
        await db.flush()

        logger.info("Añadiendo infraestructura a las sedes...")
        
        # Infraestructura Tunja
        db.add_all([
            Infrastructure(campus_id=tunja.id, name="Edificio Administrativo", unit_type="administrative", area_sqm=4500, avg_daily_consumption=450.5, status=True),
            Infrastructure(campus_id=tunja.id, name="Facultad de Ingeniería", unit_type="lab", area_sqm=8200, avg_daily_consumption=1200.0, is_critical=True, status=True),
            Infrastructure(campus_id=tunja.id, name="Biblioteca Central", unit_type="library", area_sqm=3100, avg_daily_consumption=280.0, status=True),
            Infrastructure(campus_id=tunja.id, name="Cafetería Central", unit_type="canteen", area_sqm=1200, avg_daily_consumption=350.0, status=True)
        ])
        
        # Infraestructura Duitama
        db.add_all([
            Infrastructure(campus_id=duitama.id, name="Bloque A - Aulas", unit_type="building", area_sqm=3000, avg_daily_consumption=180.0, status=True),
            Infrastructure(campus_id=duitama.id, name="Talleres Mecánica", unit_type="lab", area_sqm=2500, avg_daily_consumption=600.0, is_critical=True, status=True)
        ])

        logger.info("Generando registros históricos de consumo...")
        import random
        from datetime import datetime, timedelta
        
        # Generar 30 días de datos para electricidad y agua
        for i in range(30):
            date = datetime.now() - timedelta(days=i)
            # Tunja
            db.add(ConsumptionRecord(
                campus_id=tunja.id,
                user_id=admin_user.id,
                reading_value=4000 + random.uniform(0, 1000),
                reading_date=date,
                resource_type="electricity",
                source="sensor"
            ))
            db.add(ConsumptionRecord(
                campus_id=tunja.id,
                user_id=admin_user.id,
                reading_value=150 + random.uniform(0, 50),
                reading_date=date,
                resource_type="water",
                source="sensor"
            ))
            
            # Duitama
            db.add(ConsumptionRecord(
                campus_id=duitama.id,
                user_id=admin_user.id,
                reading_value=1000 + random.uniform(0, 400),
                reading_date=date,
                resource_type="electricity",
                source="sensor"
            ))

        await db.commit()
        logger.info("¡Datos mock creados exitosamente!")
        logger.info(f"Usuario: {admin_user.email}")
        logger.info(f"Contraseña: Password123!")

if __name__ == "__main__":
    asyncio.run(seed_data())
