import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { name: '08:00', consumo: 400, ocupacion: 20 },
  { name: '10:00', consumo: 800, ocupacion: 65 },
  { name: '12:00', consumo: 950, ocupacion: 85 },
  { name: '14:00', consumo: 900, ocupacion: 80 },
  { name: '16:00', consumo: 700, ocupacion: 55 },
  { name: '18:00', consumo: 500, ocupacion: 30 },
];

const ConsumptionOccupancyChart = ({ data = mockData }) => {
  // Calcular consumo estimado promedio
  const avgConsumption = Math.round(data.reduce((acc, curr) => acc + curr.consumo, 0) / data.length);

  return (
    <div className="bg-[#0a0f1e] border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold text-white">Correlación Ocupación / Energía</h3>
          <p className="text-xs text-slate-500 mt-1">Eficiencia operativa en tiempo real</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">CONSUMO ESTIMADO</p>
            <p className="text-2xl font-display font-black text-[#FDB913] leading-none">
                {avgConsumption} <span className="text-xs font-bold text-slate-600">kWh</span>
            </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
            
            {/* Eje Izquierdo: Consumo */}
            <YAxis yAxisId="left" orientation="left" stroke="#FDB913" tick={{fontSize: 10, fill: '#FDB913'}} axisLine={false} tickLine={false} label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: '#FDB913', fontSize: 10 }} />
            
            {/* Eje Derecho: Ocupación */}
            <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" tick={{fontSize: 10, fill: '#8b5cf6'}} axisLine={false} tickLine={false} unit="%" />
            
            <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                 itemStyle={{ fontSize: '12px' }}
            />
            
            {/* Barras de Ocupación (Morado) */}
            <Bar yAxisId="right" dataKey="ocupacion" name="Ocupación" fill="#8b5cf6" barSize={20} radius={[4, 4, 0, 0]} fillOpacity={0.6} />
            
            {/* Línea de Consumo (Oro) */}
            <Line yAxisId="left" type="monotone" dataKey="consumo" name="Energía" stroke="#FDB913" strokeWidth={3} dot={{r: 4, fill: '#000', stroke: '#FDB913', strokeWidth: 2}} activeDot={{r: 6}} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConsumptionOccupancyChart;
