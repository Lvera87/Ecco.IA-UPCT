from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from app.db.session import get_async_session
from app.models.campus import Campus, Infrastructure, ConsumptionRecord
from app.models.user import User
from app.api.deps import get_current_active_user
from app.schemas.campus import (
    Campus as CampusSchema, CampusCreate,
    Infrastructure as InfrastructureSchema, InfrastructureCreate,
    ConsumptionRecord as ConsumptionSchema, ConsumptionRecordCreate
)
from app.services.gemini_service import gemini_service
from app.services.prediction_service import prediction_service

router = APIRouter(tags=["Campus Management"])

# --- CAMPUS ENDPOINTS ---

@router.get("/campuses", response_model=List[CampusSchema])
async def list_campuses(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """List all campuses managed by the current user."""
    from sqlalchemy.orm import selectinload
    # TODO: Implement RBAC. For now, we allow any authenticated user to view all campuses for the demo.
    query = select(Campus).options(selectinload(Campus.infrastructure))
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/campuses", response_model=CampusSchema)
async def create_campus(
    campus_in: CampusCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Create a new campus."""
    campus = Campus(**campus_in.model_dump(), user_id=current_user.id)
    db.add(campus)
    await db.commit()
    await db.refresh(campus)
    return campus

@router.get("/campuses/{campus_id}", response_model=CampusSchema)
async def get_campus(
    campus_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get a specific campus."""
    from sqlalchemy.orm import selectinload
    # DEMO MODE: For demonstration purposes, user_id is temporarily ignored for campus lookup.
    query = select(Campus).where(Campus.id == campus_id).options(selectinload(Campus.infrastructure))
    
    result = await db.execute(query)
    campus = result.scalar_one_or_none()
    
    if not campus:
        raise HTTPException(status_code=404, detail="Campus not found")
        
    return campus

# --- INFRASTRUCTURE ENDPOINTS ---

@router.get("/campuses/{campus_id}/infrastructure", response_model=List[InfrastructureSchema])
async def list_infrastructure(
    campus_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """List infrastructure units for a specific campus."""
    # Verify ownership
    campus_res = await db.execute(select(Campus).where(Campus.id == campus_id, Campus.user_id == current_user.id))
    if not campus_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Campus not found")
        
    result = await db.execute(select(Infrastructure).where(Infrastructure.campus_id == campus_id))
    return result.scalars().all()

@router.post("/campuses/{campus_id}/infrastructure", response_model=InfrastructureSchema)
async def create_infrastructure(
    campus_id: int,
    unit_in: InfrastructureCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Add a building or unit to a campus."""
    # Verify ownership
    campus_res = await db.execute(select(Campus).where(Campus.id == campus_id, Campus.user_id == current_user.id))
    if not campus_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Campus not found")

    unit = Infrastructure(**unit_in.model_dump(), campus_id=campus_id)
    db.add(unit)
    await db.commit()
    await db.refresh(unit)
    return unit

# --- GLOBAL DASHBOARD ---

@router.get("/global-dashboard")
async def get_global_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get consolidated metrics for all campuses."""
    # 1. Get all campuses
    campuses_res = await db.execute(select(Campus).where(Campus.user_id == current_user.id))
    campuses = campuses_res.scalars().all()
    
    total_students = sum(c.population_students for c in campuses)
    total_area = sum(c.total_area_sqm or 0 for c in campuses)
    
    # 2. Mock aggregated consumption (Replace with real aggregation later)
    # In a real scenario we would sum ConsumptionRecord for the current month.
    total_consumption_kwh = sum(c.baseline_energy_kwh or 0 for c in campuses) * 30 
    
    return {
        "summary": {
            "total_campuses": len(campuses),
            "total_students": total_students,
            "total_area_sqm": total_area,
            "monthly_consumption_kwh": total_consumption_kwh,
            "carbon_footprint_tons": total_consumption_kwh * 0.000126 # Mock factor
        },
        "campuses": [
            {
                "id": c.id, 
                "name": c.name, 
                "city": c.location_city, 
                "students": c.population_students,
                "status": "Optimal" # Mock status
            } for c in campuses
        ]
    }

# --- AI INSIGHTS ---

@router.post("/campuses/{campus_id}/ai-analysis")
async def analyze_campus(
    campus_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Generate AI insights for a specific campus."""
    # 1. Fetch Campus Data
    # 1. Fetch Campus Data (Demo mode: ignores user_id)
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus: raise HTTPException(status_code=404, detail="Campus not found")
    
    # 2. Fetch Infrastructure
    infra_res = await db.execute(select(Infrastructure).where(Infrastructure.campus_id == campus_id))
    infrastructure = infra_res.scalars().all()
    
    # 3. Build Context
    campus_context = {
        "name": campus.name,
        "city": campus.location_city,
        "students": campus.population_students,
        "total_area": campus.total_area_sqm,
        "baseline_consumption": campus.baseline_energy_kwh,
        "infrastructure": [
            {
                "name": unit.name,
                "type": unit.unit_type,
                "area": unit.area_sqm,
                "daily_consumption": unit.avg_daily_consumption,
                "status": "operational" if unit.status else "maintenance"
            } for unit in infrastructure
        ]
    }
    
    # 4. Call Gemini
    insights = await gemini_service.get_campus_insights(campus_context)
    return insights

# --- PREDICTIONS & ML ---

@router.get("/campuses/{campus_id}/predictions")
async def get_campus_predictions(
    campus_id: int,
    days: int = 7,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Combina modelos Prophet de Miguel con Gemini para ofrecer proyecciones inteligentes.
    """
    # 1. Verificar existencia y obtener nombre para mapear modelo (Demo mode)
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus: 
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    # 2. Mapear nombre de sede a código de modelo
    name_map = {
        "tunja": "tun",
        "duitama": "dui",
        "sogamoso": "sog",
        "chiquinquira": "chi"
    }
    
    # Intenta encontrar el código en el nombre o ciudad
    campus_code = "tun" # Default fallback
    found = False
    search_text = (campus.name + " " + (campus.location_city or "")).lower()
    
    for name, code in name_map.items():
        if name in search_text:
            campus_code = code
            found = True
            break
    
    # 3. Obtener predicción de ML
    ml_forecast = prediction_service.predict_campus_consumption(campus_code, days=days)
    
    if not ml_forecast:
        return {"error": f"No hay modelos de ML disponibles para la sede {campus.name}"}

    # 4. Obtener Insight de Gemini basado en la predicción
    ai_insight = await gemini_service.get_prediction_insights(ml_forecast, campus.name)
    
    return {
        "campus_id": campus_id,
        "campus_name": campus.name,
        "forecast": ml_forecast,
        "ai_analysis": ai_insight
    }
