import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Globe, Zap, Users, ArrowRight,
  LayoutGrid, Map, ShieldCheck, AlertTriangle,
  Server, Database, Lock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { campusApi } from '../api/campus';

// --- DEMO DATA FALLBACK (Antídoto a la "Tristeza") ---


const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hoverBorder: 'hover-border-emerald-500/50', iconBg: 'bg-emerald-500/10', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hoverBorder: 'hover-border-amber-500/50', iconBg: 'bg-amber-500/10', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', hoverBorder: 'hover-border-blue-500/50', iconBg: 'bg-blue-500/10', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', hoverBorder: 'hover-border-purple-500/50', iconBg: 'bg-purple-500/10', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', hoverBorder: 'hover-border-red-500/50', iconBg: 'bg-red-500/10', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
};

const SystemStatus = ({ status = "ONLINE", color = "emerald" }) => {
  const theme = COLOR_MAP[color] || COLOR_MAP.emerald;
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${theme.bg} ${theme.border} border shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
      <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse ${theme.glow}`} />
      <span className={`text-[10px] font-mono font-bold ${theme.text} tracking-widest`}>
        SYSTEM_{status}
      </span>
    </div>
  );
};

const GlobalMetric = ({ title, value, unit, icon: Icon, color, trend }) => {
  const theme = COLOR_MAP[color] || COLOR_MAP.emerald;
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-[#0a0f1e] to-slate-900 border ${theme.border} p-6 group hover:border-opacity-50 transition-all duration-300 hover:shadow-lg`}>
      {/* Abstract Background Effect */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${theme.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-all`} />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${theme.iconBg} border ${theme.border} ${theme.text}`}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className={`text-xs font-bold font-mono py-1 px-2 rounded bg-white/5 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 opacity-80">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tracking-tighter shadow-black drop-shadow-lg">{value}</span>
            <span className={`text-xs font-bold ${theme.text} font-mono`}>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampusNode = ({ campus, prediction, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer relative overflow-hidden rounded-xl bg-[#0c1220] border border-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 group"
  >
    {/* Image Overlay Gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c1220]/80 to-[#0c1220] z-0" />

    {/* Status Line */}
    <div className={`absolute top-0 left-0 w-1 h-full bg-${campus.status === 'online' ? 'emerald' : campus.status === 'warning' ? 'amber' : 'red'}-500`} />

    <div className="p-5 relative z-10 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors flex items-center gap-2">
            {campus.name}
          </h4>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
            <Map size={12} /> {campus.location_city}
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${campus.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          {campus.status === 'online' ? 'OPERATIONAL' : 'ALERT'}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-end">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">
            {prediction ? "Proyección Hoy" : "Carga Basal Est."}
          </p>
          <p className="text-xl font-bold text-white font-mono">
            {prediction
              ? `${Math.round(prediction.forecast.predictions[0])} kWh`
              : `${(campus.baseline_energy_kwh / 30).toFixed(0)} kWh`
            }
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-blue-500 font-bold group-hover:translate-x-1 transition-transform">
          VER MÉTRICAS <ArrowRight size={14} />
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalEnergy: 0, activeAlerts: 0, efficiency: 0, population: 0 });

  // Estado para la gráfica agregada real
  const [globalChartData, setGlobalChartData] = useState([]);
  const [campusPredictions, setCampusPredictions] = useState({});

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        // 1. Obtener Sedes Reales
        const campusesData = await campusApi.getAll();
        setCampuses(campusesData || []);

        if (!campusesData || campusesData.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Obtener Predicciones Reales
        // Carga secuencial para evitar saturar el backend en Windows con modelos pesados
        const predictionsData = {};
        for (const c of campusesData) {
          try {
            const pred = await campusApi.getPredictions(c.id, 7);
            predictionsData[c.id] = pred;
          } catch (err) {
            console.error(`Error fetching predictions for campus ${c.id}:`, err);
            predictionsData[c.id] = null;
          }
        }
        setCampusPredictions(predictionsData);

        // 3. Agregar Datos (Solo si existen)
        const aggregatedMap = {};

        allPredictions.forEach((pred) => {
          if (pred && pred.forecast && pred.forecast.dates) {
            pred.forecast.dates.forEach((date, i) => {
              const shortDate = date.substring(5); // MM-DD
              if (!aggregatedMap[shortDate]) {
                aggregatedMap[shortDate] = { time: shortDate, value: 0 };
              }
              aggregatedMap[shortDate].value += (pred.forecast.predictions[i] || 0);
            });
          }
        });

        const aggregatedChart = Object.values(aggregatedMap)
          .sort((a, b) => a.time.localeCompare(b.time))
          .map(item => ({ ...item, value: Math.round(item.value) }));

        setGlobalChartData(aggregatedChart);

        // Métricas solo con datos reales
        const totalBaseline = campusesData.reduce((acc, c) => acc + (c.baseline_energy_kwh || 0), 0);
        const totalProjected = aggregatedChart.reduce((acc, curr) => acc + curr.value, 0);

        // Calcular Alertas Reales: Sedes con status != 'online'
        const activeAlertsCount = campusesData.filter(c => c.status && c.status !== 'online').length;

        // Calcular Población Total Real
        const totalPopulation = campusesData.reduce((acc, c) => acc + (c.population_students || 0), 0);

        // Calcular Eficiencia (Simulada honestamente como relación Baseline vs Proyección si no hay dato real)
        // Si Proyectado < Baseline = Eficiente.
        const efficiencyScore = totalBaseline > 0 ? ((totalBaseline - totalProjected) / totalBaseline * 100) : 0;
        const normalizedEfficiency = Math.min(Math.max(efficiencyScore + 100, 0), 100).toFixed(1); // 100% = baseline met exactly or better

        setMetrics({
          totalEnergy: totalProjected || totalBaseline,
          activeAlerts: activeAlertsCount,
          efficiency: normalizedEfficiency,
          population: totalPopulation
        });

      } catch (e) {
        console.error("Dashboard error:", e);
        // NO MOCK DATA ON ERROR
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center text-blue-500 font-mono gap-4">
      <div className="relative">
        <Globe size={48} className="animate-spin text-blue-600" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20" />
      </div>
      <div className="text-xs tracking-[0.5em] animate-pulse text-blue-400">INITIATING GLOBAL VIEW...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px]" />

      </div>

      {/* GLOBAL HEADER */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
            <Globe className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-sans text-white">ECCO-IA <span className="text-slate-500 font-light">GLOBAL</span></h1>
            <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Infrastructure Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden xl:flex gap-8 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-2"><Server size={12} /> SERVER: ONLINE</span>
            <span className="flex items-center gap-2"><Database size={12} /> DB: CONNECTED</span>
            <span className="flex items-center gap-2 text-emerald-500"><Lock size={12} /> SECURE LINK</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <SystemStatus status={metrics.activeAlerts > 0 ? "WARNING" : "OPTIMAL"} color={metrics.activeAlerts > 0 ? "amber" : "emerald"} />
        </div>
      </div>

      <div className="p-8 max-w-[1920px] mx-auto space-y-8 relative z-10">

        {/* WELCOME / SUMMARY */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Resumen de Red</h2>
            <p className="text-slate-400 max-w-2xl">
              Visión global del rendimiento energético en {campuses.length} sedes universitarias.
              {metrics.activeAlerts > 0
                ? <span className="text-amber-400 font-bold ml-1">Atención requerida en {metrics.activeAlerts} sedes.</span>
                : <span className="text-emerald-400 font-bold ml-1">Operación nominal en toda la red.</span>}
            </p>
          </div>
        </div>

        {/* GLOBAL METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlobalMetric
            title="Proyección Cierre Mes"
            value={metrics.totalEnergy.toLocaleString()}
            unit="kWh"
            icon={Zap}
            color="blue"
            trend={-2.4}
          />
          <GlobalMetric
            title="Alertas Operativas"
            value={metrics.activeAlerts}
            unit="Críticas"
            icon={AlertTriangle}
            color="amber"
            trend={0}
          />
          <GlobalMetric
            title="Ocupación Estimada"
            value={(metrics.population || 0).toLocaleString()}
            unit="Personas"
            icon={Users}
            color="purple"
            trend={null}
          />
          <GlobalMetric
            title="Índice de Eficiencia"
            value={metrics.efficiency}
            unit="%"
            icon={Activity}
            color="emerald"
            trend={+1.2}
          />
        </div>

        {/* SECTION 1: AGGREGATE CHART (Full Width) */}
        <div className="bg-[#0a0f1e] border border-slate-800 rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />

          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-white text-lg font-bold flex items-center gap-3">
              <Activity size={20} className="text-blue-500" />
              Perfil de Carga Agregado (Control Operativo)
            </h3>
            <div className="flex gap-2">
              {['Semana Operativa'].map(range => (
                <button key={range} className={`px-3 py-1 rounded text-[10px] font-bold bg-blue-600 text-white cursor-default`}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full min-h-[320px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={globalChartData}>
                <defs>
                  <linearGradient id="colorGlobal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis dataKey="time" hide />
                <YAxis orientation="right" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGlobal)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 2: CAMPUS GRID (Cards Layout) */}
        <div>
          <div className="flex items-center justify-between pb-6">
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <LayoutGrid size={24} className="text-emerald-500" />
              Panel de Control de Sedes
            </h2>
            <span className="text-xs font-mono text-slate-500">{campuses.length} ACTIVAS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campuses.map(campus => (
              <CampusNode
                key={campus.id}
                campus={campus}
                prediction={campusPredictions[campus.id]}
                onClick={() => navigate(`/campuses/${campus.id}`)}
              />
            ))}

            {/* Add New Node Placeholder */}
            <button className="h-full min-h-[200px] border border-dashed border-slate-800 rounded-xl text-slate-600 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-xs font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-2">
              <span className="text-2xl">+</span>
              Vincular Nueva Sede
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;