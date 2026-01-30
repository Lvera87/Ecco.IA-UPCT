import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from './Card';

const InsightCard = ({ icon: Icon, title, description, action, onClick, color = "amber", className = "" }) => {
    const colorClasses = {
        amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
        emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    };

    return (
        <Card
            className={`p-5 hover:border-emerald-500/50 transition-all cursor-pointer group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${className}`}
            onClick={onClick}
        >
            <div className="flex items-start gap-4">
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${colorClasses[color]}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1 group-hover:text-emerald-500 transition-colors">
                        {title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{description}</p>
                    {action && (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-tighter">
                            {action} <ChevronRight size={14} />
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default InsightCard;
