"""
Generador de Datos Históricos Simulados (2018-2025)
Objetivo 1: Proveer datos para entrenar/demostrar modelos de predicción
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

# Constantes de simulación basadas en datos reales de universidades colombianas
CAMPUS_PROFILES = {
    "tunja": {
        "base_consumption_kwh": 850,  # kWh/día base
        "population": 12000,
        "area_m2": 45000,
        "temp_avg": 13,  # Temperatura promedio anual °C
        "temp_variation": 4,
        "academic_boost": 1.35,  # Factor cuando hay clases
    },
    "duitama": {
        "base_consumption_kwh": 420,
        "population": 4500,
        "area_m2": 18000,
        "temp_avg": 16,
        "temp_variation": 3,
        "academic_boost": 1.30,
    },
    "sogamoso": {
        "base_consumption_kwh": 380,
        "population": 3800,
        "area_m2": 15000,
        "temp_avg": 17,
        "temp_variation": 3,
        "academic_boost": 1.28,
    },
    "chiquinquira": {
        "base_consumption_kwh": 180,
        "population": 1200,
        "area_m2": 6000,
        "temp_avg": 15,
        "temp_variation": 3,
        "academic_boost": 1.25,
    }
}

# Periodos académicos típicos Colombia
ACADEMIC_PERIODS = [
    # Semestre 1: Feb-Jun
    {"start_month": 2, "start_day": 1, "end_month": 6, "end_day": 15},
    # Semestre 2: Ago-Dic
    {"start_month": 8, "start_day": 1, "end_month": 12, "end_day": 10},
]

# Festivos Colombia (aproximados, varían por año)
HOLIDAYS_FIXED = [
    (1, 1),   # Año nuevo
    (5, 1),   # Día del trabajo
    (7, 20),  # Independencia
    (8, 7),   # Batalla Boyacá
    (12, 25), # Navidad
]

# Perfiles horarios por sector (factor multiplicador por hora)
HOURLY_PROFILES = {
    "general": [0.15, 0.12, 0.10, 0.10, 0.12, 0.20, 0.45, 0.75, 0.95, 1.00, 1.00, 0.95, 0.85, 0.90, 0.95, 0.90, 0.80, 0.65, 0.50, 0.40, 0.35, 0.30, 0.25, 0.18],
    "comedores": [0.05, 0.05, 0.05, 0.05, 0.10, 0.25, 0.70, 0.85, 0.50, 0.30, 0.40, 1.00, 1.20, 0.90, 0.40, 0.30, 0.45, 0.85, 1.00, 0.60, 0.25, 0.15, 0.08, 0.05],
    "laboratorios": [0.08, 0.08, 0.08, 0.08, 0.08, 0.10, 0.30, 0.70, 0.95, 1.00, 1.00, 0.80, 0.70, 0.90, 1.00, 1.00, 0.90, 0.70, 0.50, 0.35, 0.25, 0.15, 0.10, 0.08],
    "oficinas": [0.10, 0.10, 0.10, 0.10, 0.10, 0.12, 0.25, 0.85, 1.00, 1.00, 1.00, 0.95, 0.85, 0.95, 1.00, 1.00, 0.90, 0.50, 0.20, 0.12, 0.10, 0.10, 0.10, 0.10],
    "salones": [0.05, 0.05, 0.05, 0.05, 0.08, 0.15, 0.60, 0.90, 1.00, 1.00, 1.00, 0.85, 0.75, 0.90, 1.00, 0.95, 0.85, 0.70, 0.45, 0.30, 0.20, 0.12, 0.08, 0.05],
}


class HistoricalDataGenerator:
    """Genera datos históricos simulados realistas para el período 2018-2025."""

    def __init__(self, campus_code: str = "tunja"):
        self.campus_code = campus_code.lower()
        self.profile = CAMPUS_PROFILES.get(self.campus_code, CAMPUS_PROFILES["tunja"])
        
        # Tendencias a largo plazo (eficiencia mejorando con el tiempo)
        self.yearly_efficiency_improvement = 0.02  # 2% mejora anual
        
        # Factor COVID (reducción drástica en 2020)
        self.covid_factors = {
            2020: {"factor": 0.35, "months": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]},
            2021: {"factor": 0.55, "months": [1, 2, 3, 4, 5, 6]},
        }

    def is_holiday(self, date: datetime) -> bool:
        """Verifica si es festivo."""
        return (date.month, date.day) in HOLIDAYS_FIXED

    def is_academic_period(self, date: datetime) -> bool:
        """Verifica si está en periodo académico."""
        for period in ACADEMIC_PERIODS:
            start = datetime(date.year, period["start_month"], period["start_day"])
            end = datetime(date.year, period["end_month"], period["end_day"])
            if start <= date <= end:
                return True
        return False

    def get_temperature(self, date: datetime) -> float:
        """Simula temperatura para la fecha."""
        # Variación estacional suave (Colombia tiene poca variación)
        seasonal = math.sin((date.month - 1) / 12 * 2 * math.pi) * self.profile["temp_variation"]
        daily_noise = random.gauss(0, 1.5)
        return self.profile["temp_avg"] + seasonal + daily_noise

    def get_covid_factor(self, date: datetime) -> float:
        """Factor de reducción por COVID."""
        year = date.year
        if year in self.covid_factors:
            covid_data = self.covid_factors[year]
            if date.month in covid_data["months"]:
                return covid_data["factor"]
        return 1.0

    def get_efficiency_factor(self, year: int) -> float:
        """Factor de mejora de eficiencia por año (base 2018)."""
        years_since_base = year - 2018
        return 1.0 - (years_since_base * self.yearly_efficiency_improvement)

    def generate_daily_consumption(
        self,
        date: datetime,
        sector: str = "general"
    ) -> Dict[str, Any]:
        """Genera consumo diario para una fecha específica."""
        
        # Factores base
        base = self.profile["base_consumption_kwh"]
        
        # Factor día de semana
        weekday_factor = 1.0 if date.weekday() < 5 else 0.35
        
        # Factor académico
        academic_factor = self.profile["academic_boost"] if self.is_academic_period(date) else 0.65
        
        # Factor festivo
        holiday_factor = 0.25 if self.is_holiday(date) else 1.0
        
        # Factor COVID
        covid_factor = self.get_covid_factor(date)
        
        # Factor eficiencia anual
        efficiency_factor = self.get_efficiency_factor(date.year)
        
        # Temperatura
        temp = self.get_temperature(date)
        temp_factor = 1.0 + (abs(temp - 18) * 0.015)  # Consumo extra si muy frío o muy caliente
        
        # Ruido aleatorio
        noise = random.gauss(1.0, 0.08)
        
        # Consumo total del día
        total = (
            base
            * weekday_factor
            * academic_factor
            * holiday_factor
            * covid_factor
            * efficiency_factor
            * temp_factor
            * noise
        )
        
        # Agregar anomalías ocasionales (1% de probabilidad)
        anomaly = None
        if random.random() < 0.01:
            anomaly_type = random.choice(["spike", "drop"])
            if anomaly_type == "spike":
                total *= random.uniform(1.5, 2.5)
                anomaly = "spike"
            else:
                total *= random.uniform(0.3, 0.5)
                anomaly = "drop"
        
        return {
            "date": date.strftime("%Y-%m-%d"),
            "campus": self.campus_code,
            "consumption_kwh": round(total, 2),
            "temperature_c": round(temp, 1),
            "is_weekend": date.weekday() >= 5,
            "is_holiday": self.is_holiday(date),
            "is_academic": self.is_academic_period(date),
            "anomaly": anomaly,
            "factors": {
                "weekday": round(weekday_factor, 2),
                "academic": round(academic_factor, 2),
                "covid": round(covid_factor, 2),
                "efficiency": round(efficiency_factor, 2)
            }
        }

    def generate_hourly_consumption(
        self,
        date: datetime,
        sector: str = "general"
    ) -> List[Dict[str, Any]]:
        """Genera consumo horario para un día completo."""
        daily = self.generate_daily_consumption(date, sector)
        total_daily = daily["consumption_kwh"]
        
        profile = HOURLY_PROFILES.get(sector, HOURLY_PROFILES["general"])
        profile_sum = sum(profile)
        
        hourly_data = []
        for hour in range(24):
            hour_factor = profile[hour] / profile_sum * 24
            hour_consumption = total_daily / 24 * hour_factor * random.gauss(1.0, 0.05)
            
            hourly_data.append({
                "timestamp": date.replace(hour=hour).isoformat(),
                "hour": hour,
                "consumption_kwh": round(hour_consumption, 2),
                "campus": self.campus_code,
                "sector": sector
            })
        
        return hourly_data

    def generate_historical_range(
        self,
        start_year: int = 2018,
        end_year: int = 2025,
        daily: bool = True
    ) -> List[Dict[str, Any]]:
        """Genera datos históricos para un rango de años."""
        data = []
        current = datetime(start_year, 1, 1)
        end = datetime(end_year, 12, 31)
        
        while current <= end:
            if daily:
                data.append(self.generate_daily_consumption(current))
            else:
                data.extend(self.generate_hourly_consumption(current))
            current += timedelta(days=1)
        
        return data

    def generate_sector_breakdown(
        self,
        date: datetime
    ) -> Dict[str, Any]:
        """Genera desglose de consumo por sector para un día."""
        daily_total = self.generate_daily_consumption(date)["consumption_kwh"]
        
        # Distribución típica por sector
        sector_distribution = {
            "salones": 0.30,
            "laboratorios": 0.25,
            "oficinas": 0.18,
            "comedores": 0.12,
            "bibliotecas": 0.08,
            "deportivo": 0.04,
            "otros": 0.03
        }
        
        sectors = {}
        for sector, ratio in sector_distribution.items():
            noise = random.gauss(1.0, 0.1)
            sectors[sector] = round(daily_total * ratio * noise, 2)
        
        return {
            "date": date.strftime("%Y-%m-%d"),
            "campus": self.campus_code,
            "total_kwh": round(daily_total, 2),
            "by_sector": sectors
        }


def generate_demo_dataset(
    campus: str = "tunja",
    days: int = 30
) -> Dict[str, Any]:
    """Genera un dataset de demostración para el frontend."""
    generator = HistoricalDataGenerator(campus)
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    daily_data = []
    current = start_date
    while current <= end_date:
        daily_data.append(generator.generate_daily_consumption(current))
        current += timedelta(days=1)
    
    # Estadísticas
    values = [d["consumption_kwh"] for d in daily_data]
    
    return {
        "campus": campus,
        "period": f"{start_date.strftime('%Y-%m-%d')} a {end_date.strftime('%Y-%m-%d')}",
        "data": daily_data,
        "stats": {
            "total_kwh": round(sum(values), 2),
            "avg_daily_kwh": round(sum(values) / len(values), 2),
            "max_kwh": round(max(values), 2),
            "min_kwh": round(min(values), 2),
            "anomaly_count": sum(1 for d in daily_data if d["anomaly"] is not None)
        }
    }


# Singleton para reutilización
historical_generator = HistoricalDataGenerator()
