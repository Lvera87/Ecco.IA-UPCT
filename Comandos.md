# Guía de Comandos - Ecco IA

## 🛠️ Configuración Inicial (Solo la primera vez)

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### Frontend
```powershell
cd frontend
npm install
cp .env.example .env
```

---

## 🚀 Ejecución en Desarrollo

### Backend
Desde la carpeta raíz:
```powershell
cd backend; .\.venv\Scripts\python -m uvicorn app.main:app --reload
```
*Nota: El backend estará disponible en `http://localhost:8000/docs`*

### Frontend
Desde la carpeta raíz:
```powershell
cd frontend; npm run dev
```
*Nota: El frontend estará disponible en `http://localhost:5173`*

---

## 🧪 Testing y Calidad
```powershell
# Backend (Pytest + Linting)
cd backend; .\.venv\Scripts\pytest
cd backend; .\.venv\Scripts\ruff check .

# Frontend (Vitest)
cd frontend; npm run test
```
