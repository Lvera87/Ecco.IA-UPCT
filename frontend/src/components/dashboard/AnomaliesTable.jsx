import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import Card from '../ui/Card';

const AnomaliesTable = ({ events }) => {

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case 'critical': return 'Crítica';
            case 'medium': return 'Media';
            default: return 'Leve';
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" /> Historial de Eventos
                </h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Últimos 7 días</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Fecha / Hora</th>
                            <th className="px-4 py-3">Ubicación</th>
                            <th className="px-4 py-3">Desviación</th>
                            <th className="px-4 py-3">Clasificación</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-slate-600 italic">
                                    No se han detectado anomalías recientes.
                                </td>
                            </tr>
                        ) : (
                            events.map((event, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-300 font-mono">
                                        {new Date(event.date).toLocaleDateString()} <span className="text-slate-500 text-xs">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-white">{event.location}</div>
                                        <div className="text-xs text-slate-500">{event.spaceType}</div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-white">
                                        +{event.deviation}%
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase border ${getSeverityStyles(event.severity)}`}>
                                            <span className={`size-1.5 rounded-full ${event.severity === 'critical' ? 'bg-red-500 animate-pulse' : event.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                                            {getSeverityLabel(event.severity)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default AnomaliesTable;
