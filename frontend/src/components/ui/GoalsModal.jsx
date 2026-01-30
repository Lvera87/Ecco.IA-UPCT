import React, { useState } from 'react';
import { X, Target, DollarSign, Leaf, Gauge, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from './Button';

const GoalsModal = ({ isOpen, onClose }) => {
    const { goals, updateGoals } = useApp();

    const [localGoals, setLocalGoals] = useState(goals);

    const handleSave = () => {
        updateGoals(localGoals);
        onClose();
    };

    const handleChange = (key, value) => {
        setLocalGoals(prev => ({ ...prev, [key]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Target size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Configurar Metas</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Define tus objetivos de ahorro</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Monthly Budget */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">Presupuesto Mensual</p>
                                <p className="text-xs text-slate-500">Límite de gasto en electricidad</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400">$</span>
                            <input
                                type="number"
                                value={localGoals.monthlyBudget}
                                onChange={(e) => handleChange('monthlyBudget', Number(e.target.value))}
                                className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary py-3 text-lg font-bold"
                            />
                            <span className="text-slate-400">COP</span>
                        </div>
                    </div>

                    {/* Savings Target */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                                    <Gauge size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">Meta de Ahorro</p>
                                    <p className="text-xs text-slate-500">Porcentaje a reducir vs mes anterior</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-emerald-500">{localGoals.savingsTarget}%</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={localGoals.savingsTarget}
                            onChange={(e) => handleChange('savingsTarget', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                            <span>5% (Conservador)</span>
                            <span>50% (Ambicioso)</span>
                        </div>
                    </div>

                    {/* CO2 Reduction */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-500">
                                    <Leaf size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">Reducción de CO₂</p>
                                    <p className="text-xs text-slate-500">Meta de huella de carbono</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-teal-500">{localGoals.co2Reduction}%</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="40"
                            value={localGoals.co2Reduction}
                            onChange={(e) => handleChange('co2Reduction', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                    </div>

                    {/* Efficiency Score */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">Score de Eficiencia</p>
                                    <p className="text-xs text-slate-500">Puntuación objetivo</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-amber-500">{localGoals.efficiencyScore}</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            value={localGoals.efficiencyScore}
                            onChange={(e) => handleChange('efficiencyScore', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                            <span>50 (Básico)</span>
                            <span>100 (Excelente)</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave} icon={Save}>
                        Guardar metas
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GoalsModal;
