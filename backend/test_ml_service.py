from app.services.prediction_service import prediction_service

def test_robust_service():
    print("=== TEST 1: Verificar carga de modelos ===")
    print(f"Modelos cargados: {list(prediction_service.models.keys())}")
    print(f"Estado: {'OK' if prediction_service.is_loaded else 'FALLO'}")
    
    print("\n=== TEST 2: Predicción Prophet con caché ===")
    # Primera llamada (sin caché)
    forecast1 = prediction_service.predict_campus_consumption("tun", days=3)
    print(f"Primera llamada: {forecast1['predictions'] if forecast1 else 'FALLO'}")
    
    # Segunda llamada (debería usar caché)
    forecast2 = prediction_service.predict_campus_consumption("tun", days=3)
    print(f"Segunda llamada (caché): {forecast2['predictions'] if forecast2 else 'FALLO'}")
    
    print("\n=== TEST 3: XGBoost DEBUG ===")
    if "xgb_energia" in prediction_service.models:
        model = prediction_service.models["xgb_energia"]
        print(f"Tipo de modelo: {type(model)}")
    
    impact = prediction_service.predict_resource_impact(
        campus_code="tun",
        hora=14,
        num_estudiantes=15400,
        num_edificios=12,
        area_m2=52300.0,
        temp_promedio_c=16.5,
        lag_1h=150.0,
        lag_24h=3600.0
    )
    print(f"Predicciones XGBoost: {impact}")
    
    print("\n=== TEST 4: Ratios de eficiencia ===")
    ratios = prediction_service.get_efficiency_ratio("laboratorios")
    print(f"Ratios laboratorios: {ratios}")
    
    print("\n=== TODOS LOS TESTS COMPLETADOS ===")

if __name__ == "__main__":
    test_robust_service()
