import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle } from 'lucide-react';

// Generar datos mock (24 horas)
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const generateProfile = (base, volatility) => hours.map(h => base + Math.random() * volatility);

const mockData = hours.map((hour, i) => ({
  hour,
  Lunes: 50 + Math.random() * 50 + (i > 8 && i < 18 ? 100 : 0),
  Martes: 45 + Math.random() * 50 + (i > 8 && i < 18 ? 95 : 0),
  Miercoles: 55 + Math.random() * 50 + (i > 8 && i < 18 ? 105 : 0),
  Jueves: 52 + Math.random() * 50 + (i > 8 && i < 18 ? 98 : 0),
  Viernes: 48 + Math.random() * 50 + (i > 8 && i < 18 ? 90 : 0),
  Sabado: 20 + Math.random() * 10,
  Domingo: 15 + Math.random() * 5,
}));

const WeeklyProfileChart = () => {
  return (
    <div className="bg-[#0a0f1e] border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-sm font-bold text-white">Perfiles de Carga Semanal</h3>
            <p className="text-xs text-slate-500 mt-1">Comparativa de tendencias horarias (24h)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500">
            <AlertCircle size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Anomalía: Martes 14:00</span>
        </div>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="hour" tick={{fontSize: 10, fill: '#64748b'}} interval={2} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                itemStyle={{ fontSize: '11px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
            
            {/* Días Laborales (Líneas Sólidas) */}
            <Line type="monotone" dataKey="Lunes" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Martes" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Miercoles" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Jueves" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Viernes" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            
            {/* Fin de Semana (Líneas Punteadas) */}
            <Line type="monotone" dataKey="Sabado" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="Domingo" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyProfileChart;
