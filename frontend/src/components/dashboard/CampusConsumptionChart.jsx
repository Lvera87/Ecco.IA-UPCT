import React, { useState, useEffect, useRef } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Label
} from 'recharts';
import { Activity, TrendingUp, MapPin } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl ring-1 ring-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 border-b border-slate-800 pb-2">
                    {payload[0].payload.time}
                </p>
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-display font-bold text-uptc-gold leading-none">
                        {new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payload[0].value)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        Kilovatios/Hora (kWh)
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

/**
 * CampusConsumptionChart
 * Refactored to solve Recharts dimension issues and provide a premium UI.
 */
const CampusConsumptionChart = ({ data, title, subtitle }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 350 });
    const containerRef = useRef(null);

    useEffect(() => {
        const observeTarget = containerRef.current;
        if (!observeTarget) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                const calculatedWidth = width - 48; // Padding interno
                if (calculatedWidth > 0) {
                    setDimensions({ width: calculatedWidth, height: 350 });
                }
            }
        });

        resizeObserver.observe(observeTarget);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div
            className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden flex flex-col group animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
            {/* Header decorativo */}
            <div className="p-8 flex items-center justify-between bg-gradient-to-r from-transparent to-slate-50/50 dark:to-slate-800/20">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-uptc-gold rounded-2xl text-uptc-black shadow-lg shadow-uptc-gold/20">
                            <TrendingUp size={20} className="group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                {title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <MapPin size={12} className="text-uptc-gold" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sede Central Tunja · Bloques Operativos</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                        <span className="text-xs font-bold text-green-500">Óptimo</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-2xl text-[10px] font-black text-green-600 dark:text-green-400 tracking-tighter">
                        <Activity size={14} className="animate-pulse" />
                        EN VIVO
                    </div>
                </div>
            </div>

            {/* Chart Area con protección de dimensiones */}
            <div
                ref={containerRef}
                className="h-[380px] w-full relative px-6 pb-6 pt-2 flex items-center justify-center bg-white dark:bg-slate-900"
            >
                {dimensions.width > 0 ? (
                    <AreaChart
                        width={dimensions.width}
                        height={dimensions.height}
                        data={data}
                        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="uptcPremiumGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#006633" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#006633" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="0"
                            vertical={false}
                            stroke="#94a3b8"
                            opacity={0.05}
                        />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, opacity: 0.8 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, opacity: 0.8 }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#006633', strokeWidth: 2, strokeDasharray: '6 6' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#006633"
                            strokeWidth={4}
                            strokeLinecap="round"
                            fill="url(#uptcPremiumGradient)"
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="cubic-bezier(0.4, 0, 0.2, 1)"
                        />
                    </AreaChart>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 border-4 border-uptc-gold/20 border-t-uptc-gold rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estabilizando Lienzo...</span>
                    </div>
                )}
            </div>

            {/* Footer Premium */}
            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carga Actual</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Bajo Control</span>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Eficiencia de Red</span>
                        <span className="text-sm font-bold text-uptc-gold">98.4%</span>
                    </div>
                </div>

                <button className="px-6 py-2.5 bg-uptc-black dark:bg-slate-700 text-uptc-gold text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-uptc-gold hover:text-uptc-black transition-all duration-300 shadow-lg shadow-black/10">
                    Descargar Dataset .CSV
                </button>
            </div>
        </div>
    );
};

export default CampusConsumptionChart;
