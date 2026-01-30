import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    Server, Zap, Building2, Lightbulb, Fan, Thermometer,
    Monitor, Network, Database, Lock, Shield, Cpu, Activity,
    Refrigerator, AirVent, Tv, WashingMachine, Microwave // Keeping some legacy icons just in case
} from 'lucide-react';
import { infrastructureApi } from '../api/infrastructure';

const EnergyContext = createContext();

export const iconMap = {
    Server, Zap, Building2, Lightbulb, Fan, Thermometer,
    Monitor, Network, Database, Lock, Shield, Cpu, Activity,
    Refrigerator, AirVent, Tv, WashingMachine, Microwave
};

export const EnergyProvider = ({ children }) => {
    // Assets (antes appliances)
    const [assets, setAssets] = useState(() => {
        const saved = localStorage.getItem('eccoIA_assets');
        return saved ? JSON.parse(saved) : [];
    });

    const [consumptionHistory, setConsumptionHistory] = useState([]);
    const [dashboardInsights, setDashboardInsights] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        localStorage.setItem('eccoIA_assets', JSON.stringify(assets));
    }, [assets]);

    const syncEnergyData = async (silent = false) => {
        if (!silent) setIsSyncing(true);
        try {
            const [campuses, dashboardData] = await Promise.all([
                infrastructureApi.getCampuses(),
                infrastructureApi.getDashboardMetrics()
            ]);

            const firstCampusId = campuses.length > 0 ? campuses[0].id : null;
            const remoteAssets = firstCampusId
                ? await infrastructureApi.getAssets(firstCampusId)
                : [];

            const metrics = dashboardData?.summary ? {
                monthly_kwh: dashboardData.summary.monthly_consumption_kwh,
                carbon_footprint_tons: dashboardData.summary.carbon_footprint_tons,
                kwh_per_student: Number((dashboardData.summary.monthly_consumption_kwh / (dashboardData.summary.total_students || 1)).toFixed(2)),
                efficiency_score: 85, // Mock score for now
                energy_intensity_index: Number((dashboardData.summary.monthly_consumption_kwh / (dashboardData.summary.total_area_sqm || 1)).toFixed(2))
            } : {};

            if (remoteAssets) {
                setAssets(remoteAssets.map(a => ({
                    id: a.id,
                    name: a.name,
                    icon: 'Building2', // Default icon for now
                    asset_type: a.unit_type,
                    consumption: a.avg_daily_consumption,
                    status: a.status,
                    location: a.name // Using name as location fallback
                })));
            }

            setDashboardInsights({
                metrics,
                ai_advice: "Se observa un consumo estable en el campus principal. Se recomienda optimizar horarios en laboratorios."
            });

            return { metrics };
        } catch (error) {
            console.error("Infrastructure Sync Error:", error);
            return null;
        } finally {
            if (!silent) setIsSyncing(false);
        }
    };

    const addAsset = async (assetData) => {
        try {
            const newAsset = await infrastructureApi.createAsset(assetData);
            setAssets(prev => [...prev, {
                id: newAsset.id,
                name: newAsset.name,
                icon: 'Zap',
                asset_type: newAsset.asset_type,
                consumption: newAsset.avg_daily_kwh,
                status: newAsset.status,
                location: newAsset.location_detail
            }]);
            return true;
        } catch (error) {
            console.error("Error adding asset:", error);
            return false;
        }
    };

    // Alias for compatibility with components expecting 'appliances'
    const appliances = assets.map(a => ({
        ...a,
        monthlyCost: a.consumption * 30 * 600, // Estimado simple
        category: a.asset_type
    }));

    const value = {
        assets,
        appliances, // Backward compatibility alias
        consumptionHistory,
        dashboardInsights,
        isSyncing,
        syncEnergyData,
        addAsset,
        addAppliance: addAsset, // Alias
        iconMap
    };

    return <EnergyContext.Provider value={value}>{children}</EnergyContext.Provider>;
};

export const useEnergy = () => {
    const context = useContext(EnergyContext);
    if (!context) throw new Error('useEnergy must be used within an EnergyProvider');
    return context;
};
