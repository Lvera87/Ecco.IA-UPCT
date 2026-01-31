import client from './client';

export const infrastructureApi = {
    /**
     * Lista todas las sedes disponibles.
     */
    getCampuses: async () => {
        const response = await client.get('/campus/campuses');
        return response.data;
    },

    /**
     * Obtiene métricas del dashboard global de las sedes.
     */
    getDashboardMetrics: async () => {
        const response = await client.get('/campus/global-dashboard');
        return response.data;
    },

    /**
     * Lista activos de una sede específica.
     */
    getAssets: async (campusId) => {
        if (!campusId) return [];
        const response = await client.get(`/campus/campuses/${campusId}/infrastructure`);
        return response.data;
    },

    /**
     * Crea un nuevo activo en una sede específica.
     */
    createAsset: async (campusId, assetData) => {
        const response = await client.post(`/campus/campuses/${campusId}/infrastructure`, assetData);
        return response.data;
    },

    /**
     * Obtiene el historial de consumo de una sede.
     */
    getConsumptionHistory: async (campusId) => {
        if (!campusId) return [];
        const response = await client.get(`/campus/campuses/${campusId}/consumption-history`);
        return response.data;
    }
};
