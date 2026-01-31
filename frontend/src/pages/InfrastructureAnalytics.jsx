import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Users, MapPin, Ruler, Briefcase,
    Thermometer, Mountain, Zap, Leaf, Activity, ArrowRight,
    BarChart3, Calendar, Download, Clock, DollarSign, Lightbulb, Target
} from 'lucide-react';
import {
    Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Line, ComposedChart, AreaChart, Area
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';
import GoalsModal from '../components/ui/GoalsModal';
import { useUser } from '../context/UserContext';
import { useEnergy } from '../context/EnergyContext';
import { useUI } from '../context/UIContext';

// Custom Tooltip for Analysis Charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-md p-4 rounded-xl shadow-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} className="text-base font-black" style={{ color: entry.color }}>
                        {entry.name}: {entry.value} {entry.unit || 'kWh'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const InfrastructureAnalytics = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'analysis'

    // --- Summary Data (AllCampusesSummary logic) ---
    const campuses = [
        {
            id: '1',
            name: 'Sede Tunja',
            city: 'Tunja',
            students: 18000,
            employees: 1200,
            area: 120000,
            buildings: 25,
            temp: 13,
            altitude: 2810,
            consumption: 25000,
            carbon: 12.5,
            status: 'normal'
        },
        {
            id: '2',
            name: 'Sede Duitama',
            city: 'Duitama',
            students: 5500,
            employees: 350,
            area: 45000,
            buildings: 10,
            temp: 15,
            altitude: 2590,
            consumption: 8000,
            carbon: 4.2,
            status: 'efficient'
        },
        {
            id: '3',
            name: 'Sede Sogamoso',
            city: 'Sogamoso',
            students: 6000,
            employees: 400,
            area: 50000,
            buildings: 12,
            temp: 14,
            altitude: 2569,
            consumption: 9500,
            carbon: 5.1,
            status: 'inefficient'
        },
        {
            id: '4',
            name: 'Sede Chiquinquirá',
            city: 'Chiquinquirá',
            students: 2000,
            employees: 150,
            area: 18000,
            buildings: 6,
            temp: 12,
            altitude: 2556,
            consumption: 3000,
            carbon: 1.5,
            status: 'efficient'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'efficient': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'inefficient': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'efficient': return 'Eficiente';
            case 'inefficient': return 'Ineficiente';
            default: return 'Normal';
        }
    };

    // --- Analysis Data (EnergyAnalysis logic) ---
    const [timeRange, setTimeRange] = useState('week');
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [isReady, setIsReady] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const { userProfile } = useUser();
    const { consumptionHistory, assets, dashboardInsights } = useEnergy();
    const { addNotification } = useUI();

    // Metrics extraction
    const metrics = dashboardInsights?.metrics || {};
    const projectedKwh = metrics.monthly_kwh || 0;
    const kwhPrice = 850;
    const formatMoney = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    // Process History
    const processedData = consumptionHistory.map(entry => ({
        name: new Date(entry.date).toLocaleDateString('es-CO', { weekday: 'short' }),
        consumo: entry.value,
        promedio: 1500,
        costo: entry.value * kwhPrice
    }));

    // Hourly Data
    const hourlyData = [
        { hora: '06:00', value: 200 },
        { hora: '08:00', value: 850 },
        { hora: '10:00', value: 1200 },
        { hora: '12:00', value: 900 },
        { hora: '14:00', value: 1150 },
        { hora: '16:00', value: 1000 },
        { hora: '18:00', value: 1300 },
        { hora: '20:00', value: 950 },
        { hora: '22:00', value: 300 },
    ];

    // Device Data
    const deviceData = assets
        .map(a => ({
            name: a.name,
            consumption: a.consumption * 30,
            percentage: Math.min(100, Math.round(((a.consumption * 30) / projectedKwh) * 100)) || 0
        }))
        .sort((a, b) => b.consumption - a.consumption)
        .slice(0, 5);

    const handleExport = () => {
        addNotification({
            type: 'success',
            title: 'Reporte Institucional',
            message: `Análisis de infraestructura exportado correctamente.`
        });
    };

    const insights = [
        {
            icon: Users,
            title: 'Eficiencia por Estudiante',
            description: `El consumo per cápita es de ${metrics.kwh_per_student || 0} kWh. Óptimo: < 15 kWh.`,
            action: 'Ver detalle'
        },
        {
            icon: Clock,
            title: 'Carga Base Nocturna',
            description: 'El consumo fuera de horario académico es del 18%. Revise iluminación de pasillos.',
            action: 'Auditar'
        },
        {
            icon: Target,
            title: 'Meta de Sede',
            description: 'Reducir un 5% el consumo del Bloque Administrativo ahorraría $4.5M al mes.',
            action: 'Ajustar meta'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-body">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header with Navigation Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Building2 className="text-emerald-500" size={32} />
                            Gestión de Sedes y Analítica
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Plataforma unificada de monitoreo e inteligencia de datos.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
                ${activeTab === 'summary'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <Building2 size={16} /> Resumen de Sedes
                        </button>
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
                ${activeTab === 'analysis'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <BarChart3 size={16} /> Analítica Avanzada
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === 'summary' ? (
                    // --- SUMMARY VIEW ---
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {campuses.map((campus) => (
                            <Card
                                key={campus.id}
                                className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-300 group"
                            >
                                <div className="p-6 space-y-6">
                                    {/* Cabecera Tarjeta */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    {campus.name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                                    <MapPin size={14} />
                                                    {campus.city}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(campus.status)}`}>
                                            {getStatusLabel(campus.status)}
                                        </div>
                                    </div>

                                    {/* Métricas Principales */}
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Users size={16} /> Estudiantes
                                            </div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {new Intl.NumberFormat().format(campus.students)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Ruler size={16} /> Área Total
                                            </div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {new Intl.NumberFormat().format(campus.area)} m²
                                            </p>
                                        </div>
                                    </div>

                                    {/* Indicadores de Impacto */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                            Impacto Estimado (Mes)
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between mb-1">
                                                    <Zap size={16} className="text-yellow-500" />
                                                    <span className="text-xs text-slate-500">Estimado</span>
                                                </div>
                                                <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                    {new Intl.NumberFormat().format(campus.consumption)} kWh
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between mb-1">
                                                    <Leaf size={16} className="text-green-500" />
                                                    <span className="text-xs text-slate-500">Huella</span>
                                                </div>
                                                <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                    {campus.carbon} Ton CO₂
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => navigate(`/campus/${campus.id}`)}
                                        className="w-full mt-2 group-hover:bg-emerald-600 transition-colors"
                                        variant="primary"
                                    >
                                        Ver Detalles <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    // --- ANALYSIS VIEW ---
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Control Bar */}
                        <div className="flex justify-end gap-4">
                            <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                                {['week', 'month'].map(period => (
                                    <button
                                        key={period}
                                        onClick={() => setTimeRange(period)}
                                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all
                      ${timeRange === period
                                                ? 'bg-uptc-black text-uptc-gold shadow-md'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        {period === 'week' ? 'Semanal' : 'Mensual'}
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="md"
                                icon={Download}
                                className="border-uptc-gold text-uptc-gold hover:bg-uptc-gold hover:text-black"
                                onClick={handleExport}
                            >
                                Exportar
                            </Button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={Zap}
                                title="Consumo Proyectado"
                                value={Math.round(projectedKwh).toLocaleString()}
                                unit="kWh"
                                color="yellow"
                                tooltip="Proyección de cierre de mes basada en consumo actual."
                            />
                            <StatCard
                                icon={DollarSign}
                                title="Presupuesto Estimado"
                                value={formatMoney(projectedKwh * kwhPrice)}
                                unit="/ mes"
                                trend="up"
                                trendValue={2.4}
                                color="slate"
                            />
                            <StatCard
                                icon={Target}
                                title="Intensidad (kWh/m²)"
                                value={metrics.energy_intensity_index || 0}
                                unit="kWh/m²"
                                color="yellow"
                                tooltip="Indicador de eficiencia por metro cuadrado construido."
                            />
                            <StatCard
                                icon={Calendar}
                                title="Proyección Anual"
                                value={formatMoney(projectedKwh * kwhPrice * 12)}
                                unit="/ año"
                                color="slate"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 dark:text-white">Curva de Demanda</h2>
                                        <p className="text-sm text-slate-500">Comportamiento real vs línea base operativa.</p>
                                    </div>
                                </div>
                                <div className="h-[300px] w-full min-w-0" style={{ minHeight: '300px' }}>
                                    {isReady && (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <ComposedChart data={processedData.length > 0 ? processedData : [{ name: 'Lun', consumo: 1200, promedio: 1100 }, { name: 'Mar', consumo: 1350, promedio: 1150 }]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                                    unit=" kWh"
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="consumo" fill="#FDB913" radius={[6, 6, 0, 0]} barSize={40} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="promedio"
                                                    stroke="#94a3b8"
                                                    strokeWidth={2}
                                                    strokeDasharray="4 4"
                                                    dot={false}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8">Consumo por Activo</h2>
                                <div className="space-y-6">
                                    {deviceData.length > 0 ? deviceData.map((device, idx) => (
                                        <div key={idx} className="space-y-2 group">
                                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                                                <span className="group-hover:text-uptc-gold transition-colors">{device.name}</span>
                                                <span className="text-slate-900 dark:text-white">{device.percentage}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-uptc-gold transition-all duration-1000"
                                                    style={{ width: `${device.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )) : (
                                        <EmptyState title="Sin inventario" description="Registre activos para ver el desglose." />
                                    )}
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Lightbulb className="text-uptc-gold" size={24} />
                                Recomendaciones de Gestión
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {insights.map((insight, idx) => (
                                    <InsightCard
                                        key={idx}
                                        icon={insight.icon}
                                        title={insight.title}
                                        description={insight.description}
                                        action={insight.action}
                                        onClick={() => insight.action === 'Ajustar meta' ? setIsGoalsModalOpen(true) : null}
                                    />
                                ))}
                            </div>
                        </div>

                        <GoalsModal
                            isOpen={isGoalsModalOpen}
                            onClose={() => setIsGoalsModalOpen(false)}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default InfrastructureAnalytics;
