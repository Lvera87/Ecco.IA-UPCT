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
        # Usar pathlib para que las rutas sean relativas al archivo, no al directorio de trabajo
        from pathlib import Path
        current_file = Path(__file__).resolve()
        self.models_path = current_file.parent.parent / "ml_models"
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

    def predict_campus_consumption(self, campus_code: str, days: int = 7, start_date: Optional[datetime] = None) -> Optional[Dict[str, Any]]:
        """
        Realiza inferencia sobre un rango de fechas usando Prophet.
        Si start_date es pasado, hace 'back-casting' (lo que el modelo dice que pasó).
        """
        # 1. Verificar caché
        cache_key = f"{campus_code}_{days}_{start_date.strftime('%Y%m%d') if start_date else 'now'}"
        if self._is_cache_valid(cache_key):
            return self._prediction_cache[cache_key]['data']

        model_key = f"prophet_{campus_code}"
        if model_key not in self.models:
            return None

        try:
            model = self.models[model_key]
            
            # Crear un DataFrame de fechas personalizado (puede ser pasado o futuro)
            base_date = start_date or datetime.now()
            date_list = [base_date + timedelta(days=x) for x in range(days)]
            future = pd.DataFrame({'ds': date_list})
            
            forecast = model.predict(future)
            
            result = {
                "dates": forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
                "predictions": [round(v, 2) for v in forecast['yhat'].tolist()],
                "lower_bound": [round(v, 2) for v in forecast['yhat_lower'].tolist()],
                "upper_bound": [round(v, 2) for v in forecast['yhat_upper'].tolist()],
                "trend": [round(v, 2) for v in forecast['trend'].tolist()]
            }
            
            self._prediction_cache[cache_key] = {'data': result, 'timestamp': datetime.now()}
            return result
            
        except Exception as e:
            logger.error(f"Error en inferencia Prophet ({campus_code}): {e}")
            return None

    def build_xgb_features(
        self,
        campus_code: str,
        resource_type: str = "energia", 
        hora: int = 12,
        num_estudiantes: int = 5000,
        num_edificios: int = 10,
        area_m2: float = 15000.0,
        temp_promedio_c: float = 18.0,
        lag_1h: float = 100.0,
        lag_24h: float = 2400.0,
        es_festivo: bool = False,
        en_periodo_academico: bool = True
    ) -> pd.DataFrame:
        """
        Construye un DataFrame con las features específicas.
        Incluye SANITIZACIÓN de inputs para evitar valores físicos imposibles.
        """
        # Sanitización (Edge Case Protection)
        hora = max(0, min(23, hora))
        num_estudiantes = max(0, num_estudiantes)
        num_edificios = max(1, num_edificios) # Al menos 1 edificio
        area_m2 = max(10.0, area_m2) # Área mínima
        lag_1h = max(0.0, lag_1h)
        lag_24h = max(0.0, lag_24h)
        
        now = datetime.now()
        
        # Features comunes
        base_features = {
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
            'area_m2': area_m2
        }

        # Features específicas según recurso
        if resource_type == "agua":
            base_features['agua_litros_lag_1h'] = lag_1h
            base_features['agua_litros_lag_24h'] = lag_24h
            feature_order = [
                'hora', 'dia_numero', 'es_fin_semana', 'sede_code', 'es_festivo', 
                'en_periodo_academico', 'mes', 'temp_promedio_c', 'num_estudiantes', 
                'num_edificios', 'area_m2', 'agua_litros_lag_1h', 'agua_litros_lag_24h'
            ]
        else: # energia u ocupacion (asumimos que usan lags de energia por defecto o similar)
            base_features['energia_total_kwh_lag_1h'] = lag_1h
            base_features['energia_total_kwh_lag_24h'] = lag_24h
            feature_order = [
                'hora', 'dia_numero', 'es_fin_semana', 'sede_code', 'es_festivo', 
                'en_periodo_academico', 'mes', 'temp_promedio_c', 'num_estudiantes', 
                'num_edificios', 'area_m2', 'energia_total_kwh_lag_1h', 'energia_total_kwh_lag_24h'
            ]
        
        # Features específicas según recurso
        if resource_type == "agua":
            base_features['agua_litros_lag_1h'] = lag_1h
            base_features['agua_litros_lag_24h'] = lag_24h
            feature_order = [
                'hora', 'dia_numero', 'es_fin_semana', 'sede_code', 'es_festivo', 
                'en_periodo_academico', 'mes', 'temp_promedio_c', 'num_estudiantes', 
                'num_edificios', 'area_m2', 'agua_litros_lag_1h', 'agua_litros_lag_24h'
            ]
        elif resource_type == "ocupacion":
            base_features['ocupacion_pct_lag_1h'] = lag_1h / 100.0 # Asumiendo entrada bruta, ajustar si es pct
            base_features['ocupacion_pct_lag_24h'] = lag_24h / 100.0
            feature_order = [
                'hora', 'dia_numero', 'es_fin_semana', 'sede_code', 'es_festivo', 
                'en_periodo_academico', 'mes', 'temp_promedio_c', 'num_estudiantes', 
                'num_edificios', 'area_m2', 'ocupacion_pct_lag_1h', 'ocupacion_pct_lag_24h'
            ]
        else: # energia
            base_features['energia_total_kwh_lag_1h'] = lag_1h
            base_features['energia_total_kwh_lag_24h'] = lag_24h
            feature_order = [
                'hora', 'dia_numero', 'es_fin_semana', 'sede_code', 'es_festivo', 
                'en_periodo_academico', 'mes', 'temp_promedio_c', 'num_estudiantes', 
                'num_edificios', 'area_m2', 'energia_total_kwh_lag_1h', 'energia_total_kwh_lag_24h'
            ]
        
        return pd.DataFrame([base_features])[feature_order]

    def predict_resource_impact(self, campus_code: str, **kwargs) -> Dict[str, float]:
        """
        Usa los modelos XGBoost para predecir impacto.
        """
        import xgboost as xgb
        results = {}
        
        # Mapeo de modelos y sus tipos de recurso
        models_config = [
            ("xgb_energia", "energia", "energy_prediction"),
            ("xgb_agua", "agua", "water_prediction"),
            ("xgb_ocupacion", "ocupacion", "occupancy_prediction")
        ]
        
        try:
            for model_key, resource_type, result_key in models_config:
                if model_key in self.models:
                    model = self.models[model_key]
                    
                    # Construir features ESPECÍFICAS para este modelo
                    df = self.build_xgb_features(
                        campus_code, 
                        resource_type=resource_type,
                        **kwargs
                    )
                    
                    try:
                        # Intento 1: Directo
                        pred = model.predict(df)
                    except Exception:
                        # Intento 2: DMatrix con nombres explícitos
                        feature_names = df.columns.tolist()
                        dtest = xgb.DMatrix(df.values, feature_names=feature_names)
                        booster = model.get_booster()
                        pred = booster.predict(dtest)
                    
                    results[result_key] = round(float(pred[0]), 2)
                
        except Exception as e:
            logger.error(f"Error CRÍTICO en predicción XGBoost: {e}")
            raise e 
            
        return results

    def get_efficiency_ratio(self, sector: str = "total") -> Dict[str, float]:
        """Devuelve los ratios de eficiencia por sector."""
        return self.EFFICIENCY_RATIOS.get(sector, self.EFFICIENCY_RATIOS['total'])


# Singleton instance
prediction_service = PredictionService()
