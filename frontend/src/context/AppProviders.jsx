import React from 'react';
import { AppProvider } from './AppContext';

/**
 * Global provider wrapper. 
 * Consolidates all application-level contexts.
 */
export const AppProviders = ({ children }) => {
    return (
        <AppProvider>
            {children}
        </AppProvider>
    );
};
