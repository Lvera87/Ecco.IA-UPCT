
import logging
import os
import joblib
from pathlib import Path
import sys

# Configurar logging basico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test")

def test_load():
    base_path = Path("backend/app/ml_models").resolve()
    print(f"Buscando modelos en: {base_path}")
    
    files = ["prophet_uptc_tun.pkl", "xgb_energia.pkl"]
    
    for f in files:
        path = base_path / f
        if path.exists():
            print(f"[OK] Archivo encontrado: {f}")
            try:
                model = joblib.load(path)
                print(f"[SUCCESS] Modelo cargado: {f} - Tipo: {type(model)}")
            except Exception as e:
                print(f"[ERROR] Fallo al cargar {f}: {e}")
        else:
            print(f"[MISSING] No encontrado: {path}")

if __name__ == "__main__":
    test_load()
