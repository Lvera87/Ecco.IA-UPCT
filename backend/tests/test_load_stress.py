import asyncio
import time
import sys
import os
from concurrent.futures import ThreadPoolExecutor

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.prediction_service import prediction_service

# Simulamos carga concurrente directa al servicio (CPU Bound)
# Ya que levantar el servidor uvicorn y golpearlo con HTTP requeriría otro proceso.
# Probaremos si el SERVICIO aguanta llamadas concurrentes.

def task_heavy_prediction(i):
    start = time.time()
    # Hacemos una predicción completa de 30 días (pesada)
    forecast = prediction_service.predict_campus_consumption("tun", days=30)
    duration = time.time() - start
    return i, duration, forecast is not None

async def stress_test():
    print("\n=== ⚡ INICIANDO PRUEBA DE ESTRÉS (CONCURRENCIA) ===")
    print("Simulando 20 usuarios pidiendo predicciones Prophet simultáneamente...")
    
    start_global = time.time()
    
    # Ejecutar 20 predicciones en paralelo usando un ThreadPool
    # (Prophet libera el GIL en C++, así que el threading debería funcionar)
    loop = asyncio.get_running_loop()
    
    tasks = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        for i in range(20):
            tasks.append(loop.run_in_executor(executor, task_heavy_prediction, i))
        
        results = await asyncio.gather(*tasks)
    
    total_time = time.time() - start_global
    
    # Analizar resultados
    success_count = sum(1 for r in results if r[2])
    avg_latency = sum(r[1] for r in results) / len(results)
    
    print(f"\n📊 RESULTADOS DE ESTRÉS:")
    print(f"   - Total Peticiones: 20")
    print(f"   - Exitosas: {success_count}")
    print(f"   - Tiempo Total: {total_time:.2f}s")
    print(f"   - Latencia Promedio por Usuario: {avg_latency:.2f}s")
    print(f"   - Requests/Segundo (RPS): {20/total_time:.2f}")

    if success_count == 20:
        print("   ✅ ÉXITO: El sistema aguantó la carga sin perder peticiones.")
    else:
        print("   ⚠️ ADVERTENCIA: Algunas peticiones fallaron.")
        
    if avg_latency > 2.0:
        print("   🐢 ADVERTENCIA: Latencia alta. Prophet es pesado.")
    else:
        print("   🚀 VELOCIDAD: Respuesta rápida.")

if __name__ == "__main__":
    asyncio.run(stress_test())
