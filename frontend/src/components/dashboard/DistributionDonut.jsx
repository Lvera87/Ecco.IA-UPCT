import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Laboratorios', value: 35, color: '#ef4444' }, // Rojo
  { name: 'Salones', value: 25, color: '#eab308' },      // Amarillo
  { name: 'Oficinas', value: 20, color: '#3b82f6' },     // Azul
  { name: 'Comedores', value: 10, color: '#22c55e' },    // Verde
  { name: 'Auditorios', value: 10, color: '#a855f7' },   // Morado
];

const DistributionDonut = () => {
  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-center relative">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 w-full text-left px-4">
        Distribución por Sector
      </h3>

      <div className="w-full h-[200px] relative min-w-[200px] min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Texto Central */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="block text-2xl font-bold text-white">100%</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">TOTAL</span>
          </div>
        </div>
      </div>

      {/* Leyenda Personalizada */}
      <div className="w-full px-4 mt-2 grid grid-cols-2 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionDonut;
