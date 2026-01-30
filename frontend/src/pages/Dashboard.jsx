import React, { useState, useMemo } from 'react';
import {
  Building2, Users, GraduationCap, Activity, Zap,
  TrendingDown, Target, DollarSign, Server, Wind,
  Lightbulb, AlertCircle, BarChart3, MapPin
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import InfrastructureAlert from '../components/ui/InfrastructureAlert';
import CampusConsumptionChart from '../components/dashboard/CampusConsumptionChart';
import { useUser } from '../context/UserContext';
import { useEnergy } from '../context/EnergyContext';

// El Tooltip personalizado ahora se maneja dentro de CampusConsumptionChart

const Dashboard = () => {
  const [showInsightAlert, setShowInsightAlert] = useState(true);

  // Contextos (Infraestructura UPTC)
  const { userProfile, syncUserProfile } = useUser();
  const {
    assets, consumptionHistory, dashboardInsights,
    isSyncing, syncEnergyData
  } = useEnergy();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    syncEnergyData();
    return () => clearTimeout(timer);
  }, []);

  // Extraer métricas del backend (InfrastructureService)
  const metrics = dashboardInsights?.metrics || {};
  const config = userProfile?.config || {};

  // Formateadores
  const formatMoney = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val, decimals = 0) => new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);

  // Datos para gráficos
  const chartData = useMemo(() => {
    if (consumptionHistory.length > 0) {
      return consumptionHistory.map(r => ({
        time: new Date(r.date).toLocaleDateString([], { day: '2-digit', month: 'short' }),
        value: r.value
      })).reverse();
    }
    // Datos simulados para demo si no hay historial
    return [
      { time: 'Lun', value: 4500 }, { time: 'Mar', value: 5200 },
      { time: 'Mié', value: 4900 }, { time: 'Jue', value: 5100 },
      { time: 'Vie', value: 5800 }, { time: 'Sáb', value: 2100 },
      { time: 'Dom', value: 1800 }
    ];
  }, [consumptionHistory]);

  if (isSyncing && !dashboardInsights) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="size-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-8 text-slate-500 font-display font-bold uppercase tracking-[0.2em] text-xs animate-pulse">
          Sincronizando Sede UPTC...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      {showInsightAlert && dashboardInsights?.ai_advice && (
        <InfrastructureAlert
          insight={{ ai_advice: dashboardInsights.ai_advice }}
          onClose={() => setShowInsightAlert(false)}
        />
      )}

      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Control de Infraestructura
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-uptc-gold/10 rounded-full border border-uptc-gold/30 text-[10px] font-black uppercase text-uptc-black dark:text-uptc-gold tracking-wider">
                <Activity size={12} className="animate-pulse" /> Sistema UPTC En Línea
              </div>
              <p className="text-sm text-slate-500">
                Gestión unificada de sedes y activos energéticos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Presupuesto Ejecutado</span>
              <span className="text-xl font-display font-bold text-uptc-gold">
                {metrics.efficiency_score ? `${metrics.efficiency_score}%` : 'N/A'}
              </span>
            </div>
            <Button variant="primary">
              <BarChart3 size={18} className="mr-2" />
              Reporte General
            </Button>
          </div>
        </section>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Columna Izquierda (3 cols) */}
          <div className="xl:col-span-3 space-y-8">

            {/* Tarjeta de Sede (Campus Profile) */}
            <Card className="p-6 bg-uptc-black border-uptc-gold/20 relative overflow-hidden group">
              {/* Institutional Background Image */}
              <div
                className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://www.uptc.edu.co/sitio/export/sites/default/portal/sitios/universidad/vic_aca/tunja/.content/img/slider/sedeCentral.JPG_2142355918.jpg')`
                }}
              ></div>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-uptc-black via-uptc-black/60 to-transparent"></div>

              <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
                {/* Info Sede */}
                <div className="flex items-center gap-5">
                  <div className="size-16 rounded-xl flex items-center justify-center bg-uptc-gold text-black">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">
                      {config.campus_name || 'Sede UPTC'}
                    </h3>
                    <p className="text-sm text-uptc-gold flex items-center gap-1">
                      <MapPin size={14} />
                      {config.city || 'Boyacá'}
                    </p>
                  </div>
                </div>

                {/* Métricas de Sede */}
                <div className="flex flex-wrap gap-8">
                  <div className="text-center px-4 border-l border-slate-700/50">
                    <span className="text-2xl font-display font-bold text-white">
                      {formatNumber(config.student_population || 0)}
                    </span>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1 flex items-center justify-center gap-1">
                      <GraduationCap size={12} /> Estudiantes
                    </p>
                  </div>
                  <div className="text-center px-4 border-l border-slate-700/50">
                    <span className="text-2xl font-display font-bold text-white">
                      {formatNumber(config.total_area_sqm || 0)}
                    </span>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">m² Construidos</p>
                  </div>
                  <div className="text-center px-4 border-l border-slate-700/50">
                    <span className="text-2xl font-display font-bold text-uptc-gold">
                      {formatNumber(metrics.energy_intensity_index || 0, 2)}
                    </span>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">kWh/m² (Intensidad)</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Consumo Mes"
                value={formatNumber(metrics.monthly_kwh || 0)}
                unit="kWh"
                icon={Zap}
                color="yellow" // Mapped to gold in StatCard eventually or generic
              />
              <StatCard
                title="Huella Carbono"
                value={formatNumber(metrics.carbon_footprint_tons || 0, 2)}
                unit="Ton CO2"
                icon={Wind}
                color="slate"
              />
              <StatCard
                title="Eficiencia/Estudiante"
                value={formatNumber(metrics.kwh_per_student || 0, 2)}
                unit="kWh/cap"
                icon={Users}
                color="yellow"
              />
              <StatCard
                title="Activos Críticos"
                value={assets.length || 0}
                unit="Equipos"
                icon={Server}
                color="slate"
              />
            </div>

            {/* Gráfico de Consumo Institucional (Refactored) */}
            <CampusConsumptionChart
              data={chartData}
              title="Consumo Energético de Sede"
              subtitle="Monitoreo en tiempo real de bloques y laboratorios."
            />

            {/* Lista de Activos Institucionales */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                  <Server size={20} className="text-uptc-gold" /> Inventario de Activos
                </h3>
              </div>

              {assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-uptc-gold transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="size-10 rounded-lg flex items-center justify-center bg-uptc-gold/10 text-uptc-gold">
                          {asset.asset_type === 'lighting' ? <Lightbulb size={20} /> :
                            asset.asset_type === 'hvac' ? <Wind size={20} /> :
                              <Server size={20} />}
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${asset.status ? 'bg-uptc-black text-uptc-gold' : 'bg-slate-200 text-slate-500'}`}>
                          {asset.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-white truncate">{asset.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{asset.location || 'Sin ubicación'}</div>
                      <div className="mt-3 text-sm font-mono text-slate-600 dark:text-slate-400">
                        {formatNumber(asset.consumption || 0, 1)} kWh/día
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Sin activos registrados"
                  description="Registra transformadores, bloques o equipos mayores."
                />
              )}
            </Card>
          </div>

          {/* Columna Derecha: Insights & Acciones */}
          <aside className="xl:col-span-1 space-y-6">

            {/* Tarjeta de IA */}
            <Card className="p-6 bg-uptc-black text-white shadow-xl shadow-black/20 border-l-4 border-uptc-gold">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-uptc-gold/20 rounded-lg text-uptc-gold">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-bold">Análisis UPTC</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {dashboardInsights?.ai_advice || "El consumo nocturno en el Bloque B es inusualmente alto para un periodo no académico."}
              </p>
              <Button variant="outline" className="w-full text-xs py-2 border-uptc-gold text-uptc-gold hover:bg-uptc-gold hover:text-black">
                Ver detalle
              </Button>
            </Card>

            {/* Alertas */}
            <Card className="p-5 border-uptc-gold/20 bg-uptc-gold/5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={18} className="text-uptc-gold" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Alertas Operativas</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Pico de Demanda</span>
                  <span className="font-bold text-uptc-black dark:text-white">14:00 hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Factor de Potencia</span>
                  <span className="font-bold text-red-500">0.82 (Bajo)</span>
                </div>
              </div>
            </Card>

            {/* Metas */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Meta de Ahorro</span>
                <Target size={16} className="text-uptc-gold" />
              </div>
              <div className="text-2xl font-display font-bold text-slate-800 dark:text-white mb-2">
                15% <span className="text-sm font-medium text-slate-400">vs año anterior</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-uptc-gold h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;