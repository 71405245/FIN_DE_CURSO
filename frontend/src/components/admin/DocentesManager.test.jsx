import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import DocentesManager from './DocentesManager';

vi.mock('axios');

describe('DocentesManager', () => {
  const mockDocentes = [
    {
      _id: 'd1',
      nombre: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@sima.com',
      turnoDisponibilidad: 'Completo',
      carrerasEnsenadas: [{ _id: 'c1', nombre: 'Ingeniería de Sistemas' }]
    }
  ];

  const mockCarreras = [
    { _id: 'c1', nombre: 'Ingeniería de Sistemas' },
    { _id: 'c2', nombre: 'Administración' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/docentes') return Promise.resolve({ data: mockDocentes });
      if (url === '/api/admin/carreras') return Promise.resolve({ data: mockCarreras });
      return Promise.resolve({ data: [] });
    });
  });

  it('1. Debe renderizar la lista de docentes', async () => {
    render(<DocentesManager />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    expect(screen.getByText('juan@sima.com')).toBeInTheDocument();
  });

  it('2. Debe mostrar el formulario de creación', async () => {
    render(<DocentesManager />);
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Docente')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellidos')).toBeInTheDocument();
  });

  it('3. Debe filtrar docentes por búsqueda de texto', async () => {
    const multiDocentes = [
      ...mockDocentes,
      { _id: 'd2', nombre: 'María', apellidos: 'García', email: 'maria@sima.com', turnoDisponibilidad: 'Mañana', carrerasEnsenadas: [] }
    ];
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/docentes') return Promise.resolve({ data: multiDocentes });
      if (url === '/api/admin/carreras') return Promise.resolve({ data: mockCarreras });
      return Promise.resolve({ data: [] });
    });

    render(<DocentesManager />);
    await waitFor(() => { expect(screen.getByText('Juan Pérez')).toBeInTheDocument(); });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o apellidos...');
    fireEvent.change(searchInput, { target: { value: 'María' } });

    await waitFor(() => {
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
  });

  it('4. Debe enviar datos correctos al crear un docente', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/docentes') return Promise.resolve({ data: [] });
      if (url === '/api/admin/carreras') return Promise.resolve({ data: mockCarreras });
      return Promise.resolve({ data: [] });
    });

    render(<DocentesManager />);
    await waitFor(() => { expect(screen.getByText('Crear Nuevo Docente')).toBeInTheDocument(); });

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: 'López' } });
    fireEvent.change(screen.getByPlaceholderText('ejemplo@profesor.edu'), { target: { value: 'carlos@sima.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByText('Registrar Docente'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/admin/docentes', expect.objectContaining({
        nombre: 'Carlos',
        apellidos: 'López',
        email: 'carlos@sima.com'
      }));
    });
  });

  it('5. Debe mostrar docentes en la tabla con columnas correctas', async () => {
    render(<DocentesManager />);
    await waitFor(() => {
      expect(screen.getByText('Docente')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Disponibilidad')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Carreras Asignadas')).toBeInTheDocument();
    });
  });

  it('6. Debe mostrar mensaje cuando no hay docentes', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/docentes') return Promise.resolve({ data: [] });
      if (url === '/api/admin/carreras') return Promise.resolve({ data: mockCarreras });
      return Promise.resolve({ data: [] });
    });

    render(<DocentesManager />);
    await waitFor(() => {
      expect(screen.getByText('No hay docentes registrados.')).toBeInTheDocument();
    });
  });
});
