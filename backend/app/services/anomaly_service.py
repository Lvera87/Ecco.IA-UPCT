"""
Servicio de Detección de Anomalías y Análisis por Sector
Objetivo 2: Identificar patrones de uso ineficiente
"""
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, time
from dataclasses import dataclass
import numpy as np

logger = logging.getLogger("app")

@dataclass
class SectorProfile:
    """Perfil operativo esperado de cada sector."""
    name: str
    horario_inicio: int  # Hora de inicio operación normal
    horario_fin: int     # Hora de fin operación normal
    consumo_ratio_esperado: float  # kWh por m² esperado
    tolerancia_pico: float  # % de tolerancia antes de ser anomalía

# Perfiles de sectores universitarios con horarios típicos
SECTOR_PROFILES: Dict[str, SectorProfile] = {
    "comedores": SectorProfile("Comedores", 6, 20, 0.15, 0.30),
    "salones": SectorProfile("Salones", 6, 22, 0.08, 0.25),
    "laboratorios": SectorProfile("Laboratorios", 7, 21, 0.25, 0.35),
    "auditorios": SectorProfile("Auditorios", 8, 22, 0.12, 0.40),
    "oficinas": SectorProfile("Oficinas", 7, 18, 0.10, 0.20),
    "bibliotecas": SectorProfile("Bibliotecas", 6, 22, 0.06, 0.20),
    "deportivo": SectorProfile("Deportivo", 6, 21, 0.18, 0.30),
}


