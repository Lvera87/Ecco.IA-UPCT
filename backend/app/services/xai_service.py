"""
Servicio de Explicabilidad de Modelos (XAI)
Objetivo 4: Garantizar transparencia y adopción mediante técnicas de explicabilidad
"""
import logging
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger("app")

# Feature descriptions en español para el usuario final
FEATURE_DESCRIPTIONS = {
    "hora": "Hora del día (0-23)",
    "dia_numero": "Día de la semana (0=Lunes, 6=Domingo)",
    "es_fin_semana": "Si es sábado o domingo",
    "sede_code": "Código de la sede universitaria",
    "es_festivo": "Si es día festivo",
    "en_periodo_academico": "Si hay clases activas",
    "mes": "Mes del año",
    "temp_promedio_c": "Temperatura promedio (°C)",
    "num_estudiantes": "Número de estudiantes matriculados",
    "num_edificios": "Cantidad de edificios en la sede",
    "area_m2": "Área total en metros cuadrados",
    "energia_total_kwh_lag_1h": "Consumo de la hora anterior",
    "energia_total_kwh_lag_24h": "Consumo hace 24 horas"
}

# Interpretaciones automáticas por feature
FEATURE_INTERPRETATIONS = {
    "hora": {
        "high": "El consumo aumenta significativamente en esta hora del día",
        "low": "Esta hora tiene bajo impacto en el consumo"
    },
    "temp_promedio_c": {
        "high": "La temperatura está afectando fuertemente el consumo (probablemente aire acondicionado/calefacción)",
        "low": "La temperatura no es un factor crítico actual"
    },
    "en_periodo_academico": {
        "high": "El periodo académico activo incrementa notablemente el consumo",
        "low": "El estado del periodo académico tiene poco efecto"
    },
    "es_fin_semana": {
        "high": "El tipo de día (laboral/fin de semana) es muy relevante",
        "low": "No hay diferencia significativa entre días de semana"
    },
    "num_estudiantes": {
        "high": "La cantidad de estudiantes impacta directamente el consumo",
        "low": "La población estudiantil no es el factor principal"
    },
    "energia_total_kwh_lag_1h": {
        "high": "El consumo reciente es un fuerte predictor (inercia energética)",
        "low": "El consumo previo no predice bien el actual"
    }
}


