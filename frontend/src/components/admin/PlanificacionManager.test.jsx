import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import PlanificacionManager from './PlanificacionManager';

vi.mock('axios');

const mockStats = {
  kpis: { totalSecciones: 10, porcentajeOcupacion: 75, salonesLlenos: 2, totalDocentes: 5, docentesConSeccion: 4, docentesEnExceso: 0 },
  graficos: {
    histogramaCarga: { '0-10h': 1, '11-20h': 2, '21-30h': 1, '31-40h': 0, '41-48h': 0, '>48h': 0 },
    cargaPorDia: { Lunes: 3, Martes: 4, Miércoles: 2, Jueves: 5, Viernes: 3, Sábado: 1, Domingo: 0 },
    distOcupacion: { '0-24%': 1, '25-49%': 3, '50-74%': 4, '75-99%': 2, '100%': 0 }
  },
  alertas: { seccionesSinAsignar: [], conflictosDocente: [], conflictosAula: [], casiLlenos: [] }
};

const mockCarga = {
  docentes: [
    { _id: 'd1', nombre: 'Prof. Juan Pérez', totalHoras: 20, estado: 'normal', turnoDisponibilidad: 'Completo', secciones: [] }
  ]
};

// Mock Chart.js to avoid canvas errors in jsdom
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />
}));

describe('PlanificacionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/planificacion/stats') return Promise.resolve({ data: mockStats });
      if (url === '/api/admin/planificacion/carga-horaria') return Promise.resolve({ data: mockCarga });
      return Promise.resolve({ data: [] });
    });
  });

  it('1. Debe renderizar el header del planificador', async () => {
    render(<PlanificacionManager />);
    await waitFor(() => {
      expect(screen.getByText('Centro de Planificación')).toBeInTheDocument();
    });
  });

  it('2. Debe mostrar las pestañas de navegación', async () => {
    render(<PlanificacionManager />);
    await waitFor(() => {
      expect(screen.getByText('Planificador de Horarios')).toBeInTheDocument();
      expect(screen.getByText('Estadísticas y Conflictos')).toBeInTheDocument();
    });
  });

  it('3. Debe mostrar la lista de docentes en pestaña planificador', async () => {
    render(<PlanificacionManager />);
    await waitFor(() => {
      expect(screen.getByText(/Prof. Juan Pérez/)).toBeInTheDocument();
    });
  });

  it('4. Debe cambiar a pestaña de estadísticas al hacer click', async () => {
    render(<PlanificacionManager />);
    await waitFor(() => { expect(screen.getByText('Estadísticas y Conflictos')).toBeInTheDocument(); });

    fireEvent.click(screen.getByText('Estadísticas y Conflictos'));

    await waitFor(() => {
      expect(screen.getByText('Total Salones')).toBeInTheDocument();
    });
  });

  it('5. Debe mostrar KPIs en la pestaña de estadísticas', async () => {
    render(<PlanificacionManager />);
    await waitFor(() => { expect(screen.getByText('Estadísticas y Conflictos')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Estadísticas y Conflictos'));

    await waitFor(() => {
      expect(screen.getByText('Total Salones')).toBeInTheDocument();
      expect(screen.getByText('% Ocupación')).toBeInTheDocument();
      expect(screen.getByText('Docentes Activos')).toBeInTheDocument();
    });
  });

  it('6. Debe mostrar mensaje de sin conflictos cuando no los hay', async () => {
    render(<PlanificacionManager />);
    await waitFor(() => { expect(screen.getByText('Estadísticas y Conflictos')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Estadísticas y Conflictos'));

    await waitFor(() => {
      expect(screen.getByText(/No se detectaron conflictos/)).toBeInTheDocument();
    });
  });

  it('7. Debe renderizar vacantes de urgencia si existen', async () => {
    const statsConVacante = {
      ...mockStats,
      alertas: {
        ...mockStats.alertas,
        seccionesSinAsignar: [{ _id: 's1', codigoSeccion: 'SEC-001', curso: 'Matemáticas', dias: ['Lunes'], horaInicio: '08:00', horaFin: '10:00', aula: 'A101' }]
      }
    };
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/planificacion/stats') return Promise.resolve({ data: statsConVacante });
      if (url === '/api/admin/planificacion/carga-horaria') return Promise.resolve({ data: mockCarga });
      return Promise.resolve({ data: [] });
    });

    render(<PlanificacionManager />);
    await waitFor(() => {
      expect(screen.getByText(/Urgencia/)).toBeInTheDocument();
    });
  });

  it('8. Debe expandir las secciones de un docente al hacer click', async () => {
    render(<PlanificacionManager />);
    await waitFor(() => { expect(screen.getByText(/Prof. Juan Pérez/)).toBeInTheDocument(); });

    const docenteRow = screen.getByText(/Prof. Juan Pérez/).closest('[role="button"]');
    fireEvent.click(docenteRow);

    await waitFor(() => {
      expect(screen.getByText('Secciones Asignadas (0)')).toBeInTheDocument();
    });
  });
});
