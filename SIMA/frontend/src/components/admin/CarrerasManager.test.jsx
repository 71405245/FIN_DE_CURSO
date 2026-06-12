import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import CarrerasManager from './CarrerasManager';

// Mock de Axios
vi.mock('axios');

describe('CarrerasManager Component (Pruebas Unitarias)', () => {
  const mockCarreras = [
    { _id: 'carr1', nombre: 'Ingeniería de Sistemas', descripcion: 'Desarrollo y redes' },
    { _id: 'carr2', nombre: 'Administración de Empresas', descripcion: 'Gestión y finanzas' }
  ];

  const mockCursos = [
    { _id: 'cur1', nombre: 'Algoritmos', carrera: 'carr1' },
    { _id: 'cur2', nombre: 'Contabilidad', carrera: 'carr2' },
    { _id: 'cur3', nombre: 'Estructuras de Datos', carrera: 'carr1' } // carr1 tiene 2 cursos, carr2 tiene 1 curso
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Configurar respuesta por defecto de axios.get
    axios.get.mockImplementation((url) => {
      if (url === '/api/admin/carreras') {
        return Promise.resolve({ data: mockCarreras });
      }
      if (url === '/api/admin/cursos') {
        return Promise.resolve({ data: mockCursos });
      }
      return Promise.resolve({ data: [] });
    });
    // Mock global de confirm
    window.confirm = vi.fn().mockReturnValue(true);
    // Mock global de alert
    window.alert = vi.fn();
  });

  it('6. Debe renderizar el título de la página, la lista de carreras y la cuenta de cursos', async () => {
    render(<CarrerasManager />);

    // Esperar a que se carguen las carreras y los cursos
    await waitFor(() => {
      expect(screen.getByText('Carreras Académicas')).toBeInTheDocument();
      expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument();
      expect(screen.getByText('Administración de Empresas')).toBeInTheDocument();
    });

    // Verificar el conteo de cursos por carrera en el tag de la tabla
    // Ingeniería de Sistemas (carr1) tiene 2 cursos -> '2'
    // Administración de Empresas (carr2) tiene 1 curso -> '1'
    const systemCursosBadge = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'span' && content.includes('2');
    });
    expect(systemCursosBadge).toBeInTheDocument();

    const adminCursosBadge = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'span' && content.includes('1');
    });
    expect(adminCursosBadge).toBeInTheDocument();
  });

  it('7. Debe permitir crear una nueva carrera académica exitosamente', async () => {
    axios.post.mockResolvedValueOnce({ data: { _id: 'carr3', nombre: 'Medicina', descripcion: 'Salud' } });

    render(<CarrerasManager />);

    const nombreInput = screen.getByPlaceholderText('Ej. Ingeniería de Sistemas');
    const descInput = screen.getByPlaceholderText('Breve descripción del programa');
    const submitButton = screen.getByRole('button', { name: /Agregar/i });

    // Rellenar formulario
    fireEvent.change(nombreInput, { target: { value: 'Medicina' } });
    fireEvent.change(descInput, { target: { value: 'Salud' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/admin/carreras', {
        nombre: 'Medicina',
        descripcion: 'Salud'
      });
      // Verifica que el formulario se limpia
      expect(nombreInput.value).toBe('');
      expect(descInput.value).toBe('');
    });
  });

  it('8. Debe mostrar un mensaje de error si la creación de carrera falla en el backend', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { msg: 'La carrera ya existe.' } }
    });

    render(<CarrerasManager />);

    const nombreInput = screen.getByPlaceholderText('Ej. Ingeniería de Sistemas');
    const submitButton = screen.getByRole('button', { name: /Agregar/i });

    fireEvent.change(nombreInput, { target: { value: 'Duplicado' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('La carrera ya existe.')).toBeInTheDocument();
    });
  });

  it('9. Debe entrar en modo de edición al hacer clic en editar y permitir cancelar la edición', async () => {
    render(<CarrerasManager />);

    await waitFor(() => {
      expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument();
    });

    // Clic en el botón editar de la primera carrera (Ingeniería de Sistemas)
    const editButtons = screen.getAllByTitle('Editar');
    fireEvent.click(editButtons[0]);

    // Verificar que el formulario cambia a modo Editar
    expect(screen.getByText('Editar Carrera')).toBeInTheDocument();
    const nombreInput = screen.getByPlaceholderText('Ej. Ingeniería de Sistemas');
    expect(nombreInput.value).toBe('Ingeniería de Sistemas');

    // Clic en Cancelar
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    // Verificar que regresa al modo Nueva Carrera
    expect(screen.getByText('Nueva Carrera')).toBeInTheDocument();
    expect(nombreInput.value).toBe('');
  });

  it('10. Debe permitir eliminar una carrera tras confirmación del usuario', async () => {
    axios.delete.mockResolvedValueOnce({ data: { msg: 'Carrera eliminada' } });

    render(<CarrerasManager />);

    await waitFor(() => {
      expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument();
    });

    // Clic en eliminar la primera carrera
    const deleteButtons = screen.getAllByTitle('Eliminar');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('¿Seguro que deseas eliminar esta carrera?');
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/admin/carreras/carr1');
    });
  });
});
