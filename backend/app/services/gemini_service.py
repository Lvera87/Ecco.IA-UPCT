from google import genai
from app.core.config import get_settings
import json
import logging

logger = logging.getLogger("app")

class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.gemini_api_key
        self.model_name = settings.gemini_model_name
        
        if self.api_key:
            # Nueva librería google-genai usa un cliente centralizado
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("Gemini API Key not found. AI features will be disabled.")

    async def get_residential_insights(self, home_context: dict) -> dict:
        """
        Analiza los datos del hogar y devuelve insights.
        """
        if not self.client:
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
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
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
        if not self.client:
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
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {}
        except Exception as e:
            logger.error(f"Error calling Gemini Campus: {e}")
            return {}
    async def get_prediction_insights(self, predictions: dict, campus_name: str) -> dict:
        """
        Toma las predicciones matemáticas de ML y las traduce a lenguaje humano accionable con Gemini.
        """
        if not self.client:
            return {"response": "IA no configurada para interpretar predicciones."}

        prompt = f"""
        Rol: Ingeniero de Datos Energéticos para Ecco-IA (Nivel Experto).
        Objetivo: Interpretar modelos predictivos (Facebook Prophet / XGBoost) para toma de decisiones ejecutivas.
        
        SEDE: {campus_name}
        TELEMETRÍA PREDICTIVA (Horizonte 7 H):
        {json.dumps(predictions, indent=2)}
        
        INSTRUCCIONES:
        1. Analiza la **Tendencia Central** y los **Intervalos de Confianza** (Incertidumbre).
        2. Si el límite superior ('upper_bound') es alto, alerta sobre posibles picos de demanda.
        3. Provee 3 estrategias de mitigación ingenieriles (Gestión de Demanda, Deslastre de Carga, etc.).
        4. Usa lenguaje técnico, preciso y profesional (evita generalidades).
        
        FORMATO DEL REPORTE (JSON ESTRICTO):
        {{
            "summary": "Diagnóstico conciso de la tendencia y riesgo identificado (máx 1 frase)",
            "critical_level": "low/medium/high (Basado en picos proyectados vs promedio)",
            "recommendations": ["Estrategia 1 (Técnica)", "Estrategia 2 (Operativa)", "Estrategia 3 (Preventiva)"],
            "ai_analysis": "Análisis profundo de la serie de tiempo. Menciona días críticos y volatilidad esperada."
        }}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"summary": "Análisis generado", "ai_analysis": response.text}
        except Exception as e:
            logger.error(f"Error in Gemini Prediction Insights: {e}")
            # FALLBACK: Generar respuesta básica sin IA
            return self._generate_fallback_insights(predictions, campus_name)

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

    async def get_chat_response(self, message: str, context: dict, profile_type: str = "residential") -> dict:
        """
        Maneja una conversación fluida con el usuario inyectando contexto técnico.
        """
        if not self.client:
            return {"response": "Lo siento, el servicio de IA no está configurado."}

        prompt = f"""
        Eres el asistente inteligente de Ecco-IA para el sector Residencial.
        Tu objetivo es ayudar al usuario a entender sus datos de energía y proponer ahorros.
        
        CONTEXTO ACTUAL DEL USUARIO:
        {json.dumps(context, indent=2)}
        
        MENSAJE DEL USUARIO:
        {message}
        
        INSTRUCCIONES:
        1. Sé profesional pero cercano.
        2. Si el usuario pregunta cosas técnicas, usa el contexto proporcionado (estrato, equipos, consumos).
        3. Habla de 'vampiros energéticos' y electrodomésticos.
        4. Responde en español.
        
        RESPUESTA (JSON):
        {{ "response": "tu respuesta aquí" }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"response": response.text}
        except Exception as e:
            logger.error(f"Error in Gemini Chat: {e}")
            return {"response": "Tuve un pequeño corto circuito mental. ¿Podrías repetir la pregunta?"}

gemini_service = GeminiService()
