"""
Endpoints de Análisis Avanzado (Objetivos 2, 3 y 4)
- Detección de anomalías
- Análisis por sector
- Recomendaciones contextualizadas
- Explicabilidad (XAI)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import random

from app.db.session import get_async_session
from app.models.campus import Campus, Infrastructure, ConsumptionRecord
from app.models.user import User
from app.api.deps import get_current_active_user
from app.services.anomaly_service import anomaly_service
from app.services.xai_service import xai_service
from app.services.prediction_service import prediction_service
from app.services.gemini_service import gemini_service

router = APIRouter(tags=["Advanced Analytics"])


def generate_simulated_consumption_data(
    campus_id: int,
    days: int = 30,
    sector_type: str = "total"
) -> List[dict]:
    """
    Genera datos simulados de consumo horario para análisis.
    En producción, esto vendría de la tabla ConsumptionRecord.
    """
    data = []
    base_consumption = 50 + (campus_id * 10)  # Variar por campus
    
    # Perfiles horarios por sector
    hourly_profiles = {
        "comedores": [0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.8, 0.9, 0.5, 0.3, 0.4, 1.0, 1.2, 0.9, 0.4, 0.3, 0.5, 0.9, 1.0, 0.6, 0.3, 0.2, 0.1, 0.1],
        "salones": [0.05, 0.05, 0.05, 0.05, 0.05, 0.1, 0.6, 0.9, 1.0, 1.0, 1.0, 0.8, 0.7, 0.9, 1.0, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.05, 0.05],
        "laboratorios": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 0.7, 0.9, 1.0, 1.0, 0.8, 0.7, 0.9, 1.0, 1.0, 0.9, 0.7, 0.5, 0.3, 0.2, 0.15, 0.1, 0.1],
        "oficinas": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.8, 1.0, 1.0, 1.0, 0.9, 0.8, 0.9, 1.0, 1.0, 0.9, 0.5, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1],
        "total": [0.2, 0.15, 0.12, 0.1, 0.1, 0.15, 0.4, 0.7, 0.9, 1.0, 1.0, 0.95, 0.85, 0.9, 0.95, 0.9, 0.85, 0.7, 0.5, 0.4, 0.35, 0.3, 0.25, 0.2]
    }
    
    profile = hourly_profiles.get(sector_type.lower(), hourly_profiles["total"])
    
    now = datetime.now()
    for day in range(days):
        for hour in range(24):
            timestamp = now - timedelta(days=day, hours=23-hour)
            
            # Consumo base * perfil horario * variación aleatoria
            noise = random.uniform(0.85, 1.15)
            weekend_factor = 0.6 if timestamp.weekday() >= 5 else 1.0
            value = base_consumption * profile[hour] * noise * weekend_factor
            
            # Inyectar anomalías ocasionales (5% de probabilidad)
            if random.random() < 0.05:
                value *= random.choice([2.5, 0.2])  # Pico o caída
            
            data.append({
                "timestamp": timestamp.isoformat(),
                "hour": hour,
                "value": round(value, 2),
                "consumption": round(value, 2)  # Alias para compatibilidad
            })
    
    return data


@router.get("/campuses/{campus_id}/sector-analysis")
async def analyze_campus_sectors(
    campus_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Análisis completo de eficiencia por sector.
    Detecta sectores ineficientes con consumo desproporcionado.
    """
    # 1. Obtener campus
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")

    # 2. Obtener infraestructura (sectores)
    infra_result = await db.execute(
        select(Infrastructure).where(Infrastructure.campus_id == campus_id)
    )
    infrastructure = infra_result.scalars().all()

    # 3. Preparar datos de sectores para análisis
    sectors_data = []
    for unit in infrastructure:
        sectors_data.append({
            "name": unit.name,
            "type": unit.unit_type or "general",
            "area_sqm": unit.area_sqm or 100,
            "consumption_kwh": unit.avg_daily_consumption or random.uniform(20, 150)
        })

    # Si no hay infraestructura, generar datos demo
    if not sectors_data:
        sectors_data = [
            {"name": "Edificio Central", "type": "oficinas", "area_sqm": 2500, "consumption_kwh": 180},
            {"name": "Cafetería Principal", "type": "comedores", "area_sqm": 800, "consumption_kwh": 95},
            {"name": "Laboratorio Química", "type": "laboratorios", "area_sqm": 600, "consumption_kwh": 220},
            {"name": "Aula Magna", "type": "auditorios", "area_sqm": 1200, "consumption_kwh": 85},
            {"name": "Bloque A - Clases", "type": "salones", "area_sqm": 3000, "consumption_kwh": 140},
        ]

    # 4. Ejecutar análisis
    analysis = anomaly_service.analyze_sector_efficiency(sectors_data)

    return {
        "campus_id": campus_id,
        "campus_name": campus.name,
        "analysis": analysis,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/campuses/{campus_id}/anomalies")
async def detect_campus_anomalies(
    campus_id: int,
    days: int = Query(default=30, ge=7, le=90),
    sector: str = Query(default="total"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Detecta anomalías en el consumo histórico de un campus.
    Identifica picos y caídas anormales.
    """
    # Verificar campus
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")

    # Generar/obtener datos de consumo
    consumption_data = generate_simulated_consumption_data(campus_id, days, sector)

    # Detectar anomalías
    anomaly_result = anomaly_service.detect_consumption_anomalies(consumption_data, sector)

    # Detectar consumo fuera de horario
    off_hours_result = anomaly_service.detect_off_hours_usage(consumption_data, sector)

    return {
        "campus_id": campus_id,
        "campus_name": campus.name,
        "sector": sector,
        "period_days": days,
        "anomalies": anomaly_result,
        "off_hours_usage": off_hours_result,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/campuses/{campus_id}/peak-hours")
async def get_peak_hours(
    campus_id: int,
    days: int = Query(default=7, ge=1, le=30),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Identifica las horas pico de consumo energético.
    Útil para planificación de deslastre de carga.
    """
    # Verificar campus
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")

    # Generar datos horarios
    hourly_data = generate_simulated_consumption_data(campus_id, days, "total")

    # Analizar horas pico
    peak_analysis = anomaly_service.identify_peak_hours(hourly_data)

    return {
        "campus_id": campus_id,
        "campus_name": campus.name,
        "period_days": days,
        "peak_hours": peak_analysis,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/campuses/{campus_id}/full-analysis")
async def get_full_campus_analysis(
    campus_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Genera un análisis integral del campus.
    Combina: eficiencia por sector + anomalías + horas pico + recomendaciones.
    """
    # Verificar campus
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")

    # Obtener infraestructura
    infra_result = await db.execute(
        select(Infrastructure).where(Infrastructure.campus_id == campus_id)
    )
    infrastructure = infra_result.scalars().all()

    sectors_data = [
        {
            "name": unit.name,
            "type": unit.unit_type or "general",
            "area_sqm": unit.area_sqm or 100,
            "consumption_kwh": unit.avg_daily_consumption or random.uniform(20, 150)
        }
        for unit in infrastructure
    ] or [
        {"name": "Edificio Central", "type": "oficinas", "area_sqm": 2500, "consumption_kwh": 180},
        {"name": "Cafetería", "type": "comedores", "area_sqm": 800, "consumption_kwh": 95},
        {"name": "Lab Química", "type": "laboratorios", "area_sqm": 600, "consumption_kwh": 220},
    ]

    consumption_history = generate_simulated_consumption_data(campus_id, 30, "total")
    hourly_data = generate_simulated_consumption_data(campus_id, 7, "total")

    # Análisis completo
    full_analysis = anomaly_service.generate_full_analysis(
        campus_name=campus.name,
        sectors_data=sectors_data,
        consumption_history=consumption_history,
        hourly_data=hourly_data
    )

    return full_analysis


@router.get("/campuses/{campus_id}/predictions/explain")
async def explain_prediction(
    campus_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Genera explicación XAI de la predicción de consumo.
    Objetivo 4: Transparencia del modelo.
    """
    # Verificar campus
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")

    # Mapear a código de sede
    name_map = {"tunja": "tun", "duitama": "dui", "sogamoso": "sog", "chiquinquira": "chi"}
    campus_code = "tun"
    search_text = (campus.name + " " + (campus.location_city or "")).lower()
    for name, code in name_map.items():
        if name in search_text:
            campus_code = code
            break

    # Construir features
    features_df = prediction_service.build_xgb_features(
        campus_code=campus_code,
        hora=datetime.now().hour,
        num_estudiantes=campus.population_students or 5000,
        num_edificios=10,
        area_m2=campus.total_area_sqm or 15000,
        temp_promedio_c=18.0,
        energia_lag_1h=100.0,
        energia_lag_24h=2400.0
    )

    # Obtener predicción XGBoost
    xgb_model = prediction_service.models.get("xgb_energia")
    if not xgb_model:
        raise HTTPException(status_code=503, detail="Modelo XGBoost no disponible")

    prediction = float(xgb_model.predict(features_df)[0])

    # Generar explicación
    explanation = xai_service.explain_prediction_shap(
        model=xgb_model,
        features_df=features_df,
        prediction_value=prediction
    )

    return {
        "campus_id": campus_id,
        "campus_name": campus.name,
        "prediction_kwh": round(prediction, 2),
        "explanation": explanation,
        "timestamp": datetime.now().isoformat()
    }


@router.post("/campuses/{campus_id}/recommendations")
async def generate_contextual_recommendations(
    campus_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Genera recomendaciones personalizadas por sector usando IA.
    Objetivo 3: Acciones concretas y contextualizadas.
    """
    # Verificar campus
    result = await db.execute(select(Campus).where(Campus.id == campus_id))
    campus = result.scalar_one_or_none()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")

    # Obtener análisis previo
    infra_result = await db.execute(
        select(Infrastructure).where(Infrastructure.campus_id == campus_id)
    )
    infrastructure = infra_result.scalars().all()

    sectors_data = [
        {
            "name": unit.name,
            "type": unit.unit_type or "general",
            "area_sqm": unit.area_sqm or 100,
            "consumption_kwh": unit.avg_daily_consumption or random.uniform(20, 150)
        }
        for unit in infrastructure
    ]

    # Análisis de eficiencia
    efficiency_analysis = anomaly_service.analyze_sector_efficiency(sectors_data) if sectors_data else {}

    # Generar datos de consumo para anomalías
    consumption_history = generate_simulated_consumption_data(campus_id, 30, "total")
    anomalies = anomaly_service.detect_consumption_anomalies(consumption_history, "total")

    # Contexto para Gemini
    context = {
        "campus_name": campus.name,
        "city": campus.location_city,
        "students": campus.population_students,
        "inefficient_sectors": efficiency_analysis.get("inefficient_sectors", []),
        "anomaly_count": anomalies.get("stats", {}).get("anomaly_count", 0),
        "consumption_stats": anomalies.get("stats", {}),
        "sectors": sectors_data
    }

    # Prompt especializado para recomendaciones por sector
    prompt_context = {
        **context,
        "request": "Genera recomendaciones ESPECÍFICAS y ACCIONABLES para cada sector ineficiente. Incluye: acción concreta, responsable sugerido, y ahorro estimado."
    }

    # Llamar a Gemini para recomendaciones contextualizadas
    ai_recommendations = await gemini_service.get_campus_insights(prompt_context)

    # Combinar con recomendaciones algorítmicas
    algorithmic_recommendations = []
    for sector in efficiency_analysis.get("inefficient_sectors", []):
        rec = {
            "sector": sector["name"],
            "sector_type": sector["type"],
            "issue": f"Consumo {sector['deviation_percent']:.0f}% sobre lo esperado",
            "action": f"Auditar equipos en {sector['name']}",
            "priority": "alta" if sector["deviation_percent"] > 50 else "media",
            "estimated_savings": f"{sector['deviation_percent'] * 0.5:.0f}% reducción potencial"
        }
        
        # Agregar explicación XAI
        rec["explanation"] = xai_service.explain_recommendation(
            rec["action"],
            {"type": "efficiency", "sector": sector["name"]}
        )
        
        algorithmic_recommendations.append(rec)

    return {
        "campus_id": campus_id,
        "campus_name": campus.name,
        "ai_insights": ai_recommendations,
        "sector_recommendations": algorithmic_recommendations,
        "analysis_context": {
            "total_sectors_analyzed": efficiency_analysis.get("total_analyzed", 0),
            "inefficient_count": efficiency_analysis.get("inefficiency_count", 0),
            "anomalies_detected": anomalies.get("stats", {}).get("anomaly_count", 0)
        },
        "timestamp": datetime.now().isoformat()
    }
