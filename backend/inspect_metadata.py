import joblib
import os

metadata_path = os.path.join("app", "ml_models", "metadata_sistema.pkl")
metadata = joblib.load(metadata_path)

print("=== CONTENIDO DEL METADATA ===")
print(f"Tipo: {type(metadata)}")

if isinstance(metadata, dict):
    for key, value in metadata.items():
        print(f"\n{key}:")
        print(f"  {value}")
else:
    print(metadata)
