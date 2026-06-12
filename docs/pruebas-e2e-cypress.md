# Pruebas de Extremo a Extremo (E2E) con Cypress

Este documento detalla la configuración y los escenarios de **pruebas de extremo a extremo (E2E)** implementadas con **Cypress** en el sistema SIMA. Cypress complementa la suite de Playwright para validar la robustez de la autenticación de usuarios.

---

## 🚀 Cómo ejecutar las pruebas
Asegúrate de tener tanto el backend (puerto `5001`) como el frontend (puerto `5173`) corriendo en segundo plano. Luego, navega al directorio `frontend` en tu terminal y ejecuta:

```bash
# Ejecutar Cypress en modo headless (consola rápida)
npm run test:e2e:cypress
```

Si prefieres abrir la interfaz interactiva de Cypress para ver las pruebas en vivo paso a paso:
```bash
npx cypress open
```

---

## 📂 Detalle de los Escenarios (`cypress/e2e/login.cy.js`)

Cypress ejecuta tres pruebas secuenciales visitando la raíz `/` en cada bloque `beforeEach` (la cual redirige automáticamente a `/login`).

### Escenario 1: Renderizado Inicial
*   **Aserciones**:
    *   Valida la existencia del elemento de bienvenida (`h2.welcome-text`) con el valor `"¡Bienvenido!"`.
    *   Verifica que los inputs de correo electrónico y contraseña estén presentes y visibles para el usuario.

### Escenario 2: Validar Mensaje de Credenciales Incorrectas
*   **Flujo**:
    *   Limpia el campo de email con `.clear()` y escribe `invalido@sima.com`.
    *   Limpia el campo de password con `.clear()` y escribe `badpass`.
    *   Hace click en el botón "Entrar al Sistema".
    *   Verifica que la alerta `.alert-custom` sea visible y contenga la advertencia `"Credenciales inválidas"`.

### Escenario 3: Inicio de Sesión de Admin Exitoso
*   **Flujo**:
    *   Limpia la entrada de correo y escribe `admin@sima.com`.
    *   Limpia la entrada de contraseña y escribe `admin`.
    *   Hace click en el botón de submit.
    *   Verifica que el router navegue al panel de control asertando que la URL del navegador incluya `/admin`.
    *   Verifica que se muestre el título principal del panel del administrador.

---

## 💡 Detalles Críticos de Implementación y Solución de Fallos

### 1. Limpieza de Inputs (`.clear()`)
En el diseño de la interfaz de usuario de SIMA, la página de Login cuenta con valores de inicio de sesión de prueba precargados en el estado de React (`admin@sima.com` y `admin`). 

En Cypress, la función `.type()` por defecto agrega caracteres al final del valor que ya existe en el input, en lugar de reemplazarlo. Esto causaba fallos en los que Cypress intentaba autenticarse con correos concatenados del tipo `admin@sima.comadmin@sima.com` o contraseñas duplicadas.

*   **Solución**: Se inyectó la llamada `.clear()` antes de cada comando `.type()`, forzando a vaciar los inputs y garantizando que el texto enviado a la API de desarrollo sea exactamente el configurado en la prueba.

### 2. Configuración (`cypress.config.js`)
La base URL se configuró a `http://localhost:5173` para integrarse de forma transparente con el puerto local de desarrollo de Vite:

```javascript
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false, // Desactivado para pruebas ligeras y rápidas sin sobrecarga
  },
});
```
