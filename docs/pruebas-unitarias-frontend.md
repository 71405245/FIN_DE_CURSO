# Documentación de Pruebas Unitarias del Frontend (Vitest & React Testing Library)

Este documento detalla el entorno, propósito y flujo de las **pruebas unitarias** implementadas en los componentes principales de la interfaz de usuario del sistema SIMA. Se utiliza **Vitest** como motor de ejecución ultra-rápido y **React Testing Library** para emular el comportamiento del DOM.

---

## 🚀 Cómo ejecutar las pruebas
Para correr la suite de pruebas unitarias en el frontend, navega al directorio `frontend` en tu terminal y corre el siguiente comando:

```bash
# Ejecutar todas las pruebas unitarias de Vitest
npm run test
```

---

## 📂 Detalle de los Archivos de Prueba Unitarios

### 1. Pruebas de la Página de Inicio de Sesión (`src/pages/Login.test.jsx`)
*Este archivo implementa **5 pruebas** que validan la interfaz del formulario de Login y la lógica de redirección basada en roles utilizando mocks controlados de `axios` y `react-router-dom`.*

*   **Prueba 1: Renderizado del formulario**:
    *   Verifica que la pantalla de bienvenida renderice de forma correcta los campos esenciales: la caja de correo electrónico, la caja de contraseña (tipo password), los iconos de interfaz y el botón principal "Entrar al Sistema".
*   **Prueba 2: Mostrar error ante credenciales incorrectas**:
    *   Simula un comportamiento donde el usuario escribe datos de acceso no válidos y hace click en enviar. El test intercepta la llamada con un mock de rechazo de `axios.post` y valida que aparezca el banner visual de error con el texto `"Credenciales inválidas"`.
*   **Prueba 3: Redirección de Administrador**:
    *   Simula un login exitoso inyectando una respuesta mock de `axios` con rol `ADMIN`. Asegura que el flujo guarde el Token en el `localStorage` y use el hook `useNavigate` para redirigir al usuario al panel de administración `/admin`.
*   **Prueba 4: Redirección de Estudiante**:
    *   Simula el login exitoso de un alumno (rol `ESTUDIANTE`) y valida la navegación inmediata hacia el panel respectivo `/estudiante`.
*   **Prueba 5: Redirección de Docente**:
    *   Valida la autenticación exitosa de un profesor (rol `DOCENTE`) y su redirección hacia el panel `/docente`.

---

### 2. Pruebas del Gestor de Carreras (`src/components/admin/CarrerasManager.test.jsx`)
*Consta de **5 pruebas** que testean el ciclo de vida completo (CRUD) del componente de administración de facultades del panel de control de Admin.*

*   **Prueba 6: Renderizado del listado de carreras**:
    *   Inyecta datos mock de carreras existentes y comprueba que se listen correctamente en una tabla interactiva, mostrando datos clave como el nombre de la carrera (ej. "Ingeniería de Sistemas") y el conteo de cursos vinculados.
*   **Prueba 7: Creación de una nueva carrera**:
    *   Completa el formulario de entrada (Nombre y Descripción) utilizando `fireEvent` y simula el submit. Valida que se invoque la API POST de `/api/admin/carreras` con los datos esperados y que el formulario se limpie al finalizar.
*   **Prueba 8: Modo de edición**:
    *   Simula el click en el botón de edición de una fila. Valida que los datos de la carrera seleccionada se carguen en los campos de texto del formulario y que el botón de envío cambie a "Actualizar Carrera".
*   **Prueba 9: Cancelación de edición**:
    *   Verifica que al hacer click en el botón "Cancelar" durante una edición activa, los inputs se limpien y el formulario retorne a su modo de creación por defecto.
*   **Prueba 10: Eliminación con confirmación**:
    *   Prueba el flujo de borrado. Valida que al hacer click en el icono de eliminación, se dispare una ventana emergente de confirmación (mock de `window.confirm`). Si el usuario acepta, se verifica que se emita la petición `DELETE` de Axios apuntando al ID de la carrera correspondiente.

---

## 🛠️ Tecnologías y Mocks Utilizados
1.  **Vitest**: Motor de pruebas moderno compatible con Vite.
2.  **jsdom**: Entorno virtual que simula una API de navegador en memoria.
3.  **Mocking de Axios**: Permite interceptar llamadas AJAX a `/api/*` y retornar respuestas simuladas sin depender de un servidor de bases de datos activo para las pruebas unitarias.
4.  **Mocking de React Router**: Permite interceptar llamadas de navegación (`useNavigate`) para asegurar que los usuarios sean redirigidos a los paneles apropiados.
