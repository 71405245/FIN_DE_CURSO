# 🖥️ Pruebas Frontend — SIMA  
## Pruebas Unitarias y Análisis de Cobertura de Código (Vitest + React Testing Library)

Este documento describe la estrategia de validación implementada en el frontend del sistema **SIMA - Sistema Inteligente de Matrícula Académica**, incluyendo las pruebas unitarias realizadas sobre componentes React y el análisis de cobertura de código obtenido mediante herramientas automatizadas.

Las pruebas permiten garantizar la estabilidad de la interfaz, validar los flujos principales del usuario y mejorar la mantenibilidad del software.

---

# 🧪 1. Pruebas Unitarias del Frontend

## 📌 Objetivo

Validar el correcto funcionamiento de los componentes principales desarrollados en React, verificando la interacción del usuario, manejo de estados, navegación, formularios y comunicación con servicios externos mediante mocks controlados.

---

## 🚀 Cómo ejecutar las pruebas

Para ejecutar la suite de pruebas unitarias del frontend:

```bash
npm run test
```

Ejecutar desde el directorio:

```bash
frontend/
```

---

# 📂 Archivos de prueba implementados

## 🔐 1. Página de Inicio de Sesión

Archivo:

```text
src/pages/Login.test.jsx
```

Se implementaron pruebas para validar el flujo de autenticación:

### Prueba 1: Renderizado del formulario

Verifica:

- Campo de correo electrónico.
- Campo de contraseña.
- Elementos visuales del login.
- Botón de acceso al sistema.

---

### Prueba 2: Credenciales inválidas

Simula un inicio de sesión incorrecto mediante un mock de `axios.post`.

Validaciones:

- Respuesta negativa del servidor.
- Mensaje de error mostrado al usuario.
- Permanencia en la pantalla de login.

---

### Prueba 3: Redirección del administrador

Simula autenticación con rol:

```text
ADMIN
```

Validando:

- Guardado del token.
- Redirección al panel administrativo.

Ruta:

```text
/admin
```

---

### Prueba 4: Redirección del estudiante

Simula autenticación con rol:

```text
ESTUDIANTE
```

Validando:

- Navegación correcta hacia el panel estudiantil.

Ruta:

```text
/estudiante
```

---

### Prueba 5: Redirección del docente

Simula autenticación con rol:

```text
DOCENTE
```

Validando:

- Acceso correcto al módulo docente.

Ruta:

```text
/docente
```

---

# 🏛️ 2. Gestor Administrativo de Carreras

Archivo:

```text
src/components/admin/CarrerasManager.test.jsx
```

Se realizaron pruebas sobre operaciones CRUD del módulo administrativo.

---

### Prueba 6: Renderizado del listado de carreras

Valida:

- Carga correcta de carreras.
- Visualización de información.
- Renderizado de tabla administrativa.

---

### Prueba 7: Creación de una carrera

Valida:

- Ingreso de datos.
- Envío del formulario.
- Petición POST hacia la API.

Endpoint:

```text
/api/admin/carreras
```

---

### Prueba 8: Edición de carrera

Verifica:

- Selección de registro.
- Carga de información existente.
- Cambio del formulario a modo actualización.

---

### Prueba 9: Cancelación de edición

Valida:

- Limpieza de campos.
- Retorno al modo creación.

---

### Prueba 10: Eliminación de carrera

Valida:

- Confirmación del usuario.
- Ejecución de petición DELETE.
- Eliminación del registro seleccionado.

---

# 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Vitest | Ejecución de pruebas unitarias |
| React Testing Library | Validación de componentes React |
| jsdom | Simulación del navegador |
| Axios Mocking | Simulación de peticiones HTTP |
| React Router Mocking | Validación de navegación |

---

---

# 📊 2. Análisis de Cobertura de Código Frontend

## 📌 Objetivo

El análisis de cobertura permite medir qué porcentaje del código frontend está validado mediante pruebas automatizadas.

Se evalúan:

- Sentencias.
- Líneas.
- Funciones.
- Bifurcaciones lógicas.

---

## 🚀 Ejecución del análisis de cobertura

Ejecutar:

```bash
npm run test:coverage
```

El comando genera:

```text
coverage/
```

con reportes:

- Consola.
- JSON.
- HTML interactivo.

---

# 📈 Resultados obtenidos

Componentes evaluados:

- `Login.jsx`
- `CarrerasManager.jsx`

| Métrica | Porcentaje | Estado |
|---|---:|---|
| Sentencias | 92.00% | Excelente |
| Bifurcaciones | 72.72% | Óptimo |
| Funciones | 100.00% | Excelente |
| Líneas | 92.95% | Excelente |

---

# 📂 Cobertura por componente

## 🔐 Login.jsx

Cobertura:

```text
92.00%
```

Las líneas no cubiertas corresponden principalmente a:

- Excepciones de red.
- Manejo de errores mediante bloques `catch`.

---

## 🏛️ CarrerasManager.jsx

Cobertura:

```text
93.47%
```

Las líneas pendientes corresponden a:

- Excepciones.
- Callbacks secundarios.
- Escenarios poco frecuentes.

---

# ⚙️ Configuración técnica

Archivo:

```text
vite.config.js
```

Configuración utilizada:

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/setupTests.js',
  include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  },
}
```

---

# 🧩 Proveedor de cobertura

Se utiliza:

```text
@vitest/coverage-v8
```

Este proveedor permite obtener métricas de cobertura utilizando las capacidades internas de V8 en Node.js, reduciendo el tiempo de ejecución de pruebas.

---

# 🌐 Reporte visual HTML

Después de ejecutar:

```bash
npm run test:coverage
```

se genera:

```text
frontend/coverage/index.html
```

Este reporte permite revisar:

- Código ejecutado.
- Líneas sin cobertura.
- Áreas donde se pueden agregar nuevas pruebas.

---

# ✅ Conclusión

Las pruebas frontend implementadas en SIMA permiten validar los principales flujos de interacción del usuario, asegurando calidad, estabilidad y mantenibilidad del sistema mediante pruebas automatizadas y métricas objetivas de cobertura.
