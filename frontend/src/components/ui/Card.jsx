import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', glass = false, hover = false, ...props }) => {
    const baseStyles = "rounded-2xl p-6 border";

    const glassStyles = glass
        ? "bg-white/10 dark:bg-slate-900/50 backdrop-blur-md border-white/20 dark:border-white/10"
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";

    const hoverStyles = hover
        ? "hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
        : "";

    return (
        <div
            className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    glass: PropTypes.bool,
    hover: PropTypes.bool,
};

export default Card;
