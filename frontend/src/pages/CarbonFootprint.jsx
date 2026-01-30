import React from 'react';
import { Wind, TreePine, Car, Factory, ArrowRight, Leaf, CloudRain } from 'lucide-react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { useUser } from '../context/UserContext';
import { useEnergy } from '../context/EnergyContext';

const CarbonFootprint = () => {
  const { userProfile } = useUser();
  const { dashboardInsights } = useEnergy();
  
  const metrics = dashboardInsights?.metrics || {};
  const carbonTons = metrics.carbon_footprint_tons || 0;
  
  // Factores de conversión
  const treesNeeded = Math.ceil(carbonTons * 6); // ~6 árboles por tonelada al año
  const kmDriven = Math.round(carbonTons * 4000); // ~250g CO2/km

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <Wind className="text-slate-500" size={32} />
              Huella de Carbono Institucional
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Impacto ambiental de la operación del campus {userProfile.config?.campus_name}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Indicator */}
          <Card className="md:col-span-2 p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-none relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
                <CloudRain size={48} className="text-slate-300" />
              </div>
              <h2 className="text-6xl font-black text-white mb-2 tracking-tighter">
                {carbonTons} <span className="text-2xl font-bold text-slate-400">Ton CO₂e</span>
              </h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Emisiones estimadas mensuales basadas en el consumo eléctrico de la red.
              </p>
            </div>
          </Card>

          {/* Equivalencies */}
          <div className="space-y-6">
            <Card className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <TreePine size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Compensación</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{treesNeeded} Árboles</p>
                  <p className="text-xs text-slate-500">Necesarios para absorber esta huella.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300">
                  <Car size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Equivalente</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{kmDriven.toLocaleString()} km</p>
                  <p className="text-xs text-slate-500">Recorridos por un vehículo a gasolina.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Factory size={24} className="text-blue-500" />
              Fuentes de Emisión (Sede)
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Red Eléctrica (Alcance 2)', val: 85, color: 'bg-blue-500' },
                { name: 'Generadores Diesel (Alcance 1)', val: 10, color: 'bg-slate-500' },
                { name: 'Fugas Refrigerantes', val: 5, color: 'bg-red-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                    <span>{item.name}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
            <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-4">Estrategia de Descarbonización</h3>
            <p className="text-blue-700 dark:text-blue-200 mb-6 text-sm leading-relaxed">
              La UPTC puede reducir su huella en un 20% implementando control automático de iluminación en aulas vacías y optimizando los horarios de climatización del auditorio.
            </p>
            <button className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Ver Plan de Sostenibilidad <ArrowRight size={16} />
            </button>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default CarbonFootprint;