/**
 * AdvancedAnalyticsPanel - Panel de Análisis Avanzado
 * Objetivos 2, 3, 4: Anomalías, Recomendaciones por Sector, XAI
 */
import React, { useState, useEffect } from 'react';
import {
    AlertTriangle, TrendingUp, Clock, Lightbulb,
    ChevronDown, ChevronUp, Activity, Zap,
    ThermometerSun, Users, Building, Brain,
    CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import { analyticsApi } from '../api/analytics';

const COLORS = {
    critical: '#ef4444',
    warning: '#f59e0b',
    normal: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6'
};

// --- Subcomponentes ---

const SectionHeader = ({ icon: Icon, title, badge, badgeColor = 'blue' }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
            <Icon size={20} className={`text-${badgeColor}-500`} />
            {title}
        </h3>
        {badge && (
            <span className={`px-2 py-1 rounded text-xs font-bold bg-${badgeColor}-500/20 text-${badgeColor}-400 border border-${badgeColor}-500/30`}>
                {badge}
            </span>
        )}
    </div>
);

const SectorEfficiencyCard = ({ sector }) => {
    const statusColors = {
        'crítico': 'red',
        'alerta': 'amber',
        'normal': 'emerald'
    };
    const color = statusColors[sector.status] || 'slate';

    return (
        <div className={`p-4 rounded-lg bg-${color}-500/5 border border-${color}-500/20 hover:border-${color}-500/40 transition-all`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-white text-sm">{sector.name}</h4>
                    <span className="text-xs text-slate-500 capitalize">{sector.type}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-${color}-500/20 text-${color}-400`}>
                    {sector.status}
                </span>
            </div>

            <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Consumo/m²</span>
                    <span className="text-white font-mono">{sector.consumption_per_sqm?.toFixed(3)} kWh</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Desviación</span>
                    <span className={`font-mono ${sector.deviation_percent > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {sector.deviation_percent > 0 ? '+' : ''}{sector.deviation_percent?.toFixed(0)}%
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Eficiencia</span>
                    <span className="text-white font-mono">{sector.efficiency_score?.toFixed(0)}%</span>
                </div>
            </div>

            {/* Barra de eficiencia visual */}
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-${color}-500 transition-all duration-500`}
                    style={{ width: `${Math.min(sector.efficiency_score, 100)}%` }}
                />
            </div>
        </div>
    );
};

const AnomalyItem = ({ anomaly }) => {
    const isHigh = anomaly.type === 'pico_alto';
    const color = anomaly.severity === 'critical' ? 'red' : 'amber';

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-${color}-500/5 border border-${color}-500/20`}>
            <div className={`p-2 rounded-lg bg-${color}-500/10`}>
                {isHigh ? <TrendingUp size={16} className={`text-${color}-400`} /> : <Activity size={16} className={`text-${color}-400`} />}
            </div>
            <div className="flex-1">
                <p className="text-sm text-white font-medium">
                    {isHigh ? 'Pico de consumo' : 'Consumo anormalmente bajo'}
                </p>
                <p className="text-xs text-slate-400">
                    {anomaly.deviation_percent > 0 ? '+' : ''}{anomaly.deviation_percent}% del promedio
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-mono text-white">{anomaly.value?.toFixed(0)} kWh</p>
                <p className="text-[10px] text-slate-500">Z={anomaly.z_score}</p>
            </div>
        </div>
    );
};

const RecommendationCard = ({ recommendation, index }) => {
    const [expanded, setExpanded] = useState(false);
    const priorityColors = {
        'high': 'red',
        'alta': 'red',
        'medium': 'amber',
        'media': 'amber',
        'low': 'emerald',
        'baja': 'emerald'
    };
    const color = priorityColors[recommendation.priority?.toLowerCase()] || 'blue';

    return (
        <div
            className={`p-4 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-${color}-500/30 transition-all cursor-pointer`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${color}-500/10 mt-0.5`}>
                    <Lightbulb size={16} className={`text-${color}-400`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-${color}-500/20 text-${color}-400`}>
                            {recommendation.priority}
                        </span>
                        {recommendation.sector && (
                            <span className="text-xs text-slate-500">{recommendation.sector}</span>
                        )}
                    </div>
                    <p className="text-sm text-white">{recommendation.message || recommendation.action}</p>

                    {expanded && recommendation.explanation && (
                        <div className="mt-3 p-3 rounded bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">¿Por qué esta recomendación?</p>
                            <p className="text-xs text-slate-300">{recommendation.explanation.why}</p>
                            <p className="text-[10px] text-slate-500 mt-2">
                                Basado en: {recommendation.explanation.based_on}
                            </p>
                        </div>
                    )}
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>
        </div>
    );
};

const XAIExplanationPanel = ({ explanation }) => {
    if (!explanation) return null;

    const topFactors = explanation.top_factors || [];

    return (
        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/20 to-slate-900 border border-purple-500/20">
            <SectionHeader icon={Brain} title="Explicabilidad del Modelo (XAI)" badge={explanation.method} badgeColor="purple" />

            <div className="mb-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="text-sm text-slate-300">{explanation.summary}</p>
            </div>

            <p className="text-xs text-slate-500 mb-3">Factores principales que influyen en la predicción:</p>

            <div className="space-y-2">
                {topFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-slate-800/30">
                        <div className={`w-2 h-2 rounded-full ${factor.direction === 'aumenta' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <div className="flex-1">
                            <p className="text-xs text-white font-medium">{factor.description}</p>
                            <p className="text-[10px] text-slate-500">{factor.interpretation}</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs font-mono ${factor.direction === 'aumenta' ? 'text-red-400' : 'text-emerald-400'}`}>
                                {factor.direction === 'aumenta' ? '↑' : '↓'} {Math.abs(factor.shap_value).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-500">Valor: {factor.input_value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-slate-600 mt-4 italic">
                Método: {explanation.method} | Confianza: {explanation.confidence}
            </p>
        </div>
    );
};

// --- Componente Principal ---

const AdvancedAnalyticsPanel = ({ campusId, campusName }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sectors');

    const [sectorAnalysis, setSectorAnalysis] = useState(null);
    const [anomalies, setAnomalies] = useState(null);
    const [peakHours, setPeakHours] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [xaiExplanation, setXaiExplanation] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!campusId) return;
            setLoading(true);

            try {
                const [sectors, anomalyData, peaks, recs, xai] = await Promise.all([
                    analyticsApi.getSectorAnalysis(campusId).catch(() => null),
                    analyticsApi.getAnomalies(campusId, 30).catch(() => null),
                    analyticsApi.getPeakHours(campusId, 7).catch(() => null),
                    analyticsApi.getRecommendations(campusId).catch(() => null),
                    analyticsApi.getPredictionExplanation(campusId).catch(() => null)
                ]);

                setSectorAnalysis(sectors);
                setAnomalies(anomalyData);
                setPeakHours(peaks);
                setRecommendations(recs);
                setXaiExplanation(xai);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campusId]);

    const tabs = [
        { id: 'sectors', label: 'Sectores', icon: Building },
        { id: 'anomalies', label: 'Anomalías', icon: AlertTriangle },
        { id: 'peaks', label: 'Horas Pico', icon: Clock },
        { id: 'recommendations', label: 'Recomendaciones', icon: Lightbulb },
        { id: 'xai', label: 'XAI', icon: Brain }
    ];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center text-blue-500">
                <Activity size={24} className="animate-spin mr-3" />
                <span className="font-mono text-sm">Analizando datos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'sectors' && sectorAnalysis && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white font-bold">Eficiencia por Sector</h3>
                            <p className="text-sm text-slate-500">
                                {sectorAnalysis.analysis?.inefficiency_count || 0} sectores con ineficiencias detectadas
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sectorAnalysis.analysis?.sectors?.map((sector, i) => (
                            <SectorEfficiencyCard key={i} sector={sector} />
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'anomalies' && anomalies && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white font-bold">Anomalías Detectadas</h3>
                            <p className="text-sm text-slate-500">
                                Últimos 30 días | {anomalies.anomalies?.stats?.anomaly_count || 0} eventos anómalos
                            </p>
                        </div>
                    </div>

                    {anomalies.off_hours_usage?.waste_percent > 0 && (
                        <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-amber-400 font-medium text-sm">
                                ⚠️ {anomalies.off_hours_usage.waste_percent}% del consumo ocurre fuera de horario operativo
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Consumo fuera de horario: {anomalies.off_hours_usage.total_off_hours_consumption?.toFixed(0)} kWh
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        {anomalies.anomalies?.anomalies?.slice(0, 5).map((anomaly, i) => (
                            <AnomalyItem key={i} anomaly={anomaly} />
                        ))}
                        {(!anomalies.anomalies?.anomalies || anomalies.anomalies.anomalies.length === 0) && (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                                <p>No se detectaron anomalías significativas</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'peaks' && peakHours && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white font-bold">Horarios Críticos</h3>
                            <p className="text-sm text-slate-500">
                                Consumo promedio horario: {peakHours.peak_hours?.average_hourly?.toFixed(0)} kWh
                            </p>
                        </div>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakHours.peak_hours?.distribution || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    tickFormatter={(h) => `${h}:00`}
                                />
                                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                                    labelFormatter={(h) => `${h}:00`}
                                />
                                <Bar dataKey="consumption" name="Consumo (kWh)">
                                    {(peakHours.peak_hours?.distribution || []).map((entry, index) => {
                                        const isPeak = peakHours.peak_hours?.peak_hours?.some(p => p.hour === entry.hour);
                                        return <Cell key={index} fill={isPeak ? COLORS.warning : COLORS.blue} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {peakHours.peak_hours?.peak_hours?.map((peak, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                                {peak.hour}:00 (+{peak.over_average_percent}%)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'recommendations' && recommendations && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white font-bold">Recomendaciones por Sector</h3>
                            <p className="text-sm text-slate-500">
                                Acciones concretas basadas en el análisis
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recommendations.sector_recommendations?.map((rec, i) => (
                            <RecommendationCard key={i} recommendation={rec} index={i} />
                        ))}
                        {(!recommendations.sector_recommendations || recommendations.sector_recommendations.length === 0) && (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                                <p>Todos los sectores operan dentro de parámetros normales</p>
                            </div>
                        )}
                    </div>

                    {recommendations.ai_insights && (
                        <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <p className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-2">
                                <Brain size={14} /> Análisis IA
                            </p>
                            <p className="text-sm text-slate-300">
                                {recommendations.ai_insights.ai_advice || recommendations.ai_insights.top_waste_reason}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'xai' && (
                <XAIExplanationPanel explanation={xaiExplanation?.explanation} />
            )}
        </div>
    );
};

export default AdvancedAnalyticsPanel;
