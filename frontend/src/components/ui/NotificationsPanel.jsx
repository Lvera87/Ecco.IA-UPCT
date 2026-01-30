import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle, Lightbulb, Trophy, Settings, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NotificationIcon = ({ type }) => {
    const icons = {
        alert: { icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-500' },
        tip: { icon: Lightbulb, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-500' },
        achievement: { icon: Trophy, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-500' },
        system: { icon: Settings, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-500' },
    };

    const config = icons[type] || icons.system;
    const Icon = config.icon;

    return (
        <div className={`size-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
            <Icon size={18} />
        </div>
    );
};

const NotificationsPanel = () => {
    const {
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications
    } = useApp();

    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Close panel on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                )}
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-800 dark:text-white">Notificaciones</h3>
                            {unreadNotificationsCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 text-xs font-bold">
                                    {unreadNotificationsCount} nuevas
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadNotificationsCount > 0 && (
                                <button
                                    onClick={markAllNotificationsAsRead}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
                                    title="Marcar todas como leídas"
                                >
                                    <CheckCheck size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="size-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Bell size={24} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No hay notificaciones</p>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Te avisaremos cuando haya algo nuevo</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => markNotificationAsRead(notification.id)}
                                        className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50
                      ${!notification.read ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                                    >
                                        <NotificationIcon type={notification.type} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`font-bold text-sm truncate ${!notification.read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <button
                                onClick={clearNotifications}
                                className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={14} />
                                Limpiar todo
                            </button>
                            <button className="text-sm font-bold text-primary hover:underline">
                                Ver historial
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;
