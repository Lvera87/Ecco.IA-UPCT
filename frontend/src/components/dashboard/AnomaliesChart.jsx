import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Scatter, ComposedChart } from 'recharts';
import Card from '../ui/Card';
import { AlertTriangle } from 'lucide-react';

const AnomaliesChart = ({ data, baseline }) => {
    // Detect anomaly points
    const dataWithAnomalies = useMemo(() => {
        return data.map(point => ({
            ...point,
            isAnomaly: point.value > baseline * 1.2, // 20% over baseline
            anomalyValue: point.value > baseline * 1.2 ? point.value : null
        }));
    }, [data, baseline]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            const isAnomaly = val > baseline * 1.2;
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-slate-300 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-uptc-gold"></div>
                        <span className="text-white font-mono">{val} kWh</span>
                    </div>
                    {isAnomaly && (
                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1 text-red-500 font-bold">
                            <AlertTriangle size={12} />
                            Anomalía Detectada
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="bg-slate-900/50 border-slate-800 p-6 min-h-[350px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-white">Detección de Anomalías</h3>
                    <p className="text-xs text-slate-500">Comparativa Consumo vs Línea Base ({baseline} kWh)</p>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-1 bg-red-500 rounded-full"></span>
                        <span className="text-red-400">Anomalía</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-1 bg-emerald-500/30 rounded-full"></span>
                        <span className="text-emerald-400">Normal</span>
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dataWithAnomalies}>
                        <defs>
                            <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            unit=" kWh"
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />

                        {/* Baseline Line */}
                        <ReferenceLine y={baseline} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Línea Base', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} />

                        {/* Main Consumption Area */}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10B981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorNormal)"
                        />

                        {/* Anomaly Points Scatter */}
                        <Scatter name="Anomalías" dataKey="anomalyValue" fill="#EF4444" shape="circle" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default AnomaliesChart;
