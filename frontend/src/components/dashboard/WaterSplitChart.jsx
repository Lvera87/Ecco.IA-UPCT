import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// Datos simulados (serán reemplazados por props)
const mockData = [
  { day: 'Lun', val: 2100 },
  { day: 'Mar', val: 2300 },
  { day: 'Mie', val: 2500 }, // Sobre meta
  { day: 'Jue', val: 2600 }, // Sobre meta
  { day: 'Vie', val: 2200 },
  { day: 'Sab', val: 1800 },
  { day: 'Dom', val: 1500 },
];

const TARGET = 2400;

const WaterSplitChart = ({ data = mockData, target = TARGET }) => {
  // Calcular el offset para el gradiente
  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.val));
    const dataMin = Math.min(...data.map((i) => i.val));

    if (dataMax <= target) return 0;
    if (dataMin >= target) return 1;

    return (dataMax - target) / (dataMax - dataMin);
  };

  const off = gradientOffset();
  
  // Calcular métricas
  const currentVal = data[data.length - 1]?.val || 0;
  const isCritical = currentVal < target; // Según prompt: Rojo si DEBAJO meta (aunque usualmente es al revés para consumo)
  // CORRECCIÓN INTERNA: El prompt dice "verde cuando esté por encima de la meta y rojo cuando esté por debajo".
  // Seguiré la instrucción literal del prompt visual.

  return (
    <div className="bg-[#0a0f1e] border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Consumo Hídrico vs Meta
          </h3>
          <p className="text-xs text-slate-500 mt-1">Monitoreo de litros por día</p>
        </div>
        <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${
            currentVal > target 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
            {currentVal > target ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
            <span className="text-[10px] font-black uppercase tracking-wider">
                {currentVal > target ? 'OPTIMIZADO' : 'CRÍTICO'}
            </span>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] flex gap-4">
        {/* Gráfico */}
        <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={off} stopColor="#10b981" stopOpacity={0.3} /> {/* Verde Arriba */}
                    <stop offset={off} stopColor="#ef4444" stopOpacity={0.3} /> {/* Rojo Abajo */}
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                    labelStyle={{ color: '#94a3b8' }}
                />
                <ReferenceLine y={target} label={{ value: 'META', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} stroke="#94a3b8" strokeDasharray="3 3" />
                <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#fff"
                    strokeWidth={2}
                    fill="url(#splitColor)"
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Panel Lateral de Métricas */}
        <div className="w-24 flex flex-col justify-between py-2 border-l border-slate-800 pl-4">
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Meta</p>
                <p className="text-lg font-mono font-bold text-slate-400">{target}</p>
            </div>
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Real</p>
                <p className={`text-lg font-mono font-bold ${currentVal > target ? 'text-emerald-400' : 'text-red-400'}`}>
                    {currentVal}
                </p>
            </div>
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Desv.</p>
                <p className="text-xs font-mono text-white">
                    {Math.abs(((currentVal - target) / target) * 100).toFixed(1)}%
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WaterSplitChart;
