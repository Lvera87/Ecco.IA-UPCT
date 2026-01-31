/**
 * API para Analytics - Análisis Avanzado
 * Objetivos 2, 3, 4: Anomalías, Recomendaciones, XAI
 */
import api from './client'; // Corregido: Importar desde client.js

export const analyticsApi = {
    /**
     * Análisis de eficiencia por sector
     */
    getSectorAnalysis: async (campusId) => {
        const response = await api.get(`/analytics/campuses/${campusId}/sector-analysis`);
        return response.data;
    },

    /**
     * Detectar anomalías en consumo histórico
     */
    getAnomalies: async (campusId, days = 30, sector = 'total') => {
        const response = await api.get(`/analytics/campuses/${campusId}/anomalies`, {
            params: { days, sector }
        });
        return response.data;
    },

    /**
     * Obtener horas pico de consumo
     */
    getPeakHours: async (campusId, days = 7) => {
        const response = await api.get(`/analytics/campuses/${campusId}/peak-hours`, {
            params: { days }
        });
        return response.data;
    },

    /**
     * Análisis completo del campus
     */
    getFullAnalysis: async (campusId) => {
        const response = await api.get(`/analytics/campuses/${campusId}/full-analysis`);
        return response.data;
    },

    /**
     * Explicación XAI de predicciones
     */
    getPredictionExplanation: async (campusId) => {
        const response = await api.get(`/analytics/campuses/${campusId}/predictions/explain`);
        return response.data;
    },

    /**
     * Recomendaciones contextualizadas por sector
     */
    getRecommendations: async (campusId) => {
        const response = await api.post(`/analytics/campuses/${campusId}/recommendations`);
        return response.data;
    },

    /**
     * Datos históricos de consumo (2018-2025 simulados)
     */
    getHistoricalData: async (campusId, days = 30) => {
        const response = await api.get(`/analytics/campuses/${campusId}/historical`, {
            params: { days }
        });
        return response.data;
    },

    /**
     * Desglose histórico por sector
     */
    getHistoricalSectors: async (campusId, days = 7) => {
        const response = await api.get(`/analytics/campuses/${campusId}/historical/sectors`, {
            params: { days }
        });
        return response.data;
    },

    /**
     * Resumen global de analytics para todas las sedes
     */
    getGlobalSummary: async () => {
        const response = await api.get('/analytics/global/summary');
        return response.data;
    }
};

export default analyticsApi;
