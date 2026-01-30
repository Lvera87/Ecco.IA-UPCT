import React from 'react';
import { ArrowRight, Download, Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const DesignSystem = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-10 font-body">
            <div className="max-w-4xl mx-auto space-y-12">
                <header>
                    <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white mb-2">Design System</h1>
                    <p className="text-slate-500">UI Kit y componentes base para EccoIA</p>
                </header>

                <section className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Botones</h2>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Variantes</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button>Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="ghost">Ghost Button</Button>
                            <Button variant="danger">Danger Button</Button>
                        </div>
                        <div className="p-10 bg-slate-900 rounded-xl flex gap-4">
                            <Button variant="outline">Outline (Dark BG)</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Tamaños</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Con Iconos</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button icon={ArrowRight}>Empezar</Button>
                            <Button variant="secondary" icon={Download}>Descargar</Button>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Inputs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="Email Address" placeholder="usuario@ejemplo.com" icon={Mail} />
                        <Input label="Password" type="password" placeholder="••••••••" icon={Lock} />
                        <Input label="Con error" placeholder="Valor inválido" error="Este campo es requerido" icon={AlertCircle} />
                        <Input label="Sin icono" placeholder="Texto simple" />
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Tarjetas (Cards)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Tarjeta Básica</h3>
                            <p className="text-slate-500">Contenido estándar en una tarjeta con bordes suaves.</p>
                        </Card>

                        <Card hover>
                            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Tarjeta con Hover</h3>
                            <p className="text-slate-500">Pasa el mouse por encima para ver el efecto de elevación y borde.</p>
                        </Card>

                        <div className="col-span-1 md:col-span-2 p-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl relative overflow-hidden">
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card glass>
                                    <h3 className="font-bold text-lg mb-2 text-white">Glassmorphism</h3>
                                    <p className="text-white/80">Efecto de cristal esmerilado ideal para fondos complejos o degradados.</p>
                                </Card>
                                <Card glass hover>
                                    <h3 className="font-bold text-lg mb-2 text-white">Glass + Hover</h3>
                                    <p className="text-white/80">Combinación de efecto cristal con interacciones de mouse.</p>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default DesignSystem;
