from typing import Dict, List, Any, Protocol


class AssetLike(Protocol):
    """Contrato mínimo que debe cumplir un activo para el cálculo vampiro."""
    icon: str
    is_high_impact: bool


class EnergyCalculators:
    """
    Núcleo matemático de EccoIA. 
    Aquí reside la 'física' del ahorro sin dependencias de DB o IA.
    """
    
    ESTRATO_TARIFFS = {1: 350.0, 2: 450.0, 3: 680.0, 4: 850.0, 5: 1100.0, 6: 1400.0}
    CO2_FACTOR = 0.164  # kg CO2e / kWh
    TREE_COMPENSATION = 20.0  # kg CO2 / year per tree
    
    @classmethod
    def get_kwh_price(cls, stratum: int) -> float:
        return cls.ESTRATO_TARIFFS.get(stratum, 680.0)

    @staticmethod
    def calculate_monthly_kwh(power_watts: float, daily_hours: float) -> float:
        return (power_watts * daily_hours * 30) / 1000.0

    @classmethod
    def calculate_efficiency_score(cls, total_kwh: float, occupants: int) -> int:
        """
        Calcula el puntaje de eficiencia basado en benchmarking colombiano.
        Meta eficiente: 35 kWh/persona/mes.
        """
        if occupants <= 0: occupants = 1
        kwh_per_person = total_kwh / occupants
        # 100 es perfecto (<= 35kWh), reduce 1.5 puntos por cada kWh excedente
        score = 100 - (max(0, kwh_per_person - 35) * 1.5)
        return int(max(0, min(100, score)))

    @classmethod
    def get_vampire_estimate(cls, assets: List[AssetLike]) -> float:
        """
        Estima el consumo standby (vampiro) basado en el tipo de equipo y su antigüedad.
        """
        vampire_kwh = 0.0
        for a in assets:
            # Lógica refinada: equipos modernos consumen muy poco (~0.7 kWh/mes)
            if a.icon in ["tv", "monitor", "console", "desktop"]:
                vampire_kwh += 2.5 if a.is_high_impact else 0.7
            elif a.icon == "fridge" and a.is_high_impact:
                vampire_kwh += 8.0
            elif a.icon == "ac" and a.is_high_impact:
                vampire_kwh += 1.5
        return vampire_kwh

    @classmethod
    def calculate_environmental_impact(cls, total_kwh: float) -> Dict[str, Any]:
        co2 = total_kwh * cls.CO2_FACTOR
        return {
            "co2_kg": round(co2, 2),
            "trees": int(round(co2 / cls.TREE_COMPENSATION))
        }

energy_calculators = EnergyCalculators()
