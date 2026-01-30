import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Building2 } from 'lucide-react';
import Card from '../components/ui/Card';

const InfrastructureAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hola. Soy el asistente de infraestructura UPTC. Puedo ayudarte con análisis de consumo por bloque, huella de carbono institucional o reportes de eficiencia.' }
    ]);
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    const handleSend = (e) => {
        e.preventDefault();
        if(!input.trim()) return;
        
        const newMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        
        // Simulación de respuesta
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: `Entendido. Analizando datos para "${input}" en la base de datos de la Sede Central...` 
            }]);
        }, 1000);
    };

    useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
            <div className="max-w-4xl w-full flex-1 flex flex-col h-[85vh]">
                <div className="mb-6 flex items-center gap-3">
                    <div className="p-3 bg-uptc-gold/10 rounded-xl text-uptc-gold border border-uptc-gold/20">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Asistente de Gestión UPTC</h1>
                        <p className="text-slate-400 text-sm">Inteligencia Artificial aplicada a Facility Management</p>
                    </div>
                </div>

                <Card className="flex-1 bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-uptc-gold text-black' : 'bg-slate-800 text-uptc-gold border border-slate-700'}`}>
                                        {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                                        m.role === 'user' 
                                            ? 'bg-uptc-gold text-black font-medium rounded-tr-none shadow-lg' 
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <form onSubmit={handleSend} className="relative">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className="w-full bg-slate-800 text-white p-4 pr-14 rounded-xl focus:ring-2 focus:ring-uptc-gold outline-none border border-slate-700 placeholder:text-slate-500"
                                placeholder="Ej. ¿Cuál es el bloque con mayor consumo este mes?"
                            />
                            <button type="submit" className="absolute right-2 top-2 p-2 bg-uptc-gold rounded-lg text-black hover:bg-yellow-500 transition-colors">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default InfrastructureAssistant;