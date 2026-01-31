import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Building2, Sparkles, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import client from '../api/client'; // Cliente axios configurado

const InfrastructureAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hola. Soy el asistente de infraestructura Ecco-IA. Tengo acceso directo a los modelos predictivos de la UPTC. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCampusId, setSelectedCampusId] = useState(1); // Default Tunja
    const endRef = useRef(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if(!input.trim() || isLoading) return;
        
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Llamada real al backend con contexto
            const response = await client.post('/analytics/chat', {
                message: userMsg.content,
                campus_id: selectedCampusId
            });

            const botMsg = { 
                role: 'bot', 
                content: response.data.response 
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: "Lo siento, perdí la conexión con el nodo central de IA. Intenta de nuevo." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-6 flex flex-col items-center">
            <div className="max-w-4xl w-full flex-1 flex flex-col h-[85vh]">
                
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-uptc-gold/10 rounded-xl text-uptc-gold border border-uptc-gold/20 shadow-lg shadow-uptc-gold/5">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Asistente Inteligente</h1>
                            <p className="text-slate-400 text-sm font-mono">Motor: Gemini 1.5 Pro • Conectado a XGBoost</p>
                        </div>
                    </div>
                    
                    {/* Selector de Contexto */}
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-xs font-bold text-slate-500 px-2 uppercase">Contexto:</span>
                        <select 
                            value={selectedCampusId}
                            onChange={(e) => setSelectedCampusId(Number(e.target.value))}
                            className="bg-slate-800 text-slate-200 text-sm font-medium py-1.5 px-3 rounded-md outline-none border border-slate-700 focus:border-uptc-gold transition-colors"
                        >
                            <option value={1}>Sede Central (Tunja)</option>
                            <option value={2}>Facultad Duitama</option>
                            <option value={3}>Sede Sogamoso</option>
                            <option value={4}>Sede Chiquinquirá</option>
                        </select>
                    </div>
                </div>

                <Card className="flex-1 bg-slate-900/50 backdrop-blur-sm border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`size-8 md:size-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                                        m.role === 'user' 
                                            ? 'bg-slate-700 text-slate-300' 
                                            : 'bg-gradient-to-br from-uptc-gold to-yellow-600 text-black border border-yellow-400'
                                    }`}>
                                        {m.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                                        m.role === 'user' 
                                            ? 'bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700' 
                                            : 'bg-white/5 backdrop-blur-md text-slate-100 rounded-tl-none border border-white/10'
                                    }`}>
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="flex gap-3 max-w-[75%]">
                                    <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <Loader2 size={18} className="text-uptc-gold animate-spin" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                                        Consultando red neuronal...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>
                    
                    <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur z-20">
                        <form onSubmit={handleSend} className="relative flex gap-2">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 bg-slate-950 text-white p-4 pr-4 rounded-xl focus:ring-1 focus:ring-uptc-gold outline-none border border-slate-800 placeholder:text-slate-600 disabled:opacity-50 transition-all"
                                placeholder="Pregunta sobre consumos, predicciones o anomalías..."
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="px-6 bg-uptc-gold rounded-xl text-black font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-uptc-gold/10 flex items-center justify-center"
                            >
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