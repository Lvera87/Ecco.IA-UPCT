import client from './client';

export const campusApi = {
    // Listar todas las sedes
    getAll: async () => {
        const response = await client.get('/campuses');
        return response.data;
    },

    // Obtener detalle de una sede
    getById: async (id) => {
        const response = await client.get(`/campuses/${id}`);
        return response.data;
    },

    // Crear nueva sede
    create: async (data) => {
        const response = await client.post('/campuses', data);
        return response.data;
    },

    // Obtener infraestructura de una sede
    getInfrastructure: async (campusId) => {
        const response = await client.get(`/campuses/${campusId}/infrastructure`);
        return response.data;
    },

    // Añadir infraestructura
    addInfrastructure: async (campusId, data) => {
        const response = await client.post(`/campuses/${campusId}/infrastructure`, data);
        return response.data;
    },

    // Obtener predicciones (ML + Gemini)
    getPredictions: async (campusId, days = 7) => {
        const response = await client.get(`/campuses/${campusId}/predictions`, { params: { days } });
        return response.data;
    },

    // Generar análisis de IA on-demand (Legacy o específico)
    getAiAnalysis: async (campusId) => {
        const response = await client.post(`/campuses/${campusId}/ai-analysis`);
        return response.data;
    }
};
