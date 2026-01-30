import React, { useState } from 'react';
import {
  BarChart3, Zap, Calendar,
  Download, Clock, DollarSign, Lightbulb, Target,
  Building2, Users
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

// Custom Tooltip
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

const EnergyAnalysis = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const { userProfile } = useUser();
  const { consumptionHistory, assets, dashboardInsights } = useEnergy();
  const { addNotification } = useUI();

  // Extraer métricas institucionales
  const metrics = dashboardInsights?.metrics || {};
  const projectedKwh = metrics.monthly_kwh || 0;
  
  // Costo por kWh industrial aproximado si no viene del backend
  const kwhPrice = 850; 

  const formatMoney = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  // Procesar historial de consumo real (Sede)
  const processedData = consumptionHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString('es-CO', { weekday: 'short' }),
    consumo: entry.value,
    promedio: 1500, // Mock baseline institucional
    costo: entry.value * kwhPrice
  }));

  // Distribución Horaria Típica Universitaria
  const hourlyData = [
    { hora: '06:00', value: 200 },
    { hora: '08:00', value: 850 },
    { hora: '10:00', value: 1200 }, // Pico académico
    { hora: '12:00', value: 900 },
    { hora: '14:00', value: 1150 },
    { hora: '16:00', value: 1000 },
    { hora: '18:00', value: 1300 }, // Pico nocturno
    { hora: '20:00', value: 950 },
    { hora: '22:00', value: 300 },
  ];

  // Desglose por Activo Institucional
  const deviceData = assets
    .map(a => ({
      name: a.name,
      consumption: a.consumption * 30, // Mensual
      percentage: Math.min(100, Math.round(((a.consumption * 30) / projectedKwh) * 100)) || 0
    }))
    .sort((a, b) => b.consumption - a.consumption)
    .slice(0, 5);

  const handleExport = () => {
    addNotification({
      type: 'success',
      title: 'Reporte Institucional',
      message: `Análisis de ${userProfile.config?.campus_name || 'Sede'} exportado.`
    });
  };

  // Insights Institucionales
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <BarChart3 className="text-uptc-gold" size={32} />
              Análisis Energético de Sede
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Desglose técnico de consumo para {userProfile.config?.campus_name || 'Campus UPTC'}.
            </p>
          </div>

          <div className="flex items-center gap-4">
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

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consumption Chart */}
          <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Curva de Demanda</h2>
                <p className="text-sm text-slate-500">Comportamiento real vs línea base operativa.</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-uptc-gold">
                  <div className="size-2 rounded-full bg-uptc-gold" />
                  <span>Sede</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="size-2 rounded-full bg-slate-300" />
                  <span>Promedio UPTC</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full min-w-0" style={{ minHeight: '300px' }}>
              {isReady ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={processedData.length > 0 ? processedData : [{name: 'Lun', consumo: 1200, promedio: 1100}, {name: 'Mar', consumo: 1350, promedio: 1150}]}>
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
              ) : (
                <EmptyState
                  title="Cargando datos..."
                  description="Obteniendo telemetría de la sede."
                />
              )}
            </div>
          </Card>

          {/* Asset Distribution */}
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

        {/* Hourly Distribution */}
        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Perfil de Carga Diaria</h2>
              <p className="text-sm text-slate-500">Curva típica de operación universitaria.</p>
            </div>
          </div>

          <div className="h-[250px] w-full min-w-0" style={{ minHeight: '250px' }}>
            {isReady && (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FDB913" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#FDB913" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                  <XAxis
                    dataKey="hora"
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FDB913"
                    strokeWidth={3}
                    fill="url(#colorHourly)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Insights Section */}
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
    </div>
  );
};

export default EnergyAnalysis;
