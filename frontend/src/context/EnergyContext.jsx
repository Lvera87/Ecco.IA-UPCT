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

    const [campuses, setCampuses] = useState([]);
    const [selectedCampusId, setSelectedCampusId] = useState(null);
    const [consumptionHistory, setConsumptionHistory] = useState([]);
    const [dashboardInsights, setDashboardInsights] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        localStorage.setItem('eccoIA_assets', JSON.stringify(assets));
    }, [assets]);

    // Re-sync when campus changes
    useEffect(() => {
        if (selectedCampusId) {
            syncEnergyData(selectedCampusId);
        }
    }, [selectedCampusId]);

    const syncEnergyData = async (campusIdOverride = null) => {
        setIsSyncing(true);
        try {
            // 1. Fetch Campuses if not already loaded
            let currentCampuses = campuses;
            if (currentCampuses.length === 0) {
                currentCampuses = await infrastructureApi.getCampuses();
                setCampuses(currentCampuses);

                // Set default if none selected
                if (!selectedCampusId && !campusIdOverride && currentCampuses.length > 0) {
                    setSelectedCampusId(currentCampuses[0].id);
                    return; // The useEffect will trigger the actual data fetch
                }
            }

            const targetId = campusIdOverride || selectedCampusId || (currentCampuses.length > 0 ? currentCampuses[0].id : null);
            if (!targetId) return;

            // 2. Fetch specific campus data
            const [campusAssets, dashboardData, historyData] = await Promise.all([
                infrastructureApi.getAssets(targetId),
                infrastructureApi.getDashboardMetrics(), // TODO: metrics should ideally be per campus too
                infrastructureApi.getConsumptionHistory(targetId)
            ]);

            if (historyData) {
                setConsumptionHistory(historyData);
            }

            // Mocking different metrics per campus since the API might be global
            // In a real scenario, passing targetId to getDashboardMetrics would be better
            const metrics = dashboardData?.summary ? {
                monthly_kwh: dashboardData.summary.monthly_consumption_kwh,
                carbon_footprint_tons: dashboardData.summary.carbon_footprint_tons,
                kwh_per_student: 120.5, // Mock
                water_m3: 3500, // Mock Water Consumption
                occupancy_rate: targetId === '1' ? 85 : 62, // Mock Occupancy (Tunja busy, others less)
                efficiency_score: targetId === '2' ? 95 : 85, // Example variation
                energy_intensity_index: 45.2
            } : {};

            if (campusAssets) {
                setAssets(campusAssets.map(a => ({
                    id: a.id,
                    name: a.name,
                    icon: 'Building2',
                    asset_type: a.unit_type,
                    consumption: a.avg_daily_consumption,
                    status: a.status,
                    location: a.name
                })));
            }

            setDashboardInsights({
                metrics,
                ai_advice: `Análisis para sede ${currentCampuses.find(c => c.id === targetId)?.name}: Se observa estabilidad operativa.`
            });

        } catch (error) {
            console.error("Infrastructure Sync Error:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const selectCampus = (id) => {
        setSelectedCampusId(id);
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
        campuses,
        selectedCampusId,
        selectCampus,
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
