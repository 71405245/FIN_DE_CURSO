# Reporte y Configuración de Cobertura de Código del Frontend (Vitest & v8)

Este documento describe la configuración técnica y los resultados obtenidos en el **análisis de cobertura de código (Code Coverage)** del frontend en el sistema SIMA. Este reporte ayuda a identificar qué porcentaje de líneas de código, funciones, sentencias y bifurcaciones lógicas están validadas por la suite de pruebas unitarias.

---

## 🚀 Cómo ejecutar el análisis de cobertura
Para ejecutar las pruebas y generar de forma automática un reporte visual interactivo en HTML, navega al directorio `frontend` en tu terminal y ejecuta:

```bash
# Ejecutar pruebas y generar reporte de cobertura
npm run test:coverage
```

Este comando analizará el código y creará una carpeta llamada `coverage/` en el directorio raíz del frontend con los resultados en múltiples formatos.

---

## 📊 Resultados Obtenidos

La ejecución de las pruebas unitarias cubrió los dos componentes clave del frontend (`Login.jsx` y `CarrerasManager.jsx`), logrando los siguientes porcentajes:

| Métrica | Porcentaje Logrado | Estado |
| :--- | :---: | :---: |
| **Sentencias (Statements)** | **92.00%** | Excelente |
| **Bifurcaciones (Branches)** | **72.72%** | Óptimo |
| **Funciones (Functions)** | **100.00%** | Excelente |
| **Líneas (Lines)** | **92.95%** | Excelente |

### Desglose por Archivo:
*   **`Login.jsx`**: Cobertura de líneas del **92.00%**. Los únicos flujos no cubiertos corresponden a excepciones de red genéricas del bloque `catch` (líneas 30-32).
*   **`CarrerasManager.jsx`**: Cobertura de líneas del **93.47%**. Las líneas no cubiertas son excepciones y callbacks aislados en la desestimación de cuadros de diálogo.

---

## 🛠️ Configuración Técnica (`vite.config.js`)

La integración del reporte de cobertura se encuentra configurada en el archivo de configuración del compilador Vite. A continuación se detalla la sección relevante:

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/setupTests.js',
  include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  coverage: {
    provider: 'v8', // Proveedor nativo de Node.js v8 para análisis veloz
    reporter: ['text', 'json', 'html'], // Formato por consola, JSON y carpeta web HTML
  },
}
```

### Proveedor Utilizado:
Se emplea `@vitest/coverage-v8`, que aprovecha las APIs de perfilado internas de V8 de Node.js. Esto evita tener que instrumentar el código compilado (a diferencia de herramientas más lentas como Istanbul), manteniendo los tiempos de compilación de pruebas por debajo de **1.5 segundos**.

---

## 📂 Reporte Visual HTML
Tras correr el comando de cobertura, puedes abrir el archivo `frontend/coverage/index.html` en cualquier navegador web para revisar de manera interactiva línea por línea cuáles han sido ejecutadas durante los tests y cuáles requieren atención para futuros casos de prueba.
