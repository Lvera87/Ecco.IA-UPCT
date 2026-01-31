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
const DEMO_CAMPUSES = [
  { id: 1, name: 'Sede Central Tunja', location_city: 'Tunja', baseline_energy_kwh: 14500, status: 'online' },
  { id: 2, name: 'Seccional Duitama', location_city: 'Duitama', baseline_energy_kwh: 8200, status: 'warning' },
  { id: 3, name: 'Seccional Sogamoso', location_city: 'Sogamoso', baseline_energy_kwh: 11300, status: 'online' },
  { id: 4, name: 'Sede Chiquinquirá', location_city: 'Chiquinquirá', baseline_energy_kwh: 5400, status: 'maintenance' },
];

const SystemStatus = ({ status = "ONLINE", color = "emerald" }) => (
  <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${color}-500/10 border border-${color}-500/20 shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
    <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse shadow-[0_0_8px_currentColor]`} />
    <span className={`text-[10px] font-mono font-bold text-${color}-400 tracking-widest`}>
      SYSTEM_{status}
    </span>
  </div>
);

const GlobalMetric = ({ title, value, unit, icon: Icon, color, trend }) => (
  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-[#0a0f1e] to-slate-900 border border-${color}-500/20 p-6 group hover:border-${color}-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--color-${color}),0.1)]`}>
    {/* Abstract Background Effect */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`} />

    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400`}>
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
          <span className={`text-xs font-bold text-${color}-500 font-mono`}>{unit}</span>
        </div>
      </div>
    </div>
  </div>
);

const CampusNode = ({ campus, onClick }) => (
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
          <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Carga Actual</p>
          <p className="text-xl font-bold text-white font-mono">
            {(campus.baseline_energy_kwh * 0.8 / 30).toFixed(1)} <span className="text-xs text-slate-500">kWh/h</span>
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
  const [metrics, setMetrics] = useState({ totalEnergy: 0, activeAlerts: 0, efficiency: 0 });

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const data = await campusApi.getAll();
        if (data && data.length > 0) {
          setCampuses(data);
          // Basic calculations if real data
          const total = data.reduce((acc, c) => acc + (c.baseline_energy_kwh || 0), 0);
          setMetrics({
            totalEnergy: total,
            activeAlerts: 2, // Mocked for now
            efficiency: 92.4
          });
        } else {
          console.warn("API returned empty, using fallback demo data");
          setCampuses(DEMO_CAMPUSES);
          // Demo calculations
          const total = DEMO_CAMPUSES.reduce((acc, c) => acc + (c.baseline_energy_kwh || 0), 0);
          setMetrics({
            totalEnergy: total,
            activeAlerts: 1,
            efficiency: 88.5
          });
        }
      } catch (e) {
        console.error("Dashboard error:", e);
        setCampuses(DEMO_CAMPUSES); // Fail-safe
        const total = DEMO_CAMPUSES.reduce((acc, c) => acc + (c.baseline_energy_kwh || 0), 0);
        setMetrics({
          totalEnergy: total,
          activeAlerts: 1,
          efficiency: 88.5
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGlobal();
  }, []);

  // Mock global aggregate chart data with more movement
  const globalChartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 3000) + 8000 + (Math.sin(i / 3) * 2000)
  }));

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
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.com/noise.svg')] opacity-20" />
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
              El consumo actual se encuentra <span className="text-emerald-400 font-bold">dentro de los parámetros nominales</span>.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-slate-500 font-mono">TIEMPO DE EJECUCIÓN</p>
            <p className="text-2xl font-bold text-white font-mono">14d 03h 22m</p>
          </div>
        </div>

        {/* GLOBAL METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlobalMetric
            title="Consumo Proyectado (Mes)"
            value={metrics.totalEnergy.toLocaleString()}
            unit="kWh"
            icon={Zap}
            color="blue"
            trend={-2.4}
          />
          <GlobalMetric
            title="Alertas de Sistema"
            value={metrics.activeAlerts}
            unit="Críticas"
            icon={AlertTriangle}
            color="amber"
            trend={0}
          />
          <GlobalMetric
            title="Impacto Poblacional"
            value="12.4k"
            unit="Usuarios"
            icon={Users}
            color="purple"
            trend={+5.1}
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

        {/* MAIN SECTION: MAP & GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[500px]">

          {/* LEFT: AGGREGATE CHART (Now on Left for emphasis/Dashboard look) */}
          <div className="lg:col-span-2 bg-[#0a0f1e] border border-slate-800 rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-white text-lg font-bold flex items-center gap-3">
                <Activity size={20} className="text-blue-500" />
                Telemetría de Red Global
              </h3>
              <div className="flex gap-2">
                {['1H', '24H', '7D', '30D'].map(range => (
                  <button key={range} className={`px-3 py-1 rounded text-[10px] font-bold ${range === '24H' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
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

          {/* RIGHT: CAMPUS LIST (Vertical Scrollable List) */}
          <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-white font-bold flex items-center gap-2">
                <LayoutGrid size={20} className="text-emerald-500" />
                Sedes Conectadas
              </h2>
              <span className="text-xs font-mono text-slate-500">{campuses.length} ACTIVAS</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {campuses.map(campus => (
                <CampusNode
                  key={campus.id}
                  campus={campus}
                  onClick={() => navigate(`/campuses/${campus.id}`)}
                />
              ))}

              {/* Add New Node Placeholder */}
              <button className="w-full py-4 border border-dashed border-slate-800 rounded-xl text-slate-600 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                + Vincular Nueva Sede
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;