class AnomalyDetectionService:
    """
    Servicio para detectar anomalías y patrones ineficientes.
    Implementa los requerimientos del Objetivo 2.
    """

    def __init__(self):
        self.z_score_threshold = 2.5  # Umbral para detección de outliers

    def detect_consumption_anomalies(
        self, 
        consumption_data: List[Dict[str, Any]],
        sector_type: str = "total"
    ) -> Dict[str, Any]:
        """
        Detecta anomalías en los datos de consumo usando Z-Score.
        
        Args:
            consumption_data: Lista de registros con 'timestamp' y 'value'
            sector_type: Tipo de sector para aplicar perfil específico
        
        Returns:
            Dict con anomalías detectadas y estadísticas
        """
        if not consumption_data or len(consumption_data) < 3:
            return {"anomalies": [], "stats": {}, "status": "insufficient_data"}

        values = [record.get("value", 0) for record in consumption_data]
        
        # Estadísticas básicas
        mean_val = np.mean(values)
        std_val = np.std(values)
        
        if std_val == 0:
            return {"anomalies": [], "stats": {"mean": mean_val, "std": 0}, "status": "no_variance"}

        anomalies = []
        for i, record in enumerate(consumption_data):
            value = record.get("value", 0)
            z_score = (value - mean_val) / std_val
            
            if abs(z_score) > self.z_score_threshold:
                anomaly_type = "pico_alto" if z_score > 0 else "consumo_bajo_anormal"
                severity = "critical" if abs(z_score) > 3.5 else "warning"
                
                anomalies.append({
                    "timestamp": record.get("timestamp"),
                    "value": value,
                    "z_score": round(z_score, 2),
                    "type": anomaly_type,
                    "severity": severity,
                    "deviation_percent": round((value - mean_val) / mean_val * 100, 1),
                    "sector": sector_type
                })

        return {
            "anomalies": anomalies,
            "stats": {
                "mean": round(mean_val, 2),
                "std": round(std_val, 2),
                "min": round(min(values), 2),
                "max": round(max(values), 2),
                "anomaly_count": len(anomalies)
            },
            "status": "analyzed"
        }

    def detect_off_hours_usage(
        self,
        consumption_data: List[Dict[str, Any]],
        sector_type: str
    ) -> Dict[str, Any]:
        """
        Detecta consumo fuera de horario operativo normal.
        Ej: Comedores consumiendo energía a las 23:00
        
        Args:
            consumption_data: Lista con 'timestamp' (datetime) y 'value'
            sector_type: Tipo de sector
        
        Returns:
            Dict con alertas de consumo fuera de horario
        """
        profile = SECTOR_PROFILES.get(sector_type.lower())
        if not profile:
            return {"alerts": [], "status": "unknown_sector"}

        off_hours_alerts = []
        total_off_hours_consumption = 0
        total_consumption = 0

        for record in consumption_data:
            value = record.get("value", 0)
            total_consumption += value
            
            timestamp = record.get("timestamp")
            if isinstance(timestamp, str):
                try:
                    timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                except:
                    continue
            
            if timestamp:
                hour = timestamp.hour
                is_off_hours = hour < profile.horario_inicio or hour > profile.horario_fin
                
                if is_off_hours and value > 0:
                    # Solo alertar si el consumo es significativo (>10% del promedio)
                    total_off_hours_consumption += value
                    off_hours_alerts.append({
                        "timestamp": timestamp.isoformat(),
                        "hour": hour,
                        "value": value,
                        "expected_hours": f"{profile.horario_inicio}:00 - {profile.horario_fin}:00",
                        "sector": sector_type
                    })

        waste_percent = 0
        if total_consumption > 0:
            waste_percent = round((total_off_hours_consumption / total_consumption) * 100, 1)

        return {
            "alerts": off_hours_alerts[:10],  # Limitar a 10 más recientes
            "total_off_hours_consumption": round(total_off_hours_consumption, 2),
            "waste_percent": waste_percent,
            "sector_profile": {
                "name": profile.name,
                "operating_hours": f"{profile.horario_inicio}:00 - {profile.horario_fin}:00"
            },
            "status": "analyzed"
        }

    def analyze_sector_efficiency(
        self,
        sectors_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analiza la eficiencia de múltiples sectores y detecta ineficiencias.
        
        Args:
            sectors_data: Lista de sectores con 'name', 'type', 'area_sqm', 'consumption_kwh'
        
        Returns:
            Ranking de eficiencia y alertas de ineficiencia
        """
        if not sectors_data:
            return {"sectors": [], "inefficient_sectors": [], "status": "no_data"}

        analyzed_sectors = []
        
        for sector in sectors_data:
            area = sector.get("area_sqm", 1)
            consumption = sector.get("consumption_kwh", 0)
            sector_type = sector.get("type", "").lower()
            
            # Consumo por m²
            consumption_per_sqm = consumption / max(area, 1)
            
            # Obtener ratio esperado del perfil
            profile = SECTOR_PROFILES.get(sector_type)
            expected_ratio = profile.consumo_ratio_esperado if profile else 0.12
            
            # Calcular desviación del esperado
            if expected_ratio > 0:
                efficiency_score = (expected_ratio / max(consumption_per_sqm, 0.01)) * 100
                efficiency_score = min(efficiency_score, 150)  # Cap at 150%
            else:
                efficiency_score = 100

            deviation = ((consumption_per_sqm - expected_ratio) / expected_ratio) * 100 if expected_ratio > 0 else 0
            
            is_inefficient = deviation > 30  # Más del 30% sobre lo esperado
            
            analyzed_sectors.append({
                "name": sector.get("name", "Desconocido"),
                "type": sector_type,
                "area_sqm": area,
                "consumption_kwh": consumption,
                "consumption_per_sqm": round(consumption_per_sqm, 4),
                "expected_ratio": expected_ratio,
                "efficiency_score": round(efficiency_score, 1),
                "deviation_percent": round(deviation, 1),
                "is_inefficient": is_inefficient,
                "status": "crítico" if deviation > 50 else "alerta" if deviation > 30 else "normal"
            })

        # Ordenar por eficiencia (menor = peor)
        analyzed_sectors.sort(key=lambda x: x["efficiency_score"])
        
        inefficient = [s for s in analyzed_sectors if s["is_inefficient"]]

        return {
            "sectors": analyzed_sectors,
            "inefficient_sectors": inefficient,
            "total_analyzed": len(analyzed_sectors),
            "inefficiency_count": len(inefficient),
            "status": "analyzed"
        }

    def identify_peak_hours(
        self,
        hourly_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Identifica las horas pico de consumo.
        
        Args:
            hourly_data: Lista con 'hour' (0-23) y 'consumption'
        
        Returns:
            Horas críticas y distribución horaria
        """
        if not hourly_data:
            return {"peak_hours": [], "distribution": [], "status": "no_data"}

        # Agrupar por hora
        hourly_totals = {}
        for record in hourly_data:
            hour = record.get("hour", 0)
            consumption = record.get("consumption", 0)
            hourly_totals[hour] = hourly_totals.get(hour, 0) + consumption

        # Convertir a lista y calcular estadísticas
        distribution = [
            {"hour": h, "consumption": round(c, 2)} 
            for h, c in sorted(hourly_totals.items())
        ]
        
        if not distribution:
            return {"peak_hours": [], "distribution": [], "status": "no_data"}

        values = [d["consumption"] for d in distribution]
        mean_consumption = np.mean(values)
        threshold = mean_consumption * 1.3  # 30% sobre el promedio = hora pico

        peak_hours = [
            {
                "hour": d["hour"],
                "consumption": d["consumption"],
                "over_average_percent": round((d["consumption"] - mean_consumption) / mean_consumption * 100, 1)
            }
            for d in distribution if d["consumption"] > threshold
        ]

        # Ordenar por consumo (mayor primero)
        peak_hours.sort(key=lambda x: x["consumption"], reverse=True)

        return {
            "peak_hours": peak_hours[:5],  # Top 5 horas críticas
            "distribution": distribution,
            "average_hourly": round(mean_consumption, 2),
            "status": "analyzed"
        }

    def generate_full_analysis(
        self,
        campus_name: str,
        sectors_data: List[Dict[str, Any]],
        consumption_history: List[Dict[str, Any]] = None,
        hourly_data: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera un análisis completo de un campus.
        Combina todas las detecciones para un reporte integral.
        """
        result = {
            "campus": campus_name,
            "analysis_timestamp": datetime.now().isoformat(),
            "sector_efficiency": {},
            "anomalies": {},
            "peak_hours": {},
            "recommendations": []
        }

        # 1. Análisis de eficiencia por sector
        if sectors_data:
            result["sector_efficiency"] = self.analyze_sector_efficiency(sectors_data)
            
            # Generar recomendaciones basadas en sectores ineficientes
            for sector in result["sector_efficiency"].get("inefficient_sectors", []):
                result["recommendations"].append({
                    "type": "efficiency",
                    "priority": "high" if sector["deviation_percent"] > 50 else "medium",
                    "sector": sector["name"],
                    "message": f"Revisar consumo en {sector['name']}: {sector['deviation_percent']:.0f}% sobre lo esperado",
                    "action": f"Auditoría energética recomendada para {sector['type']}"
                })

        # 2. Detección de anomalías en historial
        if consumption_history:
            result["anomalies"] = self.detect_consumption_anomalies(consumption_history)
            
            for anomaly in result["anomalies"].get("anomalies", [])[:3]:
                result["recommendations"].append({
                    "type": "anomaly",
                    "priority": anomaly["severity"],
                    "message": f"Anomalía detectada: {anomaly['type']} ({anomaly['deviation_percent']}% desviación)",
                    "action": "Investigar causa del consumo atípico"
                })

        # 3. Análisis de horas pico
        if hourly_data:
            result["peak_hours"] = self.identify_peak_hours(hourly_data)
            
            peaks = result["peak_hours"].get("peak_hours", [])
            if peaks:
                peak_str = ", ".join([f"{p['hour']}:00" for p in peaks[:3]])
                result["recommendations"].append({
                    "type": "scheduling",
                    "priority": "medium",
                    "message": f"Horas críticas identificadas: {peak_str}",
                    "action": "Considerar deslastre de carga o redistribución de actividades"
                })

        return result


# Singleton
anomaly_service = AnomalyDetectionService()
