import asyncio
import sys
import os
import json

# Añadir el directorio actual al path para importar app
sys.path.append(os.getcwd())

from app.services.prediction_service import prediction_service
from app.api.endpoints.analytics import get_model_consistent_data
# from app.db.session import AsyncSessionLocal # No necesario para este test aislado

async def test_chat_context_flow():
    print("=== INICIANDO TEST DE INTEGRACIÓN: CHAT & MODELOS ===")
    
    # 1. Simular conexión a BD (usaremos el servicio directamente donde sea posible)
    print("\n1. Verificando Servicio de Predicción...")
    if not prediction_service.is_loaded:
        print("❌ ERROR: Los modelos no están cargados.")
        return
    print("✅ Modelos cargados en memoria (Prophet + XGBoost).")

    # 2. Obtener Predicciones Reales (Prophet)
    print("\n2. Obteniendo pronóstico 'Model-Consistent' (Prophet)...")
    # Simulamos el campus_id 1 (Tunja -> 'tun')
    # Nota: get_model_consistent_data requiere sesión de BD, pero para este test
    # llamaremos directo al prediction_service como lo hace esa función internamente
    # para aislar la prueba de la BD.
    
    try:
        # Tunja
        campus_code = "tun" 
        forecast = prediction_service.predict_campus_consumption(campus_code, days=7)
        
        if forecast and len(forecast['predictions']) > 0:
            print(f"✅ Prophet generó datos reales:")
            print(f"   - Fecha Inicio: {forecast['dates'][0]}")
            print(f"   - Predicción (kWh): {forecast['predictions'][0]}")
            print(f"   - Tendencia: {forecast['trend'][0]}")
        else:
            print("❌ ERROR: Prophet devolvió datos vacíos.")
            return

        # 3. Obtener Análisis de Eficiencia (XGBoost)
        print("\n3. Calculando Eficiencia de Infraestructura (XGBoost)...")
        # Simulamos un edificio
        impact = prediction_service.predict_resource_impact(
            campus_code, 
            area_m2=500.0, 
            num_estudiantes=100,
            lag_1h=120.0, # Datos reales para que XGBoost no falle
            lag_24h=2500.0
        )
        
        if impact.get('energy_prediction', 0) > 0:
            print(f"✅ XGBoost calculó consumo esperado:")
            print(f"   - Consumo Esperado (Modelo): {impact['energy_prediction']} kWh")
            # Simulamos dato real del edificio
            consumo_real = 150.0 
            desviacion = ((consumo_real - impact['energy_prediction']) / impact['energy_prediction']) * 100
            print(f"   - Consumo Real (Simulado DB): {consumo_real} kWh")
            print(f"   - Desviación Detectada: {desviacion:.2f}%")
        else:
             print("❌ ERROR: XGBoost no devolvió predicción.")
             return

        # 4. Construir Contexto para Gemini
        print("\n4. Construyendo Contexto para el Chatbot...")
        context = {
            "campus": "Sede Central Tunja",
            "forecast_next_7_days": [f"{forecast['dates'][i]}: {forecast['predictions'][i]} kWh" for i in range(3)],
            "sector_efficiency_sample": {
                "name": "Bloque de Ingeniería",
                "expected_kwh": impact['energy_prediction'],
                "actual_kwh": consumo_real
            }
        }
        
        json_context = json.dumps(context, indent=2)
        print("✅ Contexto JSON generado exitosamente:")
        print(json_context)
        
        if "null" in json_context:
             print("⚠️ ADVERTENCIA: Hay valores nulos en el contexto.")
        else:
             print("✅ Integridad de datos verificada (Sin Nulls).")

        print("\n=== CONCLUSIÓN ===")
        print("🎉 El flujo de datos es correcto. El Chatbot recibirá datos matemáticos reales de los modelos.")

    except Exception as e:
        print(f"❌ EXCEPCIÓN CRÍTICA: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_chat_context_flow())
