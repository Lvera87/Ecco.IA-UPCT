import React, { useState, useEffect } from 'react';
import {
    Server, Zap, Building2, Search, Plus, Filter, Trash2, 
    Lightbulb, Wind, AlertCircle, BarChart3
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import AddAssetModal from '../components/ui/AddAssetModal';
import { useEnergy } from '../context/EnergyContext';

const EnergyManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Contexto de Energía (Infraestructura)
    const { assets, syncEnergyData } = useEnergy();

    useEffect(() => {
        syncEnergyData();
    }, []);

    // Filtrado de activos
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filter === 'all' || 
                              (filter === 'active' && asset.status) || 
                              (filter === 'critical' && asset.asset_type === 'it_equipment');
        return matchesSearch && matchesFilter;
    });

    const formatKwh = (val) => `${val?.toFixed(1)} kWh`;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <Server className="text-uptc-gold" size={32} />
                            Gestión de Activos UPTC
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Inventario de equipos, iluminación y sistemas de climatización por sede.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-uptc-gold hover:bg-yellow-500 text-black font-bold px-6 shadow-lg shadow-yellow-500/20"
                        icon={Plus}
                    >
                        Nuevo Activo
                    </Button>
                </div>

                {/* Tabla de Activos */}
                <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    {/* Barra de Herramientas */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o bloque..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-uptc-gold/50 dark:text-white outline-none placeholder:text-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            {[{ id: 'all', label: 'Todos' }, { id: 'active', label: 'Activos' }, { id: 'critical', label: 'Críticos' }].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setFilter(opt.id)}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-widest ${filter === opt.id ? 'bg-white dark:bg-slate-700 text-uptc-gold shadow-sm' : 'text-slate-500'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista */}
                    {filteredAssets.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activo Institucional</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Consumo Diario</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((asset) => (
                                        <tr key={asset.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-lg flex items-center justify-center bg-uptc-gold/10 text-uptc-gold">
                                                        {asset.asset_type === 'lighting' ? <Lightbulb size={20} /> :
                                                         asset.asset_type === 'hvac' ? <Wind size={20} /> :
                                                         <Server size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{asset.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{asset.asset_type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">
                                                {asset.location || 'Sede Central'}
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono font-bold text-slate-800 dark:text-white">
                                                {formatKwh(asset.consumption)}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${asset.status ? 'bg-uptc-black text-uptc-gold' : 'bg-slate-200 text-slate-500'}`}>
                                                    {asset.status ? 'Operativo' : 'Inactivo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 flex justify-center">
                            <EmptyState 
                                title="No hay activos registrados" 
                                description="Comienza digitalizando la infraestructura de la sede."
                                actionText="Registrar Primer Activo"
                                onAction={() => setIsAddModalOpen(true)}
                            />
                        </div>
                    )}
                </Card>

                <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            </div>
        </div>
    );
};

export default EnergyManagement;
