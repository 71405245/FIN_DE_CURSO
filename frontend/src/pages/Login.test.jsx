import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';

// Mock de Axios
vi.mock('axios');

// Mock de useNavigate de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Credenciales de prueba (mocked, no son credenciales reales del sistema)
const TEST_CREDENTIALS = {
  admin: { email: 'admin@sima.com', password: 'test-password-mock' },
  student: { email: 'estudiante@sima.com', password: 'test-password-mock' },
  invalid: { email: 'wrong@sima.com', password: 'test-invalid-mock' }
};

describe('Login Component (Pruebas Unitarias)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Debe renderizar los campos de formulario y el botón de ingreso', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Mostrar contraseña', { selector: 'button' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ejemplo@sima.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar al Sistema' })).toBeInTheDocument();
  });

  it('2. Debe permitir alternar la visibilidad de la contraseña al hacer clic en el botón del ojo', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleButton = screen.getByLabelText('Mostrar contraseña');

    // Inicialmente es tipo password
    expect(passwordInput.type).toBe('password');

    // Clic para mostrar
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText('Ocultar contraseña')).toBeInTheDocument();

    // Clic para ocultar
    fireEvent.click(screen.getByLabelText('Ocultar contraseña'));
    expect(passwordInput.type).toBe('password');
  });

  it('3. Debe mostrar un mensaje de error si las credenciales son inválidas', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { msg: 'Credenciales inválidas' } }
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('ejemplo@sima.edu');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Entrar al Sistema' });

    // Simular campos con credenciales inválidas (mocked)
    fireEvent.change(emailInput, { target: { value: TEST_CREDENTIALS.invalid.email } });
    fireEvent.change(passwordInput, { target: { value: TEST_CREDENTIALS.invalid.password } });
    fireEvent.click(submitButton);

    // Verificar llamada axios
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: TEST_CREDENTIALS.invalid.email,
      password: TEST_CREDENTIALS.invalid.password
    });

    // Esperar a que se muestre el error en pantalla
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  it('4. Debe almacenar token/usuario y redirigir a /admin si el rol del usuario es ADMIN', async () => {
    const fakeUserData = {
      token: 'fake-admin-jwt',
      user: { id: 'admin1', rol: 'ADMIN', nombre: 'Administrador' }
    };
    axios.post.mockResolvedValueOnce({ data: fakeUserData });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('ejemplo@sima.edu');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Entrar al Sistema' });

    fireEvent.change(emailInput, { target: { value: TEST_CREDENTIALS.admin.email } });
    fireEvent.change(passwordInput, { target: { value: TEST_CREDENTIALS.admin.password } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-admin-jwt');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(fakeUserData.user);
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('5. Debe almacenar token/usuario y redirigir a /estudiante si el rol del usuario es ESTUDIANTE', async () => {
    const fakeUserData = {
      token: 'fake-estudiante-jwt',
      user: { id: 'estudiante1', rol: 'ESTUDIANTE', nombre: 'Ana Estudiante' }
    };
    axios.post.mockResolvedValueOnce({ data: fakeUserData });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('ejemplo@sima.edu');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Entrar al Sistema' });

    fireEvent.change(emailInput, { target: { value: TEST_CREDENTIALS.student.email } });
    fireEvent.change(passwordInput, { target: { value: TEST_CREDENTIALS.student.password } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-estudiante-jwt');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(fakeUserData.user);
      expect(mockNavigate).toHaveBeenCalledWith('/estudiante');
    });
  });
});
