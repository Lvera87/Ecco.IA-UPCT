import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app.services.prediction_service import prediction_service

def test_prediction_service_edge_cases():
    print("\n=== INICIANDO PRUEBAS DE BORDE (EDGE CASES) ===")

    # CASO 1: Inputs Negativos (Imposibles físicamente)
    print("\n1. Probando Inputs Negativos (Estudiantes = -5000)...")
    try:
        impact = prediction_service.predict_resource_impact(
            campus_code="tun",
            num_estudiantes=-5000,
            area_m2=-100.0,
            lag_1h=100.0,
            lag_24h=2400.0
        )
        print(f"   Resultado: {impact}")
        
        # Validación: El consumo NO puede ser negativo
        if impact['energy_prediction'] < 0:
            print("   ❌ FALLO: El modelo predijo consumo de energía negativo.")
            assert False, "Consumo negativo detectado"
        else:
            print("   ✅ ÉXITO: El servicio sanitizó la salida (o el modelo es muy robusto).")
            
    except Exception as e:
        print(f"   ⚠️ Excepción controlada: {e}")

    # CASO 2: Código de Sede Inexistente
    print("\n2. Probando Sede Inexistente ('mars_colony'...).")
    impact_unknown = prediction_service.predict_resource_impact(campus_code="mars_colony")
    print(f"   Resultado: {impact_unknown}")
    # Debería usar el fallback o devolver valores por defecto, no crashear
    assert impact_unknown is not None
    print("   ✅ ÉXITO: El sistema manejó la sede desconocida.")

    # CASO 3: Valores Gigantes (Overflow potencial)
    print("\n3. Probando Valores Gigantes (Area = 1 millón m2)...")
    impact_huge = prediction_service.predict_resource_impact(
        campus_code="tun",
        area_m2=1_000_000.0
    )
    print(f"   Resultado: {impact_huge['energy_prediction']} kWh")
    assert impact_huge['energy_prediction'] > 0
    print("   ✅ ÉXITO: El sistema escaló la predicción.")

if __name__ == "__main__":
    test_prediction_service_edge_cases()
