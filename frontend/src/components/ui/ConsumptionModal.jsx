import React, { useState, useEffect } from 'react';
import { X, Save, Zap, Calendar, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const ConsumptionModal = ({ isOpen, onClose, currentGoal, lastReading, onSave }) => {
    const [reading, setReading] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [feedback, setFeedback] = useState(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setReading('');
            setFeedback(null);
        }
    }, [isOpen]);

    // Calcular feedback en tiempo real
    useEffect(() => {
        if (!reading || !currentGoal) return;

        const val = parseFloat(reading);
        // Simulación simple: Si la lectura proyectada supera la meta
        // En un caso real, esto calcularía delta vs lectura anterior
        const percentage = (val / currentGoal) * 100;

        if (percentage > 90) {
            setFeedback({ status: 'danger', msg: '¡Cuidado! Estás cerca del límite.', icon: AlertTriangle });
        } else if (percentage > 75) {
            setFeedback({ status: 'warning', msg: 'Vas consumiendo rápido este mes.', icon: TrendingUp });
        } else {
            setFeedback({ status: 'success', msg: '¡Excelente! Vas bajo control.', icon: CheckCircle2 });
        }

    }, [reading, currentGoal]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ reading: parseFloat(reading), date });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <Card className="w-full max-w-md bg-slate-900 border border-slate-700 relative shadow-2xl overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute top-0 left-0 w-full h-2 transition-colors duration-500
                    ${feedback?.status === 'danger' ? 'bg-red-500' :
                        feedback?.status === 'warning' ? 'bg-amber-500' :
                            feedback?.status === 'success' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Zap className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">Reportar Consumo</h2>
                            <p className="text-sm text-slate-400">¿Cuánta energía (kWh) consumiste hoy?</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    Fecha de Lectura
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    <span>Consumo del Día (kWh)</span>
                                    {lastReading && <span className="text-emerald-400">Ayer: {lastReading}</span>}
                                </label>
                                <div className="relative">
                                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        autoFocus
                                        value={reading}
                                        onChange={(e) => setReading(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Real-time Feedback Section */}
                        {feedback && (
                            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fadeIn
                                ${feedback.status === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                                    feedback.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
                                <feedback.icon size={20} className="shrink-0" />
                                <p className="text-sm font-medium">{feedback.msg}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-4">
                                <Save size={18} className="mr-2" />
                                Guardar Lectura
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default ConsumptionModal;
