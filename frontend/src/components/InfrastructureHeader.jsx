import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const InfrastructureHeader = () => {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const campusName = userProfile?.config?.campus_name || "Sede Central";

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-20 shadow-sm relative">
      {/* Search Bar - Estilo Institucional */}
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-uptc-gold transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar activo, bloque o reporte..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-transparent focus:border-uptc-gold rounded-t-lg py-2.5 pl-12 pr-4 text-sm focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-uptc-gold transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 dark:border-slate-700 hidden md:block"></div>

        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 group pl-2 pr-4 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Admin UPTC</p>
            <p className="text-[10px] font-bold text-uptc-gold uppercase tracking-wider">{campusName}</p>
          </div>
          <div className="size-10 rounded-full bg-uptc-black text-uptc-gold flex items-center justify-center font-bold text-lg border-2 border-uptc-gold overflow-hidden">
            A
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-uptc-gold transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default InfrastructureHeader;
