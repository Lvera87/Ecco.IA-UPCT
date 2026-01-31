/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extender expect de Vitest con los matchers de jest-dom
expect.extend(matchers);

import WaterSplitChart from './WaterSplitChart';
import ConsumptionOccupancyChart from './ConsumptionOccupancyChart';
import DistributionDonut from './DistributionDonut';
import WeeklyProfileChart from './WeeklyProfileChart';

// --- MOCKS PARA RECHARTS ---
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div className="recharts-responsive-container-mock">{children}</div>,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  };
});

describe('🎨 Dashboard Charts Reliability Tests', () => {

  describe('1. WaterSplitChart (Lógica de Alertas)', () => {
    
    it('debe mostrar estado OPTIMIZADO cuando el valor actual supera la meta', () => {
      const data = [{ day: 'Lun', val: 2500 }];
      const target = 2400;
      render(<WaterSplitChart data={data} target={target} />);
      expect(screen.getByText(/OPTIMIZADO/i)).toBeInTheDocument();
      expect(screen.queryByText(/CRÍTICO/i)).not.toBeInTheDocument();
    });

    it('debe mostrar estado CRÍTICO cuando el valor actual está bajo la meta', () => {
        const data = [{ day: 'Lun', val: 2000 }];
        const target = 2400;
        render(<WaterSplitChart data={data} target={target} />);
        expect(screen.getByText(/CRÍTICO/i)).toBeInTheDocument();
    });

    it('debe calcular correctamente la desviación porcentual', () => {
        const data = [{ day: 'X', val: 150 }];
        render(<WaterSplitChart data={data} target={100} />);
        // 50% de desviación (150 vs 100)
        expect(screen.getByText(/50.0/)).toBeInTheDocument();
    });

    it('debe manejar datos vacíos sin crashear', () => {
        render(<WaterSplitChart data={[]} />);
        // Usamos getAllByText en caso de duplicados y verificamos que exista al menos uno
        const titles = screen.getAllByText(/Consumo Hídrico/i);
        expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('2. ConsumptionOccupancyChart (Cálculo de Promedios)', () => {
    it('debe calcular y mostrar el Consumo Estimado promedio correctamente', () => {
      const data = [{ consumo: 100 }, { consumo: 200 }, { consumo: 300 }];
      render(<ConsumptionOccupancyChart data={data} />);
      // Promedio 200. Buscamos el elemento exacto que tiene el número grande
      // A veces el texto está dividido, buscamos "200"
      const values = screen.getAllByText(/200/);
      expect(values[0]).toBeInTheDocument();
    });
  });

  describe('3. DistributionDonut (Integridad Visual)', () => {
    it('debe renderizar el texto central "100% TOTAL"', () => {
      render(<DistributionDonut />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('TOTAL')).toBeInTheDocument();
    });

    it('debe renderizar la leyenda con las categorías correctas', () => {
      render(<DistributionDonut />);
      // Usamos getAll por si acaso
      expect(screen.getAllByText(/LABORATORIOS/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/SALONES/i)[0]).toBeInTheDocument();
    });
  });

  describe('4. WeeklyProfileChart (Elementos UI)', () => {
    it('debe mostrar la alerta de anomalía en la cabecera', () => {
      render(<WeeklyProfileChart />);
      expect(screen.getByText(/Anomalía:/i)).toBeInTheDocument();
    });
  });

});