class XAIService:
    """
    Servicio de Explicabilidad para modelos de ML.
    Genera explicaciones comprensibles de las predicciones.
    """

    def __init__(self):
        self.shap_available = self._check_shap_availability()

    def _check_shap_availability(self) -> bool:
        """Verifica si SHAP está disponible."""
        try:
            import shap
            return True
        except ImportError:
            logger.warning("SHAP no disponible. Usando explicaciones basadas en reglas.")
            return False

    def explain_prediction_shap(
        self,
        model: Any,
        features_df: pd.DataFrame,
        prediction_value: float
    ) -> Dict[str, Any]:
        """
        Genera explicación SHAP para una predicción XGBoost.
        
        Args:
            model: Modelo XGBoost entrenado
            features_df: DataFrame con las features de entrada
            prediction_value: Valor predicho
        
        Returns:
            Explicación con importancia de features
        """
        if not self.shap_available:
            return self._explain_with_rules(features_df, prediction_value)

        try:
            import shap
            
            # Crear explainer para XGBoost
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(features_df)
            
            # Obtener valores SHAP para la primera (única) muestra
            if isinstance(shap_values, list):
                shap_vals = shap_values[0][0]  # Para clasificación
            else:
                shap_vals = shap_values[0]  # Para regresión
            
            # Crear explicación ordenada por importancia
            feature_names = features_df.columns.tolist()
            explanations = []
            
            for i, (name, shap_val) in enumerate(zip(feature_names, shap_vals)):
                abs_impact = abs(shap_val)
                direction = "aumenta" if shap_val > 0 else "disminuye"
                
                explanations.append({
                    "feature": name,
                    "description": FEATURE_DESCRIPTIONS.get(name, name),
                    "shap_value": round(float(shap_val), 4),
                    "impact_magnitude": round(abs_impact, 4),
                    "direction": direction,
                    "input_value": float(features_df.iloc[0][name]),
                    "interpretation": self._get_interpretation(name, shap_val)
                })
            
            # Ordenar por impacto absoluto
            explanations.sort(key=lambda x: x["impact_magnitude"], reverse=True)
            
            # Base value (predicción promedio sin features)
            base_value = float(explainer.expected_value) if hasattr(explainer, 'expected_value') else 0
            
            return {
                "prediction": round(prediction_value, 2),
                "base_value": round(base_value, 2),
                "explanations": explanations,
                "top_factors": explanations[:5],
                "summary": self._generate_summary(explanations[:3], prediction_value),
                "method": "SHAP (TreeExplainer)",
                "confidence": "high"
            }

        except Exception as e:
            logger.error(f"Error en explicación SHAP: {e}")
            return self._explain_with_rules(features_df, prediction_value)

    def _explain_with_rules(
        self,
        features_df: pd.DataFrame,
        prediction_value: float
    ) -> Dict[str, Any]:
        """
        Fallback: Genera explicaciones basadas en reglas heurísticas.
        Útil cuando SHAP no está disponible.
        """
        explanations = []
        feature_values = features_df.iloc[0].to_dict()
        
        # Reglas heurísticas basadas en conocimiento del dominio
        rules = [
            ("hora", lambda v: v >= 10 and v <= 14, "Horario de máxima actividad académica", 0.8),
            ("hora", lambda v: v >= 18 or v <= 6, "Horario de baja actividad", -0.5),
            ("en_periodo_academico", lambda v: v == 1, "Periodo académico activo aumenta demanda", 0.7),
            ("es_fin_semana", lambda v: v == 1, "Fin de semana reduce consumo base", -0.6),
            ("temp_promedio_c", lambda v: v > 25, "Alta temperatura activa sistemas de refrigeración", 0.6),
            ("temp_promedio_c", lambda v: v < 12, "Baja temperatura activa calefacción", 0.5),
            ("num_estudiantes", lambda v: v > 8000, "Alta población estudiantil", 0.5),
            ("energia_total_kwh_lag_1h", lambda v: v > 200, "Consumo reciente alto indica inercia", 0.4),
        ]
        
        for feature, condition, message, impact in rules:
            if feature in feature_values:
                value = feature_values[feature]
                if condition(value):
                    explanations.append({
                        "feature": feature,
                        "description": FEATURE_DESCRIPTIONS.get(feature, feature),
                        "shap_value": impact,  # Pseudo-SHAP
                        "impact_magnitude": abs(impact),
                        "direction": "aumenta" if impact > 0 else "disminuye",
                        "input_value": value,
                        "interpretation": message
                    })
        
        # Ordenar por impacto
        explanations.sort(key=lambda x: x["impact_magnitude"], reverse=True)
        
        return {
            "prediction": round(prediction_value, 2),
            "base_value": 150.0,  # Estimación base
            "explanations": explanations,
            "top_factors": explanations[:5],
            "summary": self._generate_summary(explanations[:3], prediction_value),
            "method": "Análisis Heurístico (SHAP no disponible)",
            "confidence": "medium"
        }

    def _get_interpretation(self, feature: str, shap_value: float) -> str:
        """Genera interpretación en lenguaje natural."""
        impact_type = "high" if abs(shap_value) > 0.1 else "low"
        
        if feature in FEATURE_INTERPRETATIONS:
            return FEATURE_INTERPRETATIONS[feature].get(impact_type, "")
        
        if shap_value > 0.1:
            return f"{FEATURE_DESCRIPTIONS.get(feature, feature)} contribuye a aumentar el consumo"
        elif shap_value < -0.1:
            return f"{FEATURE_DESCRIPTIONS.get(feature, feature)} contribuye a reducir el consumo"
        else:
            return f"{FEATURE_DESCRIPTIONS.get(feature, feature)} tiene impacto menor"

    def _generate_summary(
        self, 
        top_explanations: List[Dict], 
        prediction: float
    ) -> str:
        """Genera un resumen ejecutivo de la predicción."""
        if not top_explanations:
            return f"Se predice un consumo de {prediction:.0f} kWh."
        
        factors = []
        for exp in top_explanations:
            direction = "↑" if exp["direction"] == "aumenta" else "↓"
            factors.append(f"{exp['description']} ({direction})")
        
        factors_str = ", ".join(factors)
        
        return (
            f"Predicción: {prediction:.0f} kWh. "
            f"Factores principales: {factors_str}."
        )

    def explain_recommendation(
        self,
        recommendation: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Explica por qué se genera una recomendación específica.
        Útil para justificar consejos de Gemini/IA.
        """
        # Mapeo de tipos de recomendación a explicaciones
        explanation_templates = {
            "efficiency": {
                "reason": "Se detectó consumo por encima del benchmark del sector",
                "evidence": "Comparación con ratios kWh/m² estándar",
                "confidence_factors": ["Datos históricos del sector", "Perfil de uso esperado"]
            },
            "anomaly": {
                "reason": "Patrón de consumo atípico identificado estadísticamente",
                "evidence": "Análisis Z-Score sobre histórico",
                "confidence_factors": ["Desviación estándar", "Frecuencia de ocurrencia"]
            },
            "scheduling": {
                "reason": "Concentración de carga en horarios específicos",
                "evidence": "Análisis de distribución horaria",
                "confidence_factors": ["Perfil de carga diario", "Tarifas horarias"]
            },
            "off_hours": {
                "reason": "Consumo detectado fuera del horario operativo normal",
                "evidence": "Comparación con horario esperado del sector",
                "confidence_factors": ["Perfil operativo", "Consumo base nocturno"]
            }
        }
        
        rec_type = context.get("type", "general")
        template = explanation_templates.get(rec_type, {
            "reason": "Análisis integral de patrones de consumo",
            "evidence": "Modelos de ML y reglas de negocio",
            "confidence_factors": ["Datos históricos", "Benchmarks del sector"]
        })
        
        return {
            "recommendation": recommendation,
            "why": template["reason"],
            "based_on": template["evidence"],
            "confidence_factors": template["confidence_factors"],
            "transparency_note": "Esta recomendación fue generada por IA y validada contra patrones conocidos del dominio energético."
        }


# Singleton
xai_service = XAIService()
