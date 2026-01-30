import asyncio
import sys
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Add backend to path
sys.path.append(os.getcwd())

from app.db.session import get_async_session
from app.models.user import User
from app.models.infrastructure import CampusProfile, InstitutionalAsset, ConsumptionRecord
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random

async def seed_uptc_data():
    print("🎓 Iniciando Seed de Infraestructura UPTC...")
    
    async for db in get_async_session():
        # 1. Crear Admin UPTC
        result = await db.execute(select(User).where(User.username == "admin_uptc"))
        admin = result.scalar_one_or_none()
        
        if not admin:
            admin = User(
                username="admin_uptc",
                email="infraestructura@uptc.edu.co",
                full_name="Dirección de Planeación UPTC",
                hashed_password=get_password_hash("uptc2026"),
                user_type="infrastructure"
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            print("✅ Usuario Admin creado")
        else:
            print("ℹ️ Usuario Admin ya existe")

        # 2. Crear Sede Central (Tunja)
        result = await db.execute(select(CampusProfile).where(CampusProfile.user_id == admin.id))
        campus = result.scalar_one_or_none()
        
        if not campus:
            campus = CampusProfile(
                user_id=admin.id,
                name="Sede Central Tunja",
                location_city="Tunja",
                population_students=18500,
                population_staff=1200,
                total_area_sqm=45000.0,
                primary_usage="Académico-Administrativo",
                baseline_energy_kwh=125000.0,
                target_reduction_percent=15.0
            )
            db.add(campus)
            await db.commit()
            await db.refresh(campus)
            print("✅ Sede Central Tunja creada")
        
        # 3. Crear Activos Institucionales (Bloques)
        assets_data = [
            {"name": "Iluminación Bloque Administrativo", "type": "lighting", "kwh": 450.5, "critical": False},
            {"name": "Datacenter Edificio C", "type": "server", "kwh": 1200.0, "critical": True},
            {"name": "Climatización Auditorio", "type": "hvac", "kwh": 800.0, "critical": False},
            {"name": "Laboratorios de Ingeniería", "type": "hvac", "kwh": 650.0, "critical": True},
            {"name": "Iluminación Exterior Campus", "type": "lighting", "kwh": 320.0, "critical": False},
        ]
        
        for asset_info in assets_data:
            asset = InstitutionalAsset(
                campus_id=campus.id,
                name=asset_info["name"],
                unit_type=asset_info["type"],
                avg_daily_consumption=asset_info["kwh"],
                is_critical=asset_info["critical"],
                status=True
            )
            db.add(asset)
        
        print(f"✅ {len(assets_data)} Activos Institucionales creados")

        # 4. Generar Historial de Consumo (Últimos 30 días)
        # Simular curva de consumo universitario (baja fines de semana)
        today = datetime.now()
        readings = []
        
        for i in range(30):
            date = today - timedelta(days=i)
            is_weekend = date.weekday() >= 5
            
            # Base load + variabilidad
            daily_kwh = 3500.0 if is_weekend else 5800.0
            daily_kwh += random.uniform(-200, 500) # Variación
            
            record = ConsumptionRecord(
                campus_id=campus.id,
                user_id=admin.id,
                reading_value=round(daily_kwh, 2),
                reading_date=date,
                resource_type="electricity",
                source="iot_sensor_main"
            )
            readings.append(record)
            
        db.add_all(readings)
        await db.commit()
        print(f"✅ Historial de {len(readings)} días generado")
        
        print("\n🚀 Seed Completado Exitosamente!")
        print("Credenciales: admin_uptc / uptc2026")
        break

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_uptc_data())
