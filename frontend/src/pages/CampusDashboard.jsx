import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Zap, Droplets, ArrowLeft, Activity, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
// import { campusApi } from '../api/campus'; // Pending creation

const CampusDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [campus, setCampus] = useState(null);
    const [infrastructure, setInfrastructure] = useState([]);

    // Datos Mock (Actualizados según datos.md)
    useEffect(() => {
        const campusData = {
            '1': { name: 'Sede Tunja', city: 'Tunja', students: 18000, baseline: 450.5, target: 400.0 },
            '2': { name: 'Sede Duitama', city: 'Duitama', students: 5500, baseline: 180.2, target: 160.0 },
            '3': { name: 'Sede Sogamoso', city: 'Sogamoso', students: 6000, baseline: 210.5, target: 195.0 },
            '4': { name: 'Sede Chiquinquirá', city: 'Chiquinquirá', students: 2000, baseline: 85.0, target: 75.0 }
        };

        const selected = campusData[id] || campusData['1'];

        setTimeout(() => {
            setCampus({
                id: id,
                ...selected
            });
            setInfrastructure([
                { id: 1, name: 'Bloque Administrativo', type: 'Oficinas', consumption: 120.5, status: 'optimal' },
                { id: 2, name: 'Laboratorios de Ciencias', type: 'Laboratorios', consumption: 330.0, status: 'high' },
                { id: 3, name: 'Restaurante Universitario', type: 'Comedores', consumption: 85.2, status: 'optimal' },
                { id: 4, name: 'Aulas Maestras', type: 'Salones', consumption: 150.8, status: 'optimal' },
                { id: 5, name: 'Auditorio Paraninfo', type: 'Auditorios', consumption: 45.3, status: 'optimal' }
            ]);
            setLoading(false);
        }, 800);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
            <Activity className="animate-spin text-emerald-500 mr-2" /> Cargando datos de la sede...
        </div>
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen font-body text-slate-200">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft size={20} /> Volver al Global
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                            <Building2 className="text-emerald-400" />
                            {campus.name}
                        </h1>
                        <p className="text-slate-500">Gestión de recursos y monitoreo en tiempo real</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Zap size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Consumo Hoy</p>
                                <p className="text-xl font-bold text-white">{campus.baseline} kWh</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Consumption Chart Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800 p-6 min-h-[300px]">
                        <h3 className="font-bold text-white mb-4">Curva de Demanda Horaria</h3>
                        <div className="flex items-center justify-center h-full text-slate-500">
                            [Gráfico de Consumo Aquí]
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {infrastructure.map(unit => (
                            <Card key={unit.id} className="bg-slate-900 border-slate-800 p-4 hover:border-emerald-500/30 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{unit.name}</h4>
                                    {unit.status === 'high' && <AlertTriangle size={16} className="text-amber-500" />}
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{unit.type}</span>
                                    <span className="font-mono font-bold text-emerald-400">{unit.consumption} kWh</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800 p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-emerald-500" /> Recomendaciones IA
                        </h3>
                        <ul className="space-y-4">
                            <li className="text-sm text-slate-300 p-3 bg-slate-800/50 rounded-lg border-l-2 border-emerald-500">
                                Detectamos consumo inusual en <strong>Laboratorios</strong> fuera de horario.
                            </li>
                            <li className="text-sm text-slate-300 p-3 bg-slate-800/50 rounded-lg border-l-2 border-blue-500">
                                Oportunidad de ahorro: Ajustar climatización en Edificio Admin (2°C menos).
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CampusDashboard;
