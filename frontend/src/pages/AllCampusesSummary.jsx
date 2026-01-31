import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, MapPin, Ruler, Briefcase, 
  Thermometer, Mountain, Zap, Leaf, Activity, ArrowRight 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AllCampusesSummary = () => {
  const navigate = useNavigate();

  const campuses = [
    {
      id: '1',
      name: 'Sede Tunja',
      city: 'Tunja',
      students: 18000,
      employees: 1200,
      area: 120000,
      buildings: 25,
      temp: 13,
      altitude: 2810,
      consumption: 25000,
      carbon: 12.5,
      status: 'normal'
    },
    {
      id: '2',
      name: 'Sede Duitama',
      city: 'Duitama',
      students: 5500,
      employees: 350,
      area: 45000,
      buildings: 10,
      temp: 15,
      altitude: 2590,
      consumption: 8000,
      carbon: 4.2,
      status: 'efficient'
    },
    {
      id: '3',
      name: 'Sede Sogamoso',
      city: 'Sogamoso',
      students: 6000,
      employees: 400,
      area: 50000,
      buildings: 12,
      temp: 14,
      altitude: 2569,
      consumption: 9500,
      carbon: 5.1,
      status: 'inefficient'
    },
    {
      id: '4',
      name: 'Sede Chiquinquirá',
      city: 'Chiquinquirá',
      students: 2000,
      employees: 150,
      area: 18000,
      buildings: 6,
      temp: 12,
      altitude: 2556,
      consumption: 3000,
      carbon: 1.5,
      status: 'efficient'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'efficient': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'inefficient': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'efficient': return 'Eficiente';
      case 'inefficient': return 'Ineficiente';
      default: return 'Normal';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-body">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Resumen de Sedes UPTC
            </h1>
            <p className="text-slate-500 mt-1">
              Monitoreo y métricas consolidadas de infraestructura
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Volver al Dashboard
          </Button>
        </div>

        {/* Grid de Sedes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campuses.map((campus) => (
            <Card 
              key={campus.id} 
              className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-300 group"
            >
              <div className="p-6 space-y-6">
                
                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {campus.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin size={14} />
                        {campus.city}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(campus.status)}`}>
                    {getStatusLabel(campus.status)}
                  </div>
                </div>

                {/* Métricas Principales */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Users size={16} /> Estudiantes
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {new Intl.NumberFormat().format(campus.students)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Briefcase size={16} /> Empleados
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {new Intl.NumberFormat().format(campus.employees)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Ruler size={16} /> Área Total
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {new Intl.NumberFormat().format(campus.area)} m²
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Building2 size={16} /> Edificios
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {campus.buildings}
                    </p>
                  </div>
                </div>

                {/* Datos Ambientales */}
                <div className="flex gap-6 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-400" />
                    <span>{campus.temp}°C Prom.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mountain size={16} className="text-slate-400" />
                    <span>{campus.altitude} msnm</span>
                  </div>
                </div>

                {/* Indicadores de Impacto */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Impacto Estimado (Mes)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <Zap size={16} className="text-yellow-500" />
                        <span className="text-xs text-slate-500">Estimado</span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat().format(campus.consumption)} kWh
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <Leaf size={16} className="text-green-500" />
                        <span className="text-xs text-slate-500">Huella</span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {campus.carbon} Ton CO₂
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <Button 
                  onClick={() => navigate(`/campus/${campus.id}`)}
                  className="w-full mt-2 group-hover:bg-emerald-600 transition-colors"
                  variant="primary"
                >
                  Ver Detalles <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCampusesSummary;
