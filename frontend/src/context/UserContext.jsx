import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { infrastructureApi } from '../api/infrastructure';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // Perfil del Campus
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('eccoIA_userProfile');
        return saved ? JSON.parse(saved) : {
            type: 'infrastructure',
            name: 'Admin UPTC',
        };
    });

    // Persist profile locally as cache
    useEffect(() => {
        localStorage.setItem('eccoIA_userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    /**
     * Sincroniza datos del campus.
     */
    const syncUserProfile = useCallback(async () => {
        try {
            // Asumiendo que dashboard trae info básica del perfil también
            const metrics = await infrastructureApi.getDashboardMetrics();
            if (metrics && metrics.campus_name) {
                setUserProfile(prev => ({
                    ...prev,
                    config: metrics // Guardamos métricas como config por ahora
                }));
            }
        } catch (error) {
            console.error("Campus Sync Error:", error);
        }
    }, []);

    const updateProfile = useCallback((updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    }, []);

    const value = {
        userProfile,
        setUserProfile: updateProfile,
        syncUserProfile,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
