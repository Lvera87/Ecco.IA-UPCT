import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Gauge, Wallet, Leaf, Award, Lightbulb,
  Thermometer, Plug, LayoutDashboard, Share2, Zap,
  TrendingUp, ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import StatCardShared from '../components/ui/StatCard';


// Quick Tip Card Component  
const QuickTipCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
    <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
      <Icon size={16} />
      {title}
    </h4>
    <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">
      {description}
    </p>
  </div>
);

const ResultsDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const {
    efficiencyScore, projectedBill, co2Footprint,
    formatMoney
  } = useEnergyMath();

  const stats = [
    {
      icon: Gauge,
      title: 'Puntaje de Eficiencia',
      value: efficiencyScore || '84',
      unit: '/100',
      badge: '+12% vs mes ant.',
      badgeColor: 'green'
    },
    {
      icon: Wallet,
      title: 'Ahorro Potencial',
      value: '$420',
      unit: 'USD',
      badge: 'Est.',
      badgeColor: 'slate'
    },
    {
      icon: Leaf,
      title: 'Huella de CO2',
      value: Math.round(co2Footprint).toLocaleString(),
      unit: 'kg',
      badge: '-2.4t',
      badgeColor: 'green'
    },
    {
      icon: Award,
      title: 'Rango Eco',
      value: 'Oro',
      badge: 'Top 5%',
      badgeColor: 'amber'
    },
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: 'Iluminación',
      description: 'Cambiar a LED puede ahorrarte un 15% en tu factura eléctrica inmediatamente.'
    },
    {
      icon: Thermometer,
      title: 'Climatización',
      description: 'Mantener el termostato a 24°C en verano reduce el consumo un 7% por cada grado.'
    },
    {
      icon: Plug,
      title: 'Carga Fantasma',
      description: 'Desconecta dispositivos que no uses para evitar el consumo "vampiro" de energía.'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100">
      {/* Success Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{
        background: `radial-gradient(circle at top right, rgba(0, 194, 204, 0.1), transparent),
                     radial-gradient(circle at bottom left, rgba(0, 119, 182, 0.05), transparent)`
      }} />

      <main className="relative z-10 pt-8 pb-20 px-6 lg:px-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Success Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-500 animate-pulse">
              <CheckCircle size={48} />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              ¡Análisis completado!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xl font-medium">
              Tu viaje eco comienza aquí.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => (
              <StatCardShared key={idx} {...stat} color={stat.icon === Gauge ? 'primary' : stat.icon === Wallet ? 'emerald' : stat.icon === Leaf ? 'purple' : 'amber'} />
            ))}
          </div>

          {/* Quick Tips Section */}
          <div className="bg-slate-900 dark:bg-slate-800/50 rounded-3xl p-8 lg:p-12 mb-12 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  <Lightbulb size={24} />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">Consejos Rápidos</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tips.map((tip, idx) => (
                  <QuickTipCard key={idx} {...tip} />
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Energy Distribution */}
            <Card className="p-8">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Zap className="text-primary" size={24} />
                Distribución de Consumo
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Climatización', percentage: 45, color: 'bg-primary' },
                  { name: 'Electrodomésticos', percentage: 30, color: 'bg-blue-500' },
                  { name: 'Iluminación', percentage: 15, color: 'bg-amber-500' },
                  { name: 'Otros', percentage: 10, color: 'bg-slate-400' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-black text-slate-900 dark:text-white">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-8">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={24} />
                Recomendaciones
              </h3>
              <div className="space-y-4">
                {[
                  { priority: 'Alta', title: 'Optimizar horario del aire acondicionado', savings: '$85/año' },
                  { priority: 'Media', title: 'Reemplazar bombillas incandescentes', savings: '$45/año' },
                  { priority: 'Baja', title: 'Desconectar standby de electrónicos', savings: '$30/año' },
                ].map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded
                        ${rec.priority === 'Alta' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                          rec.priority === 'Media' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
                        Prioridad {rec.priority}
                      </span>
                      <span className="text-sm font-black text-emerald-500">{rec.savings}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors flex items-center gap-2">
                      {rec.title}
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              size="lg"
              icon={LayoutDashboard}
              className="w-full sm:w-auto shadow-lg shadow-primary/20"
            >
              Ir al Panel Principal
            </Button>
            <Button
              variant="ghost"
              size="lg"
              icon={Share2}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              Compartir mi impacto
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsDashboard;
