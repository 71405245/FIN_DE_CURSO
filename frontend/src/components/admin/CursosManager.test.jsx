import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import CursosManager from './CursosManager';

vi.mock('axios');

describe('CursosManager', () => {
  const mockCursos = [
    { _id: 'cu1', codigo: 'SIS101', nombre: 'Programación I', creditos: 4, ciclo: 1, carrera: { _id: 'c1', nombre: 'Sistemas' }, area: 'Básica', tipo: 'Obligatorio', prerrequisitos: [] },
    { _id: 'cu2', codigo: 'MAT101', nombre: 'Cálculo I', creditos: 4, ciclo: 1, carrera: { _id: 'c1', nombre: 'Sistemas' }, area: 'Ciencias', tipo: 'Obligatorio', prerrequisitos: [] }
  ];

  const mockCarreras = [
    { _id: 'c1', nombre: 'Sistemas' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/cursos') return Promise.resolve({ data: mockCursos });
      if (url === '/api/admin/carreras') return Promise.resolve({ data: mockCarreras });
      return Promise.resolve({ data: [] });
    });
  });

  it('1. Debe renderizar la lista de cursos', async () => {
    render(<CursosManager />);
    await waitFor(() => {
      expect(screen.getByText('SIS101')).toBeInTheDocument();
      expect(screen.getByText('Programación I')).toBeInTheDocument();
    });
  });

  it('2. Debe mostrar el formulario de nuevo curso', async () => {
    render(<CursosManager />);
    await waitFor(() => {
      expect(screen.getByText('Nuevo Curso')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Ej. SIS101')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Programación I')).toBeInTheDocument();
  });

  it('3. Debe filtrar cursos por texto', async () => {
    render(<CursosManager />);
    await waitFor(() => { expect(screen.getByText('SIS101')).toBeInTheDocument(); });

    const searchInput = screen.getByPlaceholderText('Buscar por código, nombre o área...');
    fireEvent.change(searchInput, { target: { value: 'Cálculo' } });

    await waitFor(() => {
      expect(screen.queryByText('Programación I')).not.toBeInTheDocument();
      expect(screen.getByText('Cálculo I')).toBeInTheDocument();
    });
  });

  it('4. Debe llamar a la API al agregar un curso', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<CursosManager />);
    await waitFor(() => { expect(screen.getByPlaceholderText('Ej. SIS101')).toBeInTheDocument(); });

    fireEvent.change(screen.getByPlaceholderText('Ej. SIS101'), { target: { value: 'BD101' } });
    fireEvent.change(screen.getByPlaceholderText('Ej. Programación I'), { target: { value: 'Bases de Datos' } });
    fireEvent.change(screen.getByPlaceholderText('4'), { target: { value: '3' } });
    fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '2' } });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'c1' } });

    fireEvent.click(screen.getByText('Agregar Curso'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/admin/cursos', expect.objectContaining({
        codigo: 'BD101',
        nombre: 'Bases de Datos'
      }));
    });
  });

  it('5. Debe mostrar encabezados correctos en la tabla', async () => {
    render(<CursosManager />);
    await waitFor(() => {
      expect(screen.getByText('Código')).toBeInTheDocument();
      expect(screen.getByText('Asignatura')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Tipo')).toBeInTheDocument();
    });
  });

  it('6. Debe mostrar el total de cursos en el header', async () => {
    render(<CursosManager />);
    await waitFor(() => {
      expect(screen.getByText(/cursos registrados/)).toBeInTheDocument();
    });
  });

  it('7. Debe mostrar "Obligatorio" como badge para cursos con ese tipo', async () => {
    render(<CursosManager />);
    await waitFor(() => {
      const badges = screen.getAllByText('Obligatorio');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
