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
        Eres un Consultor Senior en Sostenibilidad Universitaria y Eficiencia Energética para la UPTC.
        Analiza los datos de la sede y detecta anomalías o oportunidades de ahorro.
        Considera horarios de clases, laboratorios y áreas comunes.
        
        CONTEXTO DEL CAMPUS:
        {json.dumps(campus_context, indent=2)}
        
        FORMATO RELAJADO PERO TÉCNICO:
        Detecta patrones como "consumo nocturno alto en laboratorios" o "picos inusuales en cafeterías".
        
        FORMATO DE RESPUESTA (JSON PURO):
        {{
            "efficiency_score": int (0-100),
            "anomaly_detected": boolean,
            "top_waste_reason": "string (ej. Iluminación canchas deportivas encendida en día)",
            "ai_advice": "Consejo accionable para el administrador de infraestructura.",
            "potential_savings_kwh": float
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
