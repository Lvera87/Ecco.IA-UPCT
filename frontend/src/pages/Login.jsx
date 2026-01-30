import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, User, Building2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { authApi } from '../api/auth';

const Login = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.login(identifier, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Credenciales inválidas. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-body p-6 relative overflow-hidden bg-slate-950">
            {/* Institucional Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://www.uptc.edu.co/sitio/export/sites/default/portal/sitios/universidad/vic_aca/tunja/.content/img/slider/sedeCentral.JPG_2142355918.jpg')`,
                }}
            >
                {/* Balanced Institutional Overlay - Lighter to show the image */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#003311]/70 via-[#001100]/65 to-black/80 backdrop-blur-[0.5px]"></div>
            </div>

            <div className="w-full max-w-[400px] relative z-10 scale-[0.9] md:scale-100 origin-center transition-transform">
                <div className="bg-[#001a0d]/70 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="drop-shadow-2xl">
                            <img
                                src="https://www.uptc.edu.co/sitio/portal/PRUEBAS/pruebasM/Frontal/.content/img/botones/logoUPTC24.svg"
                                alt="Logo UPTC"
                                className="h-24 w-auto object-contain brightness-110"
                            />
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#FDB813]/60 ml-1">Identificación</label>
                            <Input
                                type="text"
                                placeholder="Email o usuario"
                                icon={User}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                autoComplete="username"
                                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#006633] focus:ring-[#006633]/20 text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#FDB813]/60">Contraseña</label>
                                <button type="button" className="text-[10px] font-bold text-[#FDB813] hover:text-[#f3cd44] transition-colors">¿Olvidó la clave?</button>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#006633] focus:ring-[#006633]/20 text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[11px] font-bold animate-shake">
                                <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                                {error}
                            </div>
                        )}

                        <Button
                            className="w-full h-12 bg-[#006633] hover:bg-[#00552b] text-white font-black text-base rounded-xl shadow-xl shadow-black/20 transition-all border border-white/5 active:scale-[0.98] mt-2"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Verificando...
                                </div>
                            ) : 'ENTRAR AL PORTAL'}
                        </Button>
                    </form>

                    <div className="mt-8 flex flex-col items-center gap-4">
                        <p className="text-white/40 text-[10px] font-medium text-center leading-tight">
                            ¿Necesita acceso? <br />
                            <span className="text-[#FDB813] font-bold">Contacte con el administrador</span>
                        </p>

                        <div className="flex items-center gap-2 text-[8px] text-white/20 font-black uppercase tracking-[0.2em] pt-2 border-t border-white/5 w-full justify-center">
                            <ShieldCheck size={10} className="text-[#006633]" />
                            Portal Institucional | UPTC
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;