/**
 * Auth API Client
 * Maneja registro, login y refresh de tokens
 */
import client from './client';

const TOKEN_KEY = 'ecco_access_token';
const REFRESH_KEY = 'ecco_refresh_token';
const USER_TYPE_KEY = 'ecco_user_type';

export const authApi = {
    /**
     * Registra un nuevo usuario con perfil
     */
    async register(data) {
        const response = await client.post('/auth/register', data);
        if (response.data) {
            this.saveTokens(response.data);
        }
        return response.data;
    },

    /**
     * Inicia sesión
     */
    async login(username, password) {
        const response = await client.post('/auth/login', { username, password });
        if (response.data) {
            this.saveTokens(response.data);
        }
        return response.data;
    },

    /**
     * Refresca el access token
     */
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await client.post('/auth/refresh', { refresh_token: refreshToken });
        if (response.data) {
            this.saveTokens(response.data);
        }
        return response.data;
    },

    /**
     * Cierra sesión
     */
    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
    },

    /**
     * Guarda tokens en localStorage
     */
    saveTokens({ access_token, refresh_token, user_type }) {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(REFRESH_KEY, refresh_token);
        if (user_type) {
            localStorage.setItem(USER_TYPE_KEY, user_type);
        }
    },

    /**
     * Obtiene el access token
     */
    getAccessToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Obtiene el refresh token
     */
    getRefreshToken() {
        return localStorage.getItem(REFRESH_KEY);
    },

    /**
     * Obtiene el tipo de usuario
     */
    getUserType() {
        return localStorage.getItem(USER_TYPE_KEY);
    },

    /**
     * Verifica si hay sesión activa
     */
    isAuthenticated() {
        return !!this.getAccessToken();
    }
};

export default authApi;
