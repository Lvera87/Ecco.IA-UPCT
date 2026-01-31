import asyncio
import logging
from app.db.session import async_engine, get_async_session
from app.models.campus import ConsumptionRecord, Campus
from sqlalchemy import select
from datetime import datetime, timedelta
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_history():
    async with async_engine.begin() as conn:
        # Create a session
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy.ext.asyncio import AsyncSession
        AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)
        
        async with AsyncSessionLocal() as db:
            logger.info("Checking for existing consumption records...")
            records = await db.execute(select(ConsumptionRecord))
            if records.scalars().first():
                logger.info("Records already exist. Skipping seed.")
                await db.close() # Ensure resources are released
                return

            logger.info("No records found. Seeding history...")
            
            # Get campuses
            result = await db.execute(select(Campus))
            campuses = result.scalars().all()
            
            if not campuses:
                logger.warning("No campuses found! Creating default campuses first...")
                # Create basic campuses if none exist (Safety fallback)
                campuses_data = [
                    Campus(user_id=1, name='Sede Tunja', location_city='Tunja', population_students=18000, baseline_energy_kwh=450.5),
                    Campus(user_id=1, name='Sede Duitama', location_city='Duitama', population_students=5500, baseline_energy_kwh=180.2),
                    Campus(user_id=1, name='Sede Sogamoso', location_city='Sogamoso', population_students=6000, baseline_energy_kwh=210.5),
                    Campus(user_id=1, name='Sede Chiquinquirá', location_city='Chiquinquirá', population_students=2000, baseline_energy_kwh=85.0)
                ]
                for c in campuses_data:
                    db.add(c)
                await db.commit()
                # Re-fetch
                result = await db.execute(select(Campus))
                campuses = result.scalars().all()

            for campus in campuses:
                base_load = campus.baseline_energy_kwh or 500
                logger.info(f"Seeding data for {campus.name} (Base: {base_load})")
                
                # Generate 30 days of data
                today = datetime.now()
                for i in range(30):
                    date = today - timedelta(days=i)
                    # Random usage curve
                    # Weekdays higher, weekends lower
                    is_weekend = date.weekday() >= 5
                    daily_factor = 0.6 if is_weekend else 1.0
                    
                    val = base_load * daily_factor * (1 + random.uniform(-0.15, 0.15))
                    
                    record = ConsumptionRecord(
                        campus_id=campus.id,
                        user_id=campus.user_id,
                        reading_value=round(val, 2),
                        reading_date=date,
                        resource_type="electricity",
                        source="simulated_seed"
                    )
                    db.add(record)
            
            await db.commit()
            logger.info("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_history())
