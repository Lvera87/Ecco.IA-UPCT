import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const EmptyState = ({
    title = "No hay datos disponibles",
    description = "Aún no hemos recolectado suficiente información para generar este análisis.",
    actionText,
    onAction,
    icon: Icon = AlertCircle
}) => {
    return (
        <Card className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800">
            <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
                <Icon size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                {description}
            </p>
            {actionText && (
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={onAction}
                    className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                    {actionText}
                </Button>
            )}
        </Card>
    );
};

export default EmptyState;
