import React, { useState } from 'react';
import { X, Building2, Zap, Server, Wind, Lightbulb } from 'lucide-react';
import { useEnergy } from '../../context/EnergyContext';

const AddAssetModal = ({ isOpen, onClose }) => {
    const { addAsset } = useEnergy();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        asset_type: 'lighting',
        location_detail: '',
        avg_daily_kwh: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await addAsset({
            ...formData,
            avg_daily_kwh: parseFloat(formData.avg_daily_kwh)
        });
        setLoading(false);
        onClose();
        // Reset form
        setFormData({ name: '', asset_type: 'lighting', location_detail: '', avg_daily_kwh: '' });
    };

    const assetTypes = [
        { id: 'lighting', name: 'Iluminación', icon: Lightbulb },
        { id: 'hvac', name: 'Climatización', icon: Wind },
        { id: 'it_equipment', name: 'Servidores/IT', icon: Server },
        { id: 'laboratory', name: 'Laboratorio', icon: Zap },
        { id: 'building', name: 'Bloque Completo', icon: Building2 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Registrar Activo Institucional</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Nombre del Activo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej. Iluminación Pasillos Bloque B"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Tipo</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={formData.asset_type}
                                    onChange={e => setFormData({...formData, asset_type: e.target.value})}
                                >
                                    {assetTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Consumo Diario (kWh)</label>
                            <input 
                                required
                                type="number" 
                                step="0.1"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.0"
                                value={formData.avg_daily_kwh}
                                onChange={e => setFormData({...formData, avg_daily_kwh: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Ubicación (Sede/Bloque)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej. Sede Central - Edificio Administrativo"
                            value={formData.location_detail}
                            onChange={e => setFormData({...formData, location_detail: e.target.value})}
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2"
                        >
                            {loading ? 'Guardando...' : <><Plus size={20} /> Registrar Activo</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssetModal;
