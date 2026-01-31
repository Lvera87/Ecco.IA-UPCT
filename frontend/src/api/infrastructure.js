import client from './client';

export const infrastructureApi = {
    /**
     * Lista todas las sedes disponibles.
     */
    getCampuses: async () => {
        const response = await client.get('/campuses');
        return response.data;
    },

    /**
     * Obtiene métricas del dashboard global de las sedes.
     */
    getDashboardMetrics: async () => {
        const response = await client.get('/global-dashboard');
        return response.data;
    },

    /**
     * Lista activos de una sede específica.
     */
    getAssets: async (campusId) => {
        if (!campusId) return [];
        const response = await client.get(`/campuses/${campusId}/infrastructure`);
        return response.data;
    },

    /**
     * Crea un nuevo activo en una sede específica.
     */
    createAsset: async (campusId, assetData) => {
        const response = await client.post(`/campuses/${campusId}/infrastructure`, assetData);
        return response.data;
    }
};
