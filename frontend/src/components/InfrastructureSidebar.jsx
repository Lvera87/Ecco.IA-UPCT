import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Server, BarChart3, Wind,
  MessageSquareText, Settings, LogOut, Bell, BellDot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const InfrastructureSidebar = () => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const campusName = userProfile?.config?.campus_name || "Sede Central";

  const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Control Sede" },

    { to: "/energy-analysis", icon: BarChart3, label: "Analítica" },
    { to: "/carbon-footprint", icon: Wind, label: "Huella Carbono" },
    { to: "/infrastructure-assistant", icon: MessageSquareText, label: "Asistente IA" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-72 bg-[#050a0a] text-slate-300 border-r border-slate-800 shadow-2xl z-30">
      {/* Header Institucional */}
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center">
            <img
              src="https://www.uptc.edu.co/sitio/portal/PRUEBAS/pruebasM/Frontal/.content/img/botones/logoUPTC24.svg"
              alt="Logo UPTC"
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-wide leading-none">Infra<span className="text-uptc-gold">UPTC</span></h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">Gestión V2.0</p>
          </div>
        </div>


      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 ml-4">Menú Principal</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                ? "bg-uptc-gold text-black font-bold shadow-[0_0_20px_rgba(253,184,19,0.2)]"
                : "hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "text-black" : "group-hover:text-uptc-gold transition-colors"} />
                <span className="text-sm font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Profile & Settings */}
      <div className="px-4 py-6 border-t border-slate-800 bg-[#080d0d]">

        {/* Profile Info - Moved from Header */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group mb-4"
        >
          <div className="size-10 rounded-xl bg-uptc-gold/10 border border-uptc-gold/30 text-uptc-gold flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Admin UPTC</p>
            <p className="text-[9px] font-bold text-uptc-gold uppercase truncate">{campusName}</p>
          </div>
          <button className="p-1.5 text-slate-500 hover:text-uptc-gold transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border border-[#080d0d]"></span>
          </button>
        </div>

        <div className="space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-bold ${isActive ? "bg-white/10 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Settings size={18} />
            Configuración
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default InfrastructureSidebar;
