import React from 'react';
import { UserProvider, useUser } from './UserContext';
import { UIProvider, useUI } from './UIContext';
import { EnergyProvider, useEnergy } from './EnergyContext';

/**
 * AppProviders wrapper to encapsulate all context providers
 * Order matters: UI -> User -> Energy (Energy depends on User)
 */
export const AppProvider = ({ children }) => {
  return (
    <UIProvider>
      <UserProvider>
        <EnergyProvider>
          {children}
        </EnergyProvider>
      </UserProvider>
    </UIProvider>
  );
};

/**
 * Custom hook to access all contexts at once (optional utility)
 * Useful for dashboard-like components that need data from everywhere
 */
export const useApp = () => {
  const user = useUser();
  const ui = useUI();
  const energy = useEnergy();

  return {
    // User Domain
    userProfile: user.userProfile,
    syncUserProfile: user.syncUserProfile,

    // UI Domain
    theme: ui.theme,
    toggleTheme: ui.toggleTheme,
    notifications: ui.notifications,
    addNotification: ui.addNotification,

    // Energy Domain
    assets: energy.assets,
    consumptionHistory: energy.consumptionHistory,
    dashboardInsights: energy.dashboardInsights,
    isSyncing: energy.isSyncing,
    syncEnergyData: energy.syncEnergyData,
    addAsset: energy.addAsset,
  };
};