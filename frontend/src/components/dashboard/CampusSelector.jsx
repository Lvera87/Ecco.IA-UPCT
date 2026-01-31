import React, { useState } from 'react';
import { ChevronDown, Check, Building2 } from 'lucide-react';
import { useEnergy } from '../../context/EnergyContext';

const CampusSelector = () => {
    const { campuses, selectedCampusId, selectCampus } = useEnergy();
    const [isOpen, setIsOpen] = useState(false);

    const selectedCampus = campuses.find(c => c.id === selectedCampusId);

    const handleSelect = (id) => {
        selectCampus(id);
        setIsOpen(false);
    };

    if (campuses.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-uptc-gold transition-colors group"
            >
                <div className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:text-uptc-gold transition-colors">
                    <Building2 size={16} />
                </div>
                <div className="text-left">
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Sede Seleccionada</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">
                        {selectedCampus ? selectedCampus.name : 'Seleccionar Sede'}
                    </p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2">
                        {campuses.map(campus => (
                            <button
                                key={campus.id}
                                onClick={() => handleSelect(campus.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedCampusId === campus.id
                                    ? 'bg-uptc-gold/10 text-uptc-gold font-bold'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Building2 size={14} className={selectedCampusId === campus.id ? 'opacity-100' : 'opacity-50'} />
                                    {campus.name}
                                </span>
                                {selectedCampusId === campus.id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            )}
        </div>
    );
};

export default CampusSelector;
