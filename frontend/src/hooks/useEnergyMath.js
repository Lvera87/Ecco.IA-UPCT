import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useEnergy } from '../context/EnergyContext';

export const useEnergyMath = () => {
    // Micro-Contexts Architecture
    const { userProfile } = useUser();
    const { assets, consumptionHistory, dashboardInsights } = useEnergy();

    const config = userProfile?.config || {};

    // UPTC Standard Tariff (Industrial/Institutional)
    const KWH_PRICE_INSTITUTIONAL = 850; 
    const CO2_FACTOR = 0.164; // kg CO2e per kWh

    const kwhPrice = useMemo(() => {
        return KWH_PRICE_INSTITUTIONAL;
    }, []);

    const formatMoney = (val) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(val);

    // Core Calculations
    const calculations = useMemo(() => {
        // Backend-First: Si el backend ya calculó las métricas, preferirlas
        const backendMetrics = dashboardInsights?.metrics || {};

        // Prioridad de consumo base: 1. Capturado (Medidores) 2. Promedio declarado 3. Default
        const baseMonthlyKwh = (parseFloat(config.average_kwh_captured) || 5000);

        // Current consumption from history
        const latestReading = consumptionHistory.length > 0
            ? consumptionHistory[0].value
            : 0;

        // Use backend values when available, fallback to local calculation
        const projectedKwh = backendMetrics.projected_kwh || (latestReading > 0 ? latestReading * 30 : baseMonthlyKwh);
        const projectedBill = backendMetrics.projected_bill || (projectedKwh * kwhPrice);

        // Waste costs (Fugas, equipos ineficientes)
        const wasteKwhMonthly = projectedKwh * 0.15; // Estimado 15% ineficiencia base
        const wasteMoneyLost = backendMetrics.waste_cost_monthly || (wasteKwhMonthly * kwhPrice);

        // Carbon Footprint - prefer backend
        const co2Footprint = backendMetrics.co2_footprint || (projectedKwh * CO2_FACTOR);
        const treesEquivalent = backendMetrics.trees_equivalent || Math.round(co2Footprint / 20);

        // Specific Metrics
        const totalArea = parseFloat(config.total_area_sqm) || 1;
        const energyIntensity = projectedKwh / totalArea; // kWh/m2

        // Efficiency Score
        const efficiencyScore = backendMetrics.efficiency_score || 85;

        // Load Estimates (Percent of total) based on Institutional Zones
        const loadDist = [
            { name: 'Iluminación', value: projectedKwh * 0.25, color: '#FDB913' },
            { name: 'Climatización', value: projectedKwh * 0.35, color: '#1A1A1A' },
            { name: 'Equipos IT', value: projectedKwh * 0.30, color: '#4D4D4D' },
            { name: 'Otros', value: projectedKwh * 0.10, color: '#999999' }
        ];

        return {
            latestReading,
            projectedKwh,
            projectedBill,
            wasteKwhMonthly,
            wasteMoneyLost,
            co2Footprint,
            treesEquivalent,
            efficiencyScore,
            energyIntensity: energyIntensity.toFixed(2),
            loadDist,
            hasData: consumptionHistory.length > 0,
            hasProfile: !!config.campus_name
        };
    }, [consumptionHistory, kwhPrice, config, dashboardInsights]);

    // Totals from assets
    const totals = useMemo(() => {
        const totalNominalKwh = assets.reduce((sum, a) => sum + (a.consumption || 0), 0);
        return { totalNominalKwh };
    }, [assets]);

    return {
        ...calculations,
        ...totals,
        formatMoney,
        kwhPrice,
        CO2_FACTOR
    };
};