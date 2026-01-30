import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    // Theme state
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('eccoIA_theme');
        return saved || 'dark';
    });

    // Notifications state
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('eccoIA_notifications');
        return saved ? JSON.parse(saved) : [
            { id: 1, type: 'alert', title: 'Consumo elevado detectado', message: 'El aire acondicionado ha superado el límite diario.', time: 'Hace 5 min', read: false },
            { id: 2, type: 'tip', title: 'Consejo de ahorro', message: 'Programa tu lavadora en horario nocturno para ahorrar un 15%.', time: 'Hace 1 hora', read: false },
        ];
    });

    useEffect(() => {
        localStorage.setItem('eccoIA_theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('eccoIA_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (notification) => {
        const newNotification = {
            ...notification,
            id: Date.now(),
            time: 'Ahora',
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => setNotifications([]);

    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    const value = {
        theme,
        setTheme,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        unreadNotificationsCount
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};
