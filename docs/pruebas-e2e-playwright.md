# Pruebas de Extremo a Extremo (E2E) con Playwright

Este documento detalla la configuración, escenarios validados y el proceso de resolución de conflictos de las **pruebas de extremo a extremo (E2E)** implementadas con **Playwright** en el sistema SIMA. Estas pruebas automatizan la interacción con navegadores reales para verificar la integridad del portal de login.

---

## 🚀 Cómo ejecutar las pruebas
Asegúrate de que tanto el backend (en el puerto `5001`) como el frontend (en el puerto `5173`) estén corriendo localmente. Luego, navega al directorio `frontend` en tu terminal y corre:

```bash
# Ejecutar todas las pruebas E2E con Playwright
npm run test:e2e:playwright
```

Para ver el reporte interactivo tras la ejecución en caso de algún fallo:
```bash
npx playwright show-report
```

---

## 📂 Detalle de los Escenarios (`tests/e2e/login.spec.js`)

Se configuró un flujo en serie (`mode: 'serial'`) con un único worker para evitar interferencias de sesiones del navegador y colisiones de estados.

### Escenario 1: Renderizado Inicial
*   **Objetivo**: Garantizar que los elementos del formulario de login carguen correctamente y tengan un aspecto profesional.
*   **Aserciones**:
    *   Presencia del título de bienvenida (`¡Bienvenido!`) y subtítulo de instrucciones.
    *   Visibilidad de las cajas de texto de Correo y Contraseña con sus placeholders correspondientes (`ejemplo@sima.edu` y `••••••••`).
    *   Existencia del botón de login con el texto `"Entrar al Sistema"`.

### Escenario 2: Intento Fallido de Autenticación
*   **Objetivo**: Validar que la interfaz notifique de forma visual cuando el usuario ingresa datos de acceso incorrectos.
*   **Flujo**:
    *   Limpia las cajas y escribe `invalido@sima.com` y `badpass`.
    *   Hace click en "Entrar al Sistema".
    *   Verifica la aparición de la alerta customizada (`.alert-custom`) con el texto `"Credenciales inválidas"`.

### Escenario 3: Inicio de Sesión de Administrador Exitoso
*   **Objetivo**: Probar la autenticación real contra la base de datos de desarrollo y asegurar la redirección al panel de control.
*   **Flujo**:
    *   Limpia las cajas de texto y escribe `admin@sima.com` con la contraseña `admin`.
    *   Hace click en enviar.
    *   Espera la transición de página y la carga asíncrona de los componentes (usando la estrategia `waitUntil: 'domcontentloaded'` para soportar lazy loading).
    *   Verifica que la URL del navegador contenga `/admin`.

---

## 🔧 Diagnóstico y Resolución de Conflictos

> [!IMPORTANT]
> **El Conflicto con Docker Desktop (Puerto 5000)**:
> Inicialmente, el backend estaba configurado para correr en el puerto `5000`. Al ejecutar las pruebas E2E, las solicitudes a `/api/auth/login` recibían un error `500` e `"Invalid credentials"`.
> 
> Tras un análisis de puertos (`netstat`), se detectó que el backend de **Docker Desktop** (`com.docker.backend.exe`) estaba ocupando y escuchando en el puerto `5000` del host. Esto interceptaba las peticiones del proxy de Vite.
> 
> **Solución**:
> 1. Cambiamos el puerto de escucha del backend de Node a **`5001`** (puerto por defecto en `.env`).
> 2. Actualizamos la propiedad `proxy.target` del archivo `vite.config.js` para apuntar a `http://localhost:5001`.
> 3. Con esto se aislaron los entornos de pruebas y se logró un pase de pruebas exitoso.
