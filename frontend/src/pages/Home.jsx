import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Activity, Globe, ArrowRight, Wind, Sun, BarChart3, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 font-body text-slate-200 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px]"></div>
            </div>

            {/* Navbar */}
            <header className="relative z-10 w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                        <Zap className="text-emerald-400" size={24} />
                    </div>
                    <span className="font-display font-bold text-xl text-white tracking-tight">Ecco-IA <span className="text-slate-500 text-sm font-normal">| UPTC</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/login')} className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition-colors">
                        Acceso Administrativo
                    </button>
                    <Button onClick={() => navigate('/login')} className="bg-white text-slate-950 hover:bg-emerald-400 hover:text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-white/5 transition-all">
                        Entrar al Sistema
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fadeIn">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    HackDay 2026: Sostenibilidad Universitaria
                </div>

                <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight max-w-5xl">
                    Gestión Inteligente para <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Campus Sostenibles</span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                    Una plataforma integral impulsada por IA para monitorear, predecir y optimizar el consumo de recursos en las sedes de Tunja, Duitama, Sogamoso y Chiquinquirá.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-lg font-black rounded-2xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
                    >
                        <span className="relative z-10">Acceder al Dashboard</span>
                        <ArrowRight size={20} className="relative z-10 transition-transform group-hover:translate-x-1" />
                    </button>

                    <button className="px-8 py-5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-lg font-bold rounded-2xl transition-all hover:-translate-y-1 flex items-center gap-3">
                        <Globe size={20} className="text-slate-500" />
                        Ver Mapa de Sedes
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full">
                    {[
                        { icon: BarChart3, title: "Análisis de Consumo", desc: "Monitoreo detallado de consumo eléctrico y agua por edificio." },
                        { icon: Activity, title: "Predicción con IA", desc: "Modelos predictivos que anticipan picos de demanda y sugieren ahorros." },
                        { icon: ShieldCheck, title: "Gestión Centralizada", desc: "Control total de todas las sedes desde un único panel administrativo." }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all hover:bg-slate-900/80 group text-left">
                            <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors mb-6">
                                <item.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 font-display">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Home;
