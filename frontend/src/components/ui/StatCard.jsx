import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import Card from './Card';

const StatCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color = 'primary',
    trend,
    trendValue,
    tooltip,
    pulse = false,
    className = "",
    ...props
}) => {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };

    return (
        <Card
            className={`p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all duration-300 ${className}`}
            {...props}
        >
            <div className={`p-3 rounded-2xl border ${colorClasses[color]} shadow-sm shrink-0 ${pulse ? 'animate-pulse' : ''}`}>
                <Icon size={24} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{title}</span>
                    {trend && (
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend === 'down' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trendValue}%
                        </div>
                    )}
                </div>

                <div className="flex items-baseline gap-1.5 min-h-[1.5rem] mt-1">
                    {value && (
                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                            {value}
                        </span>
                    )}
                    {unit && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
                            {unit}
                        </span>
                    )}
                </div>
            </div>

            {tooltip && (
                <div className="group/tip relative ml-auto shrink-0">
                    <Info size={12} className="text-slate-300 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50">
                        {tooltip}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default StatCard;
