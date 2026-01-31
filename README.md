# Ecco IA - Sistema Integrado de Gestión de Sostenibilidad y Consumo Energético

## 📄 Descripción del Proyecto
> **Nota:** La información detallada del proyecto (contexto, objetivos y alcance) debe completarse con el contenido del documento de especificaciones.
> 
> [Insertar aquí la información del documento de Google Docs: https://docs.google.com/document/d/1qbnNP4R0tvGJS7drrBGjAot8FwMuPfka/edit?pli=1]

Este proyecto es una plataforma integral diseñada para la gestión, monitoreo y análisis del consumo energético y la sostenibilidad en campus universitarios (basado en la estructura de la UPCT). Permite la visualización de datos en tiempo real, predicciones basadas en modelos de IA y control operativo.

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando una arquitectura moderna de microservicios, separando el frontend y el backend para maximizar la escalabilidad y el mantenimiento.

### 🖥️ Frontend (Cliente Web)
Una aplicación de una sola página (SPA) rápida y reactiva.

*   **Core:** [React 18](https://react.dev/) - Biblioteca principal para la interfaz de usuario.
*   **Build Tool:** [Vite](https://vitejs.dev/) - Entorno de desarrollo y empaquetador ultrarrápido.
*   **Lenguaje:** JavaScript (ESModules).
*   **Estilos:** 
    *   [Tailwind CSS](https://tailwindcss.com/) - Framework de utilidades para diseño rápido y consistente.
    *   PostCSS - Procesador de CSS.
*   **Navegación:** [React Router v6](https://reactrouter.com/) - Manejo de rutas y navegación del lado del cliente.
*   **Estado y Datos:** [TanStack Query (React Query)](https://tanstack.com/query/latest) - Gestión de estado asíncrono y caché de datos del servidor.
*   **Visualización de Datos:** [Recharts](https://recharts.org/) - Librería de gráficos composables para visualizar métricas de consumo.
*   **Cliente HTTP:** [Axios](https://axios-http.com/) - Para las peticiones al backend.
*   **Iconos:** [Lucide React](https://lucide.dev/) - Colección de iconos ligeros y consistentes.
*   **Testing:** 
    *   [Vitest](https://vitest.dev/) - Runner de pruebas unitarias.
    *   React Testing Library - Testing de componentes.
*   **Calidad de Código:** ESLint, Prettier.

### ⚙️ Backend (API y Lógica de Negocio)
Una API RESTful robusta y de alto rendimiento con capacidades de Inteligencia Artificial.

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) - Framework web moderno y rápido para construir APIs con Python 3.9+.
*   **Servidor:** [Uvicorn](https://www.uvicorn.org/) - Servidor ASGI de alta velocidad.
*   **Base de Datos:**
    *   [SQLAlchemy](https://www.sqlalchemy.org/) - ORM (Object Relational Mapper) para interactuar con la base de datos.
    *   [Alembic](https://alembic.sqlalchemy.org/) - Herramienta para migraciones de base de datos.
    *   [AsyncPG](https://github.com/MagicStack/asyncpg) - Driver asíncrono para PostgreSQL.
    *   AIOSQLite - Soporte asíncrono para SQLite (desarrollo local).
*   **Autenticación y Seguridad:**
    *   Python-jose - Implementación de JSON Web Tokens (JWT).
    *   Passlib (con Bcrypt) - Hashing seguro de contraseñas.
*   **Ciencia de Datos e IA:**
    *   [Pandas](https://pandas.pydata.org/) - Manipulación y análisis de datos.
    *   [Scikit-learn](https://scikit-learn.org/) - Algoritmos de Machine Learning clásicos.
    *   [XGBoost](https://xgboost.readthedocs.io/) - Algoritmo de Gradient Boosting optimizado.
    *   [Prophet](https://facebook.github.io/prophet/) - Modelado de series temporales para predicciones.
    *   [Google GenAI](https://ai.google.dev/) - Integración con modelos generativos de Google.
*   **Testing:** [Pytest](https://docs.pytest.org/) y Pytest-asyncio.
*   **Linting:** Ruff.

### 🐳 Infraestructura (DevOps)
*   **Docker:** Contenedores para el frontend y backend.
*   **Docker Compose:** Orquestación de servicios para desarrollo local.

---

## 🚀 Instalación y Despliegue Local

### Requisitos Previos
*   Node.js (v18 o superior)
*   Python (v3.10 o superior)
*   Docker y Docker Compose (opcional, recomendado)

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Ecco-IA
```

### 2. Configurar el Backend
```bash
cd backend
python -m venv venv_win  # O venv en Linux/Mac
# Activar entorno (Windows): .\venv_win\Scripts\activate
# Activar entorno (Linux/Mac): source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # Configurar variables de entorno
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
cp .env.example .env  # Configurar variables de entorno si es necesario
```

### 4. Ejecutar el Proyecto
**Opción A: Docker Compose (Recomendado)**
```bash
docker-compose up --build
```

**Opción B: Ejecución Manual**
*   Terminal 1 (Backend): `uvicorn app.main:app --reload`
*   Terminal 2 (Frontend): `npm run dev`

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:8000`.

---
