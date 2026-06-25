import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import EstudiantesManager from './EstudiantesManager';

vi.mock('axios');

describe('EstudiantesManager', () => {
  const mockEstudiantes = [
    { _id: 'e1', nombre: 'Ana', apellidos: 'Torres', email: 'ana@sima.com', carrera: { _id: 'c1', nombre: 'Ingeniería de Sistemas' }, cicloActual: 3 },
    { _id: 'e2', nombre: 'Luis', apellidos: 'Gómez', email: 'luis@sima.com', carrera: { _id: 'c2', nombre: 'Administración' }, cicloActual: 5 }
  ];

  const mockCarreras = [
    { _id: 'c1', nombre: 'Ingeniería de Sistemas' },
    { _id: 'c2', nombre: 'Administración' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/estudiantes') return Promise.resolve({ data: mockEstudiantes });
      if (url === '/api/admin/carreras') return Promise.resolve({ data: mockCarreras });
      return Promise.resolve({ data: [] });
    });
  });

  it('1. Debe renderizar la tabla con la lista de estudiantes', async () => {
    render(<EstudiantesManager />);
    await waitFor(() => {
      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
      expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    });
  });

  it('2. Debe mostrar el formulario para registrar un nuevo estudiante', async () => {
    render(<EstudiantesManager />);
    await waitFor(() => {
      expect(screen.getByText('Registrar Nuevo Estudiante')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellidos')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ejemplo@alumno.edu')).toBeInTheDocument();
  });

  it('3. Debe filtrar por nombre correctamente', async () => {
    render(<EstudiantesManager />);
    await waitFor(() => { expect(screen.getByText('Ana Torres')).toBeInTheDocument(); });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o apellidos...');
    fireEvent.change(searchInput, { target: { value: 'Luis' } });

    await waitFor(() => {
      expect(screen.queryByText('Ana Torres')).not.toBeInTheDocument();
      expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    });
  });

  it('4. Debe llamar a la API al enviar el formulario de nuevo estudiante', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<EstudiantesManager />);
    await waitFor(() => { expect(screen.getByText('Registrar Nuevo Estudiante')).toBeInTheDocument(); });

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Pedro' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: 'Ramírez' } });
    fireEvent.change(screen.getByPlaceholderText('ejemplo@alumno.edu'), { target: { value: 'pedro@sima.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByText('Matricular'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/admin/estudiantes', expect.objectContaining({
        nombre: 'Pedro',
        apellidos: 'Ramírez',
        email: 'pedro@sima.com'
      }));
    });
  });

  it('5. Debe mostrar los ciclos de cada estudiante', async () => {
    render(<EstudiantesManager />);
    await waitFor(() => {
      expect(screen.getByText('Ciclo 3')).toBeInTheDocument();
      expect(screen.getByText('Ciclo 5')).toBeInTheDocument();
    });
  });

  it('6. Debe mostrar encabezados correctos en la tabla', async () => {
    render(<EstudiantesManager />);
    await waitFor(() => {
      expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Carrera')).toBeInTheDocument();
      expect(screen.getByText('Ciclo')).toBeInTheDocument();
    });
  });

  it('7. Debe filtrar por carrera', async () => {
    render(<EstudiantesManager />);
    await waitFor(() => { expect(screen.getByText('Ana Torres')).toBeInTheDocument(); });

    const carreraSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(carreraSelect, { target: { value: 'c2' } });

    await waitFor(() => {
      expect(screen.queryByText('Ana Torres')).not.toBeInTheDocument();
      expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    });
  });
});
