import React from 'react';
import PropTypes from 'prop-types';

const Input = ({ label, error, icon: Icon, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    className={`
            w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 
            rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all
            focus:border-primary focus:ring-4 focus:ring-primary/10
            placeholder:text-slate-400
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
          `}
                    {...props}
                />
            </div>
            {error && <span className="text-xs text-red-500 font-medium ml-1">{error}</span>}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    error: PropTypes.string,
    icon: PropTypes.elementType,
    className: PropTypes.string,
};

export default Input;
