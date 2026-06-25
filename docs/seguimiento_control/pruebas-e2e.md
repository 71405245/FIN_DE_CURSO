# 🌐 Pruebas de Extremo a Extremo (E2E) — SIMA

Este documento detalla la configuración, escenarios validados y resolución de conflictos de las pruebas de extremo a extremo (**E2E**) implementadas en el sistema SIMA.

Las pruebas E2E permiten validar el funcionamiento completo del sistema simulando la interacción real del usuario con la aplicación web.

Se utilizan dos herramientas complementarias:

- **Playwright:** Automatización de interacción con navegadores reales.
- **Cypress:** Validación automatizada de flujos críticos de usuario.

---

# 🎭 Pruebas de Extremo a Extremo (E2E) con Playwright

Este documento detalla la configuración, escenarios validados y el proceso de resolución de conflictos de las pruebas de extremo a extremo (**E2E**) implementadas con **Playwright** en el sistema SIMA.

Estas pruebas automatizan la interacción con navegadores reales para verificar la integridad del portal de login.

---

## 🚀 Cómo ejecutar las pruebas con Playwright

Asegúrate de que tanto el backend (puerto `5001`) como el frontend (puerto `5173`) estén corriendo localmente.

Luego, navega al directorio:

```bash
frontend/
```

Ejecutar:

```bash
# Ejecutar todas las pruebas E2E con Playwright
npm run test:e2e:playwright
```

Para ver el reporte interactivo:

```bash
npx playwright show-report
```

---

## 📂 Detalle de los Escenarios (`tests/e2e/login.spec.js`)

Se configuró un flujo en serie:

```javascript
mode: 'serial'
```

con un único worker para evitar interferencias de sesiones del navegador y colisiones de estados.

---

## Escenario 1: Renderizado Inicial

**Objetivo:**  
Garantizar que los elementos del formulario de login carguen correctamente.

**Aserciones:**

- Presencia del título:

```
¡Bienvenido!
```

- Visibilidad de campos:

```
Correo
Contraseña
```

- Validación de placeholders:

```
ejemplo@sima.edu
••••••••
```

- Existencia del botón:

```
Entrar al Sistema
```

---

## Escenario 2: Intento Fallido de Autenticación

**Objetivo:**  
Validar que la interfaz notifique cuando el usuario ingresa datos incorrectos.

**Flujo:**

- Limpia los campos.
- Escribe:

```
invalido@sima.com
badpass
```

- Hace click en:

```
Entrar al Sistema
```

- Verifica la alerta:

```
Credenciales inválidas
```

---

## Escenario 3: Inicio de Sesión de Administrador Exitoso

**Objetivo:**  
Probar la autenticación real contra el backend y validar la navegación al panel administrativo.

**Datos utilizados:**

```
admin@sima.com

admin
```

**Flujo:**

- Ingresa credenciales.
- Envía formulario.
- Espera la carga de componentes.
- Verifica redirección:

```
/admin
```

---

# 🔧 Diagnóstico y Resolución de Conflictos Playwright

> [!IMPORTANT]
> Inicialmente el backend estaba configurado para ejecutarse en el puerto `5000`.

Durante las pruebas E2E las solicitudes:

```
/api/auth/login
```

generaban errores:

```
500
Invalid credentials
```

---

## Causa encontrada

Mediante análisis de puertos:

```bash
netstat
```

se detectó que:

```
Docker Desktop Backend
```

ocupaba el puerto `5000`.

Esto interfería con el proxy de Vite y las peticiones hacia el backend.

---

## Solución aplicada

1. Cambio del puerto backend:

Antes:

```
5000
```

Después:

```
5001
```

2. Actualización del proxy en:

```
vite.config.js
```

Configurando:

```
http://localhost:5001
```

3. Separación correcta del entorno de pruebas.

Resultado:

```
Pruebas E2E ejecutadas correctamente
```

---

---

# 🌐 Pruebas de Extremo a Extremo (E2E) con Cypress

Este documento detalla la configuración y los escenarios de pruebas de extremo a extremo (**E2E**) implementadas con **Cypress** en el sistema SIMA.

Cypress complementa la suite de Playwright validando la robustez de los flujos principales de autenticación.

---

## 🚀 Cómo ejecutar las pruebas con Cypress

Asegúrate de tener:

Backend:

```
Puerto 5001
```

Frontend:

```
Puerto 5173
```

corriendo en segundo plano.

Ejecutar:

```bash
# Ejecutar Cypress en modo headless
npm run test:e2e:cypress
```

Para abrir la interfaz interactiva:

```bash
npx cypress open
```

---

## 📂 Detalle de los Escenarios (`cypress/e2e/login.cy.js`)

Cypress ejecuta pruebas secuenciales visitando:

```
/
```

y validando la redirección hacia:

```
/login
```

---

## Escenario 1: Renderizado Inicial

**Aserciones:**

Valida:

```html
h2.welcome-text
```

con contenido:

```
¡Bienvenido!
```

Además verifica:

- Input de correo visible.
- Input de contraseña visible.
- Elementos principales del formulario.

---

## Escenario 2: Validar Mensaje de Credenciales Incorrectas

**Flujo:**

Limpia:

```javascript
.clear()
```

Escribe:

```
invalido@sima.com

badpass
```

Hace click en:

```
Entrar al Sistema
```

Valida que aparezca:

```
Credenciales inválidas
```

---

## Escenario 3: Inicio de Sesión de Administrador Exitoso

**Flujo:**

Ingresa:

```
admin@sima.com

admin
```

Luego:

- Ejecuta login.
- Verifica navegación.
- Comprueba URL:

```
/admin
```

- Valida carga del panel administrativo.

---

# 💡 Detalles Críticos de Implementación Cypress

## 1. Limpieza de Inputs (`.clear()`)

La pantalla Login tenía valores precargados:

```
admin@sima.com
admin
```

Cypress mediante:

```javascript
.type()
```

agregaba texto al valor existente.

Esto generaba errores como:

```
admin@sima.comadmin@sima.com
```

---

## Solución aplicada

Se agregó:

```javascript
.clear()
```

antes de cada escritura:

```javascript
cy.get(input)
.clear()
.type(valor)
```

Esto garantiza que los datos enviados sean correctos.

---

## 2. Configuración Cypress (`cypress.config.js`)

La aplicación utiliza:

```javascript
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
  },
});
```

---

# ✅ Conclusión

La implementación de pruebas E2E con Playwright y Cypress permite validar los principales flujos del sistema SIMA desde la perspectiva del usuario final, asegurando la correcta integración entre frontend, backend y autenticación.
