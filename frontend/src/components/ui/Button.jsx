import React from 'react';
import PropTypes from 'prop-types';

// UPTC Style Variants
const variants = {
    // Primary: Gold Background, Black Text (High Contrast)
    primary: "bg-uptc-gold text-uptc-black border-transparent hover:bg-yellow-400 shadow-md hover:shadow-lg shadow-yellow-500/20",
    
    // Secondary: Black Background, Gold Text (Institutional)
    secondary: "bg-uptc-black text-uptc-gold border-transparent hover:bg-gray-900 shadow-md hover:shadow-lg",
    
    // Outline: Transparent with Gold Border
    outline: "bg-transparent border-2 border-uptc-gold text-uptc-black dark:text-uptc-gold hover:bg-uptc-gold hover:text-black",
    
    // Ghost: Subtle for lists
    ghost: "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent",
    
    // Danger: Red standard
    danger: "bg-red-600 text-white border-transparent hover:bg-red-700",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon: Icon,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 border gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wide";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
            {Icon && <Icon size={18} />}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
    icon: PropTypes.elementType,
};

export default Button;