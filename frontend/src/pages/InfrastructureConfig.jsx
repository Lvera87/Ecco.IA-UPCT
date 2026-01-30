import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const InfrastructureConfig = () => {
    const navigate = useNavigate();
    const { setUserProfile } = useUser();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        campus_name: 'Sede Central',
        city: 'Tunja',
        total_area_sqm: '',
        student_population: '',
        staff_population: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        // Auto-fill student population based on datos.md
        if (name === 'city') {
            const populations = {
                'Tunja': '18000',
                'Duitama': '5500',
                'Sogamoso': '6000',
                'Chiquinquirá': '2000'
            };
            newFormData.student_population = populations[value] || '';
            newFormData.campus_name = `Sede ${value}`;
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setUserProfile({
                type: 'infrastructure',
                config: {
                    ...formData,
                    total_area_sqm: parseFloat(formData.total_area_sqm),
                    student_population: parseInt(formData.student_population)
                }
            });
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-950 font-body text-slate-200 flex flex-col items-center justify-center p-6 relative">
            <div className="max-w-2xl w-full z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-uptc-gold/10 rounded-2xl border border-uptc-gold/20 text-uptc-gold mb-6">
                        <Building2 size={32} />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-white mb-2">Configuración de Sede UPTC</h1>
                    <p className="text-slate-400 text-lg">Digitaliza la infraestructura de tu campus para optimizar recursos.</p>
                </div>

                <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Nombre de la Sede</label>
                                <input
                                    name="campus_name"
                                    value={formData.campus_name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-uptc-gold outline-none"
                                    placeholder="Ej. Facultad Duitama"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Ciudad / Municipio</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 pl-12 text-white focus:ring-2 focus:ring-uptc-gold outline-none appearance-none"
                                    >
                                        <option value="Tunja">Tunja</option>
                                        <option value="Duitama">Duitama</option>
                                        <option value="Sogamoso">Sogamoso</option>
                                        <option value="Chiquinquirá">Chiquinquirá</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Área Construida Total (m²)</label>
                            <input
                                name="total_area_sqm"
                                type="number"
                                value={formData.total_area_sqm}
                                onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-uptc-gold outline-none"
                                placeholder="Ej. 15000"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Población Estudiantil</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        name="student_population"
                                        type="number"
                                        value={formData.student_population}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 pl-12 text-white focus:ring-2 focus:ring-uptc-gold outline-none"
                                        placeholder="Ej. 4500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Personal Administrativo</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        name="staff_population"
                                        type="number"
                                        value={formData.staff_population}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 pl-12 text-white focus:ring-2 focus:ring-uptc-gold outline-none"
                                        placeholder="Ej. 300"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-uptc-gold hover:bg-yellow-500 text-black font-bold text-lg shadow-lg shadow-yellow-500/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2">Finalizar Configuración <ArrowRight /></span>}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default InfrastructureConfig;