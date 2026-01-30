import React from 'react';
import { Sparkles, X, ArrowRight, Building2 } from 'lucide-react';

const InfrastructureAlert = ({ insight, onClose }) => {
  if (!insight) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-uptc-black to-slate-900 shadow-xl shadow-black/30 mb-8 border-l-4 border-uptc-gold animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-uptc-gold/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 p-1">
        <div className="rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex size-12 rounded-lg bg-uptc-gold/10 border border-uptc-gold/20 items-center justify-center shadow-lg shrink-0 text-uptc-gold">
              <Building2 size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-uptc-gold text-black border border-uptc-gold">
                  <Sparkles size={10} />
                  Reporte UPTC
                </span>
                <span className="text-xs text-slate-400 font-medium">Justo ahora</span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                Análisis de Infraestructura
              </h3>
              
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                {insight.ai_advice || insight.recommendation_highlight || "Se ha detectado un patrón de consumo irregular en el bloque administrativo fuera del horario laboral."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button 
                  onClick={onClose}
                  className="text-xs font-bold text-uptc-gold hover:text-white border border-uptc-gold/30 hover:bg-uptc-gold/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  Ver Reporte Detallado <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureAlert;
