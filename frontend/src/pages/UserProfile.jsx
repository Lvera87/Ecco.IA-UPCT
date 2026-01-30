import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Edit2, Shield,
    Palette, LogOut, Moon, Sun, Check,
    Building2, Users, GraduationCap, Server
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-uptc-gold' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

// Stat Badge
const StatBadge = ({ icon: Icon, value, label, color }) => (
    <div className="text-center">
        <div className={`size-12 mx-auto mb-2 rounded-xl ${color} flex items-center justify-center`}>
            <Icon size={24} className="text-uptc-black" />
        </div>
        <p className="text-xl font-black text-slate-800 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
);

const UserProfile = () => {
    const navigate = useNavigate();
    const { userProfile } = useUser();
    const { theme, setTheme } = useUI();
    const config = userProfile?.config || {};

    const [editMode, setEditMode] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        alerts: true,
        reports: true,
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <Card className="relative overflow-hidden border-slate-200 dark:border-slate-800">
                    {/* Background institutional image (Sede Central) */}
                    <div
                        className="h-40 bg-cover bg-center bg-no-repeat relative border-b-4 border-uptc-gold"
                        style={{
                            backgroundImage: `url('https://www.uptc.edu.co/sitio/export/sites/default/portal/sitios/universidad/vic_aca/tunja/.content/img/slider/sedeCentral.JPG_2142355918.jpg')`
                        }}
                    >
                        {/* Overlay to ensure text readability and institutional feel */}
                        <div className="absolute inset-0 bg-gradient-to-r from-uptc-black/80 via-uptc-black/40 to-transparent"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-end -mt-16 gap-6 relative z-10">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="size-32 rounded-full bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
                                    <div className="size-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Building2 size={48} className="text-uptc-gold" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left mb-2">
                                <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                        {config.campus_name || 'Sede Central'}
                                    </h1>
                                    <span className="px-2.5 py-0.5 rounded-full bg-uptc-gold/10 text-uptc-gold border border-uptc-gold/20 text-xs font-bold uppercase tracking-wider">
                                        Admin UPTC
                                    </span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} />
                                        {config.city || 'Tunja, Boyacá'}
                                    </span>
                                    <span className="hidden md:flex items-center gap-1.5">
                                        <User size={14} />
                                        Gestión de Infraestructura
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end gap-4 w-full md:w-auto mb-2">
                                <Button
                                    size="sm"
                                    variant={editMode ? 'primary' : 'outline'}
                                    className={!editMode ? "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" : "bg-uptc-gold text-black"}
                                    icon={editMode ? Check : Edit2}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? 'Guardar Cambios' : 'Editar Sede'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="relative z-10 grid grid-cols-4 gap-6 mt-4 pt-8 border-t border-slate-200 dark:border-slate-700 pb-8 px-8">
                        <StatBadge icon={GraduationCap} value={config.student_population || 0} label="Estudiantes" color="bg-uptc-gold" />
                        <StatBadge icon={Users} value={config.staff_population || 0} label="Administrativos" color="bg-slate-200 dark:bg-slate-800 text-slate-500" />
                        <StatBadge icon={Building2} value={config.total_area_sqm || 0} label="m² Totales" color="bg-slate-200 dark:bg-slate-800 text-slate-500" />
                        <StatBadge icon={Server} value="12" label="Bloques Activos" color="bg-uptc-gold" />
                    </div>
                </Card>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Campus Info */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Building2 className="text-uptc-gold" size={20} />
                            Datos de Sede
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Nombre de Sede
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        defaultValue={config.campus_name}
                                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-uptc-gold"
                                    />
                                ) : (
                                    <p className="text-slate-800 dark:text-white font-medium">
                                        {config.campus_name || 'Sin nombre asignado'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Dirección Principal
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        defaultValue="Avenida Central del Norte"
                                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-uptc-gold"
                                    />
                                ) : (
                                    <p className="text-slate-800 dark:text-white font-medium">
                                        Avenida Central del Norte #39-115
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Contacto de Emergencia
                                </label>
                                {editMode ? (
                                    <input
                                        type="tel"
                                        defaultValue="+57 8 7405626"
                                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-uptc-gold"
                                    />
                                ) : (
                                    <p className="text-slate-800 dark:text-white font-medium">
                                        +57 8 7405626 (Mantenimiento)
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* System Preferences */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Palette className="text-uptc-gold" size={20} />
                            Preferencias de Sistema
                        </h2>

                        <div className="space-y-6">
                            {/* Theme */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    Tema de interfaz
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all
                      ${theme === 'light'
                                                ? 'border-uptc-gold bg-uptc-gold/5'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-uptc-gold/50'}`}
                                    >
                                        <Sun size={20} className={theme === 'light' ? 'text-uptc-gold' : 'text-slate-400'} />
                                        <span className={theme === 'light' ? 'font-bold text-uptc-gold' : 'text-slate-600 dark:text-slate-300'}>
                                            Claro
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all
                      ${theme === 'dark'
                                                ? 'border-uptc-gold bg-uptc-gold/5'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-uptc-gold/50'}`}
                                    >
                                        <Moon size={20} className={theme === 'dark' ? 'text-uptc-gold' : 'text-slate-400'} />
                                        <span className={theme === 'dark' ? 'font-bold text-uptc-gold' : 'text-slate-600 dark:text-slate-300'}>
                                            Oscuro
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    Alertas Automáticas
                                </label>
                                <div className="space-y-3">
                                    <ToggleSwitch
                                        label="Reportes de Anomalía (Email)"
                                        enabled={notifications.email}
                                        onChange={(v) => setNotifications({ ...notifications, email: v })}
                                    />
                                    <ToggleSwitch
                                        label="Alertas de Pico de Demanda"
                                        enabled={notifications.alerts}
                                        onChange={(v) => setNotifications({ ...notifications, alerts: v })}
                                    />
                                    <ToggleSwitch
                                        label="Resumen Semanal de Eficiencia"
                                        enabled={notifications.reports}
                                        onChange={(v) => setNotifications({ ...notifications, reports: v })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Account Actions */}
                    <Card className="p-6 md:col-span-2">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Shield className="text-uptc-gold" size={20} />
                            Seguridad y Sesión
                        </h2>

                        <div className="flex flex-col md:flex-row gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-700 dark:text-slate-300">
                                Cambiar Contraseña
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-bold"
                            >
                                <LogOut size={20} />
                                Cerrar Sesión Segura
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
