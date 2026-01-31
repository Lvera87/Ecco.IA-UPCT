import google.generativeai as genai
from app.core.config import get_settings
import json
import logging

logger = logging.getLogger("app")

class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.gemini_api_key
        self.model_name = settings.gemini_model_name
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
                logger.info("Gemini Service configured successfully (Standard Lib).")
            except Exception as e:
                logger.error(f"Failed to configure Gemini: {e}")
                self.model = None
        else:
            logger.warning("Gemini API Key not found. AI features will be disabled.")

    async def get_residential_insights(self, home_context: dict) -> dict:
        """
        Analiza los datos del hogar y devuelve insights.
        """
        if not self.model:
            return {}

        prompt = f"""
        Eres un experto en Eficiencia Energética Residencial para la plataforma Ecco-IA.
        Analiza el contexto del hogar y genera un informe de ahorro en formato JSON.
        
        CONTEXTO DEL HOGAR:
        {json.dumps(home_context, indent=2)}
        
        FORMATO DE RESPUESTA (JSON PURO):
        {{
            "efficiency_score": int (0-100),
            "top_waste_reason": "string (ej. Aire acondicionado antiguo)",
            "ai_advice": "Breve explicación motivadora sobre cómo bajar la factura",
            "potential_savings_percent": int
        }}
        """
        try:
            response = self.model.generate_content(
                contents=prompt
            )
            import re
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {}
        except Exception as e:
            logger.error(f"Error calling Gemini Residential: {e}")
            return {}
    async def get_campus_insights(self, campus_context: dict) -> dict:
        """
        Analiza los datos de un campus universitario y genera recomendaciones de sostenibilidad.
        """
        if not self.model:
            return {}

        prompt = f"""
        Rol: Ingeniero Senior de Eficiencia Energética y Auditoría de Sostenibilidad para la UPTC.
        Misión: Analizar técnicamente la infraestructura del campus para optimización de recursos.
        
        CONTEXTO TÉCNICO DE LA SEDE:
        {json.dumps(campus_context, indent=2)}
        
        INSTRUCCIONES DE ANÁLISIS:
        1. Identifica ineficiencias críticas basándote en la relación Ocupación/Consumo.
        2. Detecta anomalías operativas (ej. consumo base elevado en horarios no laborales).
        3. Prioriza recomendaciones de alto impacto ROI (Retorno de Inversión).
        
        FORMATO DE SALIDA (JSON ESTRICTO):
        {{
            "efficiency_score": int (0-100, basado en benchmarks),
            "anomaly_detected": boolean,
            "top_waste_reason": "string (Técnico y específico, ej. 'Carga base térmica excesiva en Lab Q')",
            "ai_advice": "Consejo técnico directo para Facility Management.",
            "potential_savings_kwh": float (Estimación conservadora)
        }}
        """
        try:
            response = self.model.generate_content(
                contents=prompt
            )
            import re
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {}
        except Exception as e:
            logger.error(f"Error calling Gemini Campus: {e}")
            return {}
    async def get_prediction_insights(self, predictions: dict, campus_name: str) -> dict:
        if not self.model:
             return {"summary": "Sin IA", "critical_level": "low", "recommendations": [], "ai_analysis": "No disponible"}
        
        # Implementación simplificada
        try:
             response = self.model.generate_content(f"Analiza predicción energía en {campus_name}: {json.dumps(predictions)}")
             return {"summary": "Análisis IA", "ai_analysis": response.text, "recommendations": [], "critical_level": "low"}
        except Exception as e:
             logger.error(f"Error in Gemini Prediction Insights: {e}")
             return {"summary": "Error", "ai_analysis": "Error", "recommendations": [], "critical_level": "low"}

    def _generate_fallback_insights(self, predictions: dict, campus_name: str) -> dict:
        """
        Fallback cuando Gemini no está disponible.
        Genera insights básicos analizando los números directamente.
        """
        try:
            values = predictions.get("predictions", [])
            if not values:
                return {"summary": "Sin datos", "critical_level": "low", "recommendations": [], "ai_analysis": "No hay predicciones disponibles."}
            
            avg = sum(values) / len(values)
            trend = "estable"
            if len(values) >= 2:
                if values[-1] > values[0] * 1.1:
                    trend = "al alza"
                elif values[-1] < values[0] * 0.9:
                    trend = "a la baja"
            
            critical = "low"
            if avg > 500:
                critical = "high"
            elif avg > 200:
                critical = "medium"
            
            return {
                "summary": f"Tendencia {trend} en {campus_name}. Promedio proyectado: {avg:.1f} kWh/día.",
                "critical_level": critical,
                "recommendations": [
                    "Revisar horarios de iluminación en áreas comunes.",
                    "Verificar equipos de climatización durante horas pico.",
                    "Considerar auditoría energética en edificios críticos."
                ],
                "ai_analysis": f"Análisis automático (IA no disponible): Los modelos predicen un consumo promedio de {avg:.1f} kWh para los próximos días en {campus_name}. La tendencia es {trend}."
            }
        except Exception:
            return {"summary": "Error en fallback", "critical_level": "medium", "recommendations": [], "ai_analysis": "No se pudo generar análisis."}

    async def get_global_network_insights(self, campuses_summary: list) -> dict:
        """
        Analiza el estado agregado de TODAS las sedes y genera un resumen ejecutivo para el C-Level / Jefe de Infraestructura.
        """
        if not self.model:
            return {
                "executive_summary": "Resumen no disponible (IA desconectada).",
                "global_status": "NORMAL",
                "strategic_recommendation": "Verificar conexión de red."
            }

        prompt = f"""
        Rol: Director de Infraestructura y Energía de la Universidad (UPTC).
        Misión: Proveer un resumen ejecutivo del estado energético global de la red de campus.
        
        ESTADO ACTUAL DE LA RED (Datos Agregados):
        {json.dumps(campuses_summary, indent=2)}
        
        INSTRUCCIONES:
        1. Analiza la carga total proyectada vs la capacidad instalada (si no hay dato de capacidad, asume un margen seguro).
        2. Genera un "Resumen Ejecutivo" de 2 frases, enfocado en Control Operativo y Costos.
        3. Define el "Estado Global" (OPTIMAL, WARNING, CRITICAL).
        4. Da 1 recomendación estratégica de alto nivel.
        
        FORMATO DE SALIDA (JSON):
        {{
            "executive_summary": "Texto profesional y directo.",
            "global_status": "OPTIMAL / WARNING / CRITICAL",
            "strategic_recommendation": "Acción clave para la semana."
        }}
        """
        try:
            response = self.model.generate_content(
                contents=prompt
            )
            import re
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"executive_summary": "Error parseando respuesta IA.", "global_status": "WARNING"}
        except Exception as e:
            logger.error(f"Error in Gemini Global Insights: {e}")
            return {"executive_summary": "Error en servicio de IA.", "global_status": "WARNING"}

    async def get_chat_response(self, message: str, context: dict, profile_type: str = "residential") -> dict:
        if not self.model:
            return {"response": "Lo siento, el servicio de IA no está configurado."}

        # MODO ECCO IA: Crítico, Sincero y Conciso
        prompt = f"""
        SISTEMA DE AUDITORÍA ENERGÉTICA UPTC - NÚCLEO ECCO IA
        
        INFORMACIÓN DISPONIBLE:
        {json.dumps(context, indent=2, default=str)}
        
        REGLAS DE ORO (ESTRICTO):
        1. BREVEDAD: Se extremadamente conciso. Si el usuario solo saluda, responde con un saludo breve.
        2. INTENCIONALIDAD: Solo analiza los datos del JSON si el usuario hace una pregunta técnica o pide un desglose. No escupas todo el reporte por defecto.
        3. SINCERIDAD CRÍTICA: Cuando analices, sé directo y crítico. Cero lenguaje de marketing.
        4. NO HABLES DE LA "COCINA": Prohibido mencionar modelos, pkl, xgboost, etc. Todo es conocimiento de ECCO IA.
        5. IDENTIDAD: Empieza con "ECCO IA:".
        
        PREGUNTA DEL USUARIO:
        {message}
        
        RESPUESTA (JSON):
        {{ "response": "[Tu respuesta concisa aquí]" }}
        """

        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            
            import re
            json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"response": clean_text}

        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "quota" in err_msg.lower():
                return {"response": "⚠️ ECCO IA: Se ha alcanzado el límite de consultas gratuitas de Google Gemini. Por favor, espera un minuto para la siguiente auditoría crítica."}
            logger.error(f"Error in Gemini Chat: {e}")
            return {"response": "Analítica Crítica ECCO IA: Error técnico procesando los modelos. Reintenta."}

    async def get_sector_recommendations(self, sector_analysis: dict, anomalies: dict, campus_name: str) -> dict:
        if not self.model:
             return self._generate_fallback_sector_recommendations(sector_analysis, anomalies)

        prompt = f"""
        Rol: Ingeniero de Eficiencia Energética UPTC.
        Sede: {campus_name}
        
        Análisis:
        {json.dumps(sector_analysis, indent=2, default=str)}
        
        Genera recomendaciones JSON:
        {{
            "sector_recommendations": [],
            "quick_wins": [],
            "resumen_ejecutivo": "..."
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '')
            import re
            json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"sector_recommendations": [], "quick_wins": [], "resumen_ejecutivo": response.text[:200]}
        except Exception as e:
            logger.error(f"Error in Gemini Sector Recommendations: {e}")
            return self._generate_fallback_sector_recommendations(sector_analysis, anomalies)

    def _generate_fallback_sector_recommendations(self, sector_analysis: dict, anomalies: dict) -> dict:
        """Fallback simple"""
        recommendations = []
        
        inefficient = sector_analysis.get("inefficient_sectors", [])
        for sector in inefficient[:5]:
            rec = {
                "sector": sector.get("name", "Sector"),
                "problema": f"Consumo {sector.get('deviation_percent', 0):.0f}% sobre el benchmark",
                "accion": f"Realizar auditoría energética en {sector.get('name', 'sector')}",
                "responsable": "Facility Management",
                "plazo": "Corto" if sector.get("deviation_percent", 0) < 40 else "Inmediato",
                "ahorro_estimado": f"{sector.get('deviation_percent', 0) * 0.4:.0f}%",
                "inversion_requerida": "Baja",
                "roi_estimado": "3-6 meses"
            }
            recommendations.append(rec)
        
        # Agregar recomendación por consumo fuera de horario
        off_hours = anomalies.get("off_hours_usage", {})
        if off_hours.get("waste_percent", 0) > 5:
            recommendations.append({
                "sector": "General - Horarios",
                "problema": f"{off_hours.get('waste_percent', 0):.1f}% del consumo ocurre fuera de horario",
                "accion": "Implementar temporizadores y sensores de presencia",
                "responsable": "Mantenimiento Eléctrico",
                "plazo": "Corto",
                "ahorro_estimado": f"{off_hours.get('waste_percent', 0) * 0.7:.0f}%",
                "inversion_requerida": "Media",
                "roi_estimado": "6-12 meses"
            })
        
        return {
            "sector_recommendations": recommendations,
            "quick_wins": [
                "Desconectar equipos en standby fuera de horario",
                "Ajustar termostatos de climatización a 24°C",
                "Revisar iluminación en áreas de bajo uso"
            ],
            "resumen_ejecutivo": f"Se identificaron {len(inefficient)} sectores con oportunidad de mejora. Potencial de ahorro estimado: 15-25%."
        }
        
    async def explain_model_decision(self, prediction: float, features: dict, shap_values: list = None) -> dict:
        """
        Objetivo 4: Explica las decisiones del modelo en lenguaje natural.
        Traduce valores SHAP o features importantes a explicaciones comprensibles.
        """
        if not self.model:
            return self._generate_fallback_explanation(prediction, features)

        prompt = f"""
        Rol: Científico de Datos explicando un modelo de ML a stakeholders no técnicos.
        Misión: Traducir la predicción del modelo a lenguaje comprensible y confiable.
        
        PREDICCIÓN DEL MODELO: {prediction:.2f} kWh
        
        VARIABLES DE ENTRADA (Features):
        {json.dumps(features, indent=2)}
        
        {f"VALORES SHAP (importancia de cada variable): {shap_values}" if shap_values else ""}
        
        INSTRUCCIONES:
        1. Explica en 2-3 oraciones POR QUÉ el modelo predice este valor.
        2. Destaca las 2-3 variables MÁS influyentes.
        3. Indica si la predicción es "típica" o "atípica" para este contexto.
        4. Sugiere qué cambios en las variables reducirían el consumo.
        5. USA LENGUAJE CLARO, evita jerga técnica excesiva.
        
        FORMATO JSON:
        {{
            "explicacion_principal": "Por qué el modelo predice X kWh",
            "factores_clave": ["Factor 1: explicación", "Factor 2: explicación"],
            "tipo_prediccion": "normal/elevada/baja",
            "sugerencias": ["Cómo reducir consumo basado en el modelo"],
            "confianza": "alta/media/baja"
        }}
        """
        try:
            response = self.model.generate_content(
                contents=prompt
            )
            import re
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"explicacion_principal": response.text[:300]}
        except Exception as e:
            logger.error(f"Error in Gemini Model Explanation: {e}")
            return self._generate_fallback_explanation(prediction, features)

    def _generate_fallback_explanation(self, prediction: float, features: dict) -> dict:
        """Fallback para explicación sin IA."""
        tipo = "normal"
        if prediction > 300:
            tipo = "elevada"
        elif prediction < 100:
            tipo = "baja"
        
        factores = []
        if features.get("hora", 12) >= 10 and features.get("hora", 12) <= 14:
            factores.append("Horario de máxima actividad académica (10-14h)")
        if features.get("en_periodo_academico", 1) == 1:
            factores.append("Periodo académico activo incrementa demanda base")
        if features.get("temp_promedio_c", 18) > 25:
            factores.append("Alta temperatura activa sistemas de climatización")
        
        return {
            "explicacion_principal": f"El modelo predice {prediction:.0f} kWh basándose en el horario, ocupación y condiciones climáticas actuales.",
            "factores_clave": factores[:3] if factores else ["Consumo base típico para la hora y día"],
            "tipo_prediccion": tipo,
            "sugerencias": ["Reducir cargas no esenciales en horas pico", "Optimizar climatización"],
            "confianza": "media"
        }


gemini_service = GeminiService()
