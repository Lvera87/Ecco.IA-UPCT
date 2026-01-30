import React from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import Button from './Button';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'danger',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 pb-0 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-800 shadow-lg
              ${isDanger
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-600'
                                : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'}`}>
                            {isDanger ? <AlertTriangle size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 pt-4 pl-[88px] -mt-2">
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 mt-2">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDanger ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                    >
                        {isLoading ? 'Procesando...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
