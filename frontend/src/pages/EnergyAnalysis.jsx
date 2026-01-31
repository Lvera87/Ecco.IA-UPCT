import React, { useState } from 'react';
import { BarChart3, Download, Clock, DollarSign, Lightbulb, Target, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import InsightCard from '../components/ui/InsightCard';
import GoalsModal from '../components/ui/GoalsModal';
import { useUser } from '../context/UserContext';
import { useEnergy } from '../context/EnergyContext';
import { useUI } from '../context/UIContext';

// Nuevas Gráficas Importadas
import WaterSplitChart from '../components/dashboard/WaterSplitChart';
import ConsumptionOccupancyChart from '../components/dashboard/ConsumptionOccupancyChart';
import WeeklyProfileChart from '../components/dashboard/WeeklyProfileChart';

const EnergyAnalysis = () => {
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const { userProfile } = useUser();
  const { dashboardInsights } = useEnergy();
  const { addNotification } = useUI();

  const handleExport = () => {
    addNotification({
      type: 'success',
      title: 'Reporte Generado',
      message: `El análisis de ${userProfile.config?.campus_name || 'Sede'} se está descargando.`
    });
  };

  // Insights (Mock o reales)
  const insights = [
    {
      icon: Users,
      title: 'Eficiencia de Ocupación',
      description: 'Los salones muestran un pico de consumo a las 14:00 con solo 30% de ocupación.',
      action: 'Ajustar Climatización'
    },
    {
      icon: Clock,
      title: 'Anomalías Horarias',
      description: 'Se detectó consumo de agua inusual el Martes a las 03:00 AM.',
      action: 'Revisar Fugas'
    },
    {
      icon: Target,
      title: 'Meta Hídrica',
      description: 'El consumo de agua está un 12% por encima de la meta de sostenibilidad.',
      action: 'Ver Objetivos'
    }
  ];

  return (
    <div className="min-h-screen bg-[#02040a] p-4 md:p-8 pt-6 text-slate-200">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <BarChart3 className="text-uptc-gold" size={32} />
              Análisis Energético Avanzado
            </h1>
            <p className="text-slate-400">
              Monitoreo profundo de recursos y patrones de consumo para {userProfile.config?.campus_name || 'Campus UPTC'}.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={Download}
            className="border-uptc-gold text-uptc-gold hover:bg-uptc-gold hover:text-black font-bold uppercase tracking-wider"
            onClick={handleExport}
          >
            Exportar Reporte
          </Button>
        </div>

        {/* --- NUEVO LAYOUT DE GRÁFICAS --- */}
        
        {/* Fila Superior: Agua y Ocupación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[400px]">
            {/* Gráfica 2: Agua (Arriba Izquierda) */}
            <div className="h-[400px] lg:h-full">
                <WaterSplitChart />
            </div>
            
            {/* Gráfica 3: Ocupación (Arriba Derecha) */}
            <div className="h-[400px] lg:h-full">
                <ConsumptionOccupancyChart />
            </div>
        </div>

        {/* Fila Inferior: Perfil Semanal */}
        <div className="h-[400px] w-full">
            {/* Gráfica 4: Perfil Semanal (Abajo) */}
            <WeeklyProfileChart />
        </div>

        {/* Insights Section */}
        <div className="space-y-6 pt-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Lightbulb className="text-uptc-gold" size={24} />
            Hallazgos del Modelo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <InsightCard
                key={idx}
                icon={insight.icon}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                onClick={() => insight.action === 'Ver Objetivos' ? setIsGoalsModalOpen(true) : null}
              />
            ))}
          </div>
        </div>

        <GoalsModal
          isOpen={isGoalsModalOpen}
          onClose={() => setIsGoalsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default EnergyAnalysis;
