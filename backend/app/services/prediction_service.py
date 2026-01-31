import os
import joblib
import pandas as pd
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from app.core.config import get_settings

logger = logging.getLogger("app")

class PredictionService:
    """
    Servicio robusto para cargar y ejecutar inferencias sobre los modelos de ML.
    Incluye: caché de predicciones, validación de features y fallbacks.
    """
    
    # Features requeridas por XGBoost según metadata de Miguel
    REQUIRED_FEATURES: List[str] = [
        'hora', 'dia_numero', 'es_fin_semana', 'sede_code', 'es_festivo',
        'en_periodo_academico', 'mes', 'temp_promedio_c', 'num_estudiantes',
        'num_edificios', 'area_m2', 'energia_total_kwh_lag_1h', 'energia_total_kwh_lag_24h'
    ]
    
    # Mapeo de sedes a códigos numéricos (del metadata)
    SEDE_CODES: Dict[str, int] = {
        'chi': 0, 'dui': 1, 'sog': 2, 'tun': 3
    }
    
    # Ratios de eficiencia por sector (del metadata)
    EFFICIENCY_RATIOS: Dict[str, Dict[str, float]] = {
        'total': {'agua': 0.033195, 'ocupacion': 0.367202},
        'comedores': {'agua': 0.00197, 'ocupacion': 0.022032},
        'salones': {'agua': 0.00564, 'ocupacion': 0.041432},
        'laboratorios': {'agua': 0.016342, 'ocupacion': 0.20066},
        'auditorios': {'agua': 0.000823, 'ocupacion': 0.008085},
        'oficinas': {'agua': 0.007708, 'ocupacion': 0.087341}
    }

    def __init__(self):
        self.models_path = os.path.join(os.getcwd(), "app", "ml_models")
        self.models: Dict[str, Any] = {}
        self.is_loaded = False
        self._prediction_cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl_minutes = 60
        self._load_models()

    def _load_models(self):
        """Carga los modelos en memoria al iniciar."""
        model_files = {
            "prophet_tun": "prophet_uptc_tun.pkl",
            "prophet_dui": "prophet_uptc_dui.pkl",
            "prophet_sog": "prophet_uptc_sog.pkl",
            "prophet_chi": "prophet_uptc_chi.pkl",
            "xgb_agua": "xgb_agua.pkl",
            "xgb_energia": "xgb_energia.pkl",
            "xgb_ocupacion": "xgb_ocupacion.pkl",
            "metadata": "metadata_sistema.pkl"
        }

        try:
            for key, filename in model_files.items():
                full_path = os.path.join(self.models_path, filename)
                if os.path.exists(full_path):
                    self.models[key] = joblib.load(full_path)
                    logger.info(f"Modelo ML cargado: {filename}")
                else:
                    logger.warning(f"No se encontró el modelo: {filename}")
            
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Error cargando modelos de ML: {e}")

    def _get_cache_key(self, campus_code: str, days: int) -> str:
        """Genera clave única para el caché."""
        return f"{campus_code}_{days}_{datetime.now().strftime('%Y%m%d%H')}"

    def _is_cache_valid(self, cache_key: str) -> bool:
        """Verifica si el caché sigue siendo válido."""
        if cache_key not in self._prediction_cache:
            return False
        cached = self._prediction_cache[cache_key]
        if datetime.now() - cached['timestamp'] > timedelta(minutes=self._cache_ttl_minutes):
            del self._prediction_cache[cache_key]
            return False
        return True

    def predict_campus_consumption(self, campus_code: str, days: int = 7) -> Optional[Dict[str, Any]]:
        """
        Predice el consumo para una sede usando Prophet.
        Incluye caché para evitar recálculos innecesarios.
        """
        # 1. Verificar caché
        cache_key = self._get_cache_key(campus_code, days)
        if self._is_cache_valid(cache_key):
            logger.info(f"Usando predicción cacheada para {campus_code}")
            return self._prediction_cache[cache_key]['data']

        # 2. Ejecutar predicción
        model_key = f"prophet_{campus_code}"
        if model_key not in self.models:
            logger.warning(f"Modelo Prophet no encontrado: {model_key}")
            return None

        try:
            model = self.models[model_key]
            future = model.make_future_dataframe(periods=days)
            forecast = model.predict(future)
            recent_forecast = forecast.tail(days)
            
            result = {
                "dates": recent_forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
                "predictions": [round(v, 2) for v in recent_forecast['yhat'].tolist()],
                "lower_bound": [round(v, 2) for v in recent_forecast['yhat_lower'].tolist()],
                "upper_bound": [round(v, 2) for v in recent_forecast['yhat_upper'].tolist()]
            }
            
            # 3. Guardar en caché
            self._prediction_cache[cache_key] = {
                'data': result,
                'timestamp': datetime.now()
            }
            logger.info(f"Predicción Prophet completada y cacheada para {campus_code}")
            return result
            
        except Exception as e:
            logger.error(f"Error en predicción Prophet ({campus_code}): {e}")
            return None

    def build_xgb_features(
        self,
        campus_code: str,
        hora: int = 12,
        num_estudiantes: int = 5000,
        num_edificios: int = 10,
        area_m2: float = 15000.0,
        temp_promedio_c: float = 18.0,
        energia_lag_1h: float = 100.0,
        energia_lag_24h: float = 2400.0,
        es_festivo: bool = False,
        en_periodo_academico: bool = True
    ) -> pd.DataFrame:
        """
        Construye un DataFrame con las 13 features requeridas por XGBoost.
        """
        now = datetime.now()
        
        features = {
            'hora': hora,
            'dia_numero': now.weekday(),
            'es_fin_semana': 1 if now.weekday() >= 5 else 0,
            'sede_code': self.SEDE_CODES.get(campus_code, 3),
            'es_festivo': 1 if es_festivo else 0,
            'en_periodo_academico': 1 if en_periodo_academico else 0,
            'mes': now.month,
            'temp_promedio_c': temp_promedio_c,
            'num_estudiantes': num_estudiantes,
            'num_edificios': num_edificios,
            'area_m2': area_m2,
            'energia_total_kwh_lag_1h': energia_lag_1h,
            'energia_total_kwh_lag_24h': energia_lag_24h
        }
        
        return pd.DataFrame([features])[self.REQUIRED_FEATURES]

    def predict_resource_impact(self, campus_code: str, **kwargs) -> Dict[str, float]:
        """
        Usa los modelos XGBoost para predecir impacto en agua, energía u ocupación.
        Ahora con validación de features correcta.
        """
        results = {}
        try:
            df = self.build_xgb_features(campus_code, **kwargs)
            # Asegurar que el DataFrame tenga los nombres de columnas correctos
            df.columns = self.REQUIRED_FEATURES
            
            if "xgb_energia" in self.models:
                pred = self.models["xgb_energia"].predict(df)
                results["energy_prediction"] = round(float(pred[0]), 2)
            
            if "xgb_agua" in self.models:
                pred = self.models["xgb_agua"].predict(df)
                results["water_prediction"] = round(float(pred[0]), 2)
                
            if "xgb_ocupacion" in self.models:
                pred = self.models["xgb_ocupacion"].predict(df)
                results["occupancy_prediction"] = round(float(pred[0]), 2)
                
        except Exception as e:
            logger.error(f"Error en predicción XGBoost: {e}")
            # Fallback: usar ratios de eficiencia como estimación
            ratios = self.get_efficiency_ratio("total")
            energia_base = kwargs.get("energia_lag_1h", 100)
            results["energy_prediction"] = round(energia_base * 1.05, 2)  # +5% estimado
            results["water_prediction"] = round(energia_base * ratios["agua"], 2)
            results["occupancy_prediction"] = round(kwargs.get("num_estudiantes", 5000) * ratios["ocupacion"], 2)
            
        return results

    def get_efficiency_ratio(self, sector: str = "total") -> Dict[str, float]:
        """Devuelve los ratios de eficiencia por sector."""
        return self.EFFICIENCY_RATIOS.get(sector, self.EFFICIENCY_RATIOS['total'])


# Singleton instance
prediction_service = PredictionService()
