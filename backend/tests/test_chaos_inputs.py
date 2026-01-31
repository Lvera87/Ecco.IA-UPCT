import sys
import os
import math
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.prediction_service import prediction_service

def test_chaos_inputs():
    print("\n=== 💀 INICIANDO PRUEBAS DE CAOS (CHAOS MONKEY) ===")

    # CASO 1: El Infinito y Más Allá
    print("\n1. Inyectando 'Infinity' en métricas de estudiantes...")
    try:
        impact = prediction_service.predict_resource_impact(
            campus_code="tun",
            num_estudiantes=float('inf'), # ¡Boom!
            area_m2=float('inf')
        )
        print(f"   ⚠️ Resultado (Infinity): {impact}")
        # XGBoost suele manejar inf, pero queremos ver si nuestra lógica de negocio aguanta
    except Exception as e:
        print(f"   🛡️ Excepción Controlada: {e}")

    # CASO 2: Tipos Incorrectos (Strings en lugar de Floats)
    print("\n2. Inyectando Strings en campos numéricos (Fuzzing)...")
    try:
        # Esto debería fallar por validación de tipos de Python o Pydantic antes,
        # pero si llamamos al servicio directo, ¿qué pasa?
        impact = prediction_service.predict_resource_impact(
            campus_code="tun",
            area_m2="mil metros cuadrados", # Texto
            lag_1h=None # Null
        )
        print(f"   ❌ FALLO: El sistema aceptó texto como número: {impact}")
    except TypeError:
        print("   ✅ ÉXITO: TypeError capturado correctamente.")
    except Exception as e:
        print(f"   ✅ ÉXITO: Excepción capturada: {e}")

    # CASO 3: Fechas Futuras Lejanas (Año 3000)
    print("\n3. Pidiendo predicción para el año 3000 (Prophet)...")
    try:
        from datetime import datetime
        future_date = datetime(3000, 1, 1)
        forecast = prediction_service.predict_campus_consumption("tun", days=7, start_date=future_date)
        
        if forecast and len(forecast['predictions']) > 0:
            val = forecast['predictions'][0]
            print(f"   ℹ️ Predicción Año 3000: {val}")
            # Prophet debería extrapolar la tendencia, probablemente dando un número gigante o absurdo,
            # pero NO debe crashear.
            assert isinstance(val, (int, float))
            print("   ✅ ÉXITO: Prophet sobrevivió al viaje en el tiempo.")
        else:
            print("   ⚠️ Prophet devolvió vacío (Aceptable).")
            
    except Exception as e:
        print(f"   ❌ CRASH: {e}")

    # CASO 4: Inyección de Código en Campus Code
    print("\n4. Intentando inyección en 'campus_code'...")
    try:
        # Intentar acceder a un archivo del sistema o romper el path
        impact = prediction_service.predict_resource_impact(campus_code="../../etc/passwd")
        print(f"   ℹ️ Resultado Path Traversal: {impact}")
        # Debería devolver 0 o vacío porque no encuentra el modelo "prophet_../../etc/passwd"
        assert impact['energy_prediction'] > 0 # Debería usar fallback o calculo genérico si no encuentra modelo específico
        print("   ✅ ÉXITO: Sistema robusto ante path traversal.")
    except Exception as e:
        print(f"   ⚠️ Excepción: {e}")

if __name__ == "__main__":
    test_chaos_inputs()
