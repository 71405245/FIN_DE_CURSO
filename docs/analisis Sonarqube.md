# 3. Evaluación de Calidad de Código mediante SonarQube

## 3.1 Configuración del Entorno de Análisis

Para evaluar la calidad técnica del sistema se utilizó **SonarQube** como herramienta de análisis estático de código. La plataforma fue integrada con el repositorio del proyecto para ejecutar inspecciones automáticas sobre el código fuente del frontend y backend.

### Objetivos del análisis

- Detectar errores potenciales (*Bugs*).
- Identificar vulnerabilidades de seguridad.
- Detectar problemas de mantenibilidad (*Code Smells*).
- Evaluar duplicación de código.
- Analizar cobertura de pruebas.
- Medir deuda técnica.
- Determinar el nivel de calidad general del proyecto.

### Evidencia de Configuración

**Figura 1. Configuración del proyecto en SonarQube**

> **INSERTAR CAPTURA AQUÍ**

---

## 3.2 Resultados Iniciales (Antes de las Correcciones)

Se realizó una primera ejecución de SonarQube sobre el sistema sin aplicar mejoras, obteniéndose los siguientes resultados.

### Métricas Iniciales

| Métrica | Valor Inicial |
|----------|----------|
| Vulnerabilities | 23 |
| Reliability Issues | 173 |
| Maintainability Issues | 297 |
| Security Hotspots | 14 |
| Coverage | 16.0 % |
| Duplications | 8.5 % |

### Dashboard Inicial

**Figura 2. Dashboard general de SonarQube (Antes)**

> **INSERTAR CAPTURA AQUÍ**

---

## 3.3 Interpretación Técnica de los Resultados Iniciales

El análisis inicial evidenció múltiples problemas que afectaban la calidad general del sistema.

### Vulnerabilidades de Seguridad

Se identificaron **23 vulnerabilidades** que representaban riesgos potenciales para la seguridad de la aplicación.

Entre los principales problemas detectados se encontraron:

- Uso de funciones criptográficamente inseguras.
- Posibles credenciales expuestas en código.
- Validaciones insuficientes en algunos componentes.
- Configuraciones que podrían facilitar ataques comunes.

Estas vulnerabilidades impactaban directamente el nivel de seguridad del sistema y requerían corrección inmediata.

### Problemas de Fiabilidad (Reliability Issues)

Se detectaron **173 incidencias** relacionadas con fiabilidad.

Los principales problemas identificados fueron:

- Posibles excepciones no controladas.
- Variables declaradas y no utilizadas.
- Lógica propensa a errores de ejecución.
- Condiciones susceptibles de producir comportamientos inesperados.

Estas incidencias aumentaban el riesgo de fallos durante la ejecución del sistema.

### Problemas de Mantenibilidad (Code Smells)

SonarQube identificó **297 problemas de mantenibilidad**.

Entre ellos destacaban:

- Código duplicado.
- Métodos excesivamente extensos.
- Complejidad cognitiva elevada.
- Funciones con múltiples responsabilidades.
- Imports y dependencias innecesarias.

La elevada cantidad de *Code Smells* incrementaba significativamente la deuda técnica del proyecto.

### Cobertura de Pruebas

La cobertura registrada fue de apenas **16 %**.

Este resultado indicaba que una gran parte de la lógica del sistema no estaba siendo validada mediante pruebas automatizadas, incrementando el riesgo de regresiones durante futuras modificaciones.

### Duplicación de Código

El análisis reportó una duplicación del **8.5 %**.

La existencia de código repetido dificulta el mantenimiento, aumenta el costo de evolución del software y favorece la aparición de errores inconsistentes entre módulos similares.

---

## 3.4 Componentes Críticos Detectados

Durante la inspección se identificaron componentes que concentraban la mayor cantidad de incidencias.

### Componentes con problemas relevantes

| Componente | Tipo de Problema |
|------------|------------|
| adminController.js | Alta complejidad cognitiva |
| planificacionController.js | Complejidad elevada |
| Componentes de interfaz | Problemas de accesibilidad |
| Módulos de validación | Riesgos de seguridad |

### Evidencia de Hallazgos

**Figura 3. Vulnerabilidades detectadas**

> **INSERTAR CAPTURA AQUÍ**

---

**Figura 4. Problemas de mantenibilidad**

> **INSERTAR CAPTURA AQUÍ**

---

**Figura 5. Security Hotspots**

> **INSERTAR CAPTURA AQUÍ**

---

## 3.5 Acciones Correctivas Implementadas

Con base en los resultados obtenidos se ejecutó un proceso de refactorización y fortalecimiento del sistema.

Las principales mejoras implementadas fueron:

### Seguridad

- Eliminación de vulnerabilidades detectadas.
- Corrección de configuraciones inseguras.
- Revisión de autenticación y validaciones.
- Sustitución de prácticas consideradas inseguras.

### Mantenibilidad

- Refactorización de métodos complejos.
- Eliminación de código redundante.
- Simplificación de estructuras condicionales.
- Optimización de organización modular.

### Calidad de Código

- Eliminación de imports innecesarios.
- Corrección de advertencias de SonarQube.
- Mejora de nomenclatura y legibilidad.

### Testing

- Incorporación de nuevas pruebas automatizadas.
- Incremento de cobertura de código.

### Evidencia de Correcciones

**Figura 6. Ejemplo de corrección implementada**

> **INSERTAR CAPTURA AQUÍ**

---

## 3.6 Resultados Posteriores a las Correcciones

Tras aplicar las mejoras se ejecutó nuevamente el análisis de SonarQube.

### Métricas Finales

| Métrica | Valor Final |
|----------|----------|
| Vulnerabilities | 0 |
| Reliability Issues | 27 |
| Maintainability Issues | 18 |
| Security Hotspots | 1 |
| Coverage | 38.0 % |
| Duplications | 5.9 % |

### Dashboard Final

**Figura 7. Dashboard general de SonarQube (Después)**

> **INSERTAR CAPTURA AQUÍ**

---

## 3.7 Comparación Antes vs Después

| Indicador | Antes | Después | Mejora |
|------------|---------|----------|---------|
| Vulnerabilities | 23 | 0 | 100 % |
| Reliability Issues | 173 | 27 | 84.4 % |
| Maintainability Issues | 297 | 18 | 93.9 % |
| Security Hotspots | 14 | 1 | 92.8 % |
| Coverage | 16.0 % | 38.0 % | 137.5 % |
| Duplications | 8.5 % | 5.9 % | 30.5 % |

### Evidencia Comparativa

**Figura 8. Comparación de métricas antes y después**

> **INSERTAR CAPTURA AQUÍ**

---

## 3.8 Evaluación del Impacto de las Mejoras

Las correcciones implementadas permitieron reducir significativamente los riesgos técnicos identificados durante la evaluación inicial.

Los resultados muestran:

- Eliminación total de vulnerabilidades.
- Reducción significativa de problemas de fiabilidad.
- Disminución sustancial de problemas de mantenibilidad.
- Incremento considerable de cobertura de pruebas.
- Reducción de duplicación de código.
- Disminución de riesgos asociados a *Security Hotspots*.

Estas mejoras incrementan la calidad técnica del sistema y facilitan su evolución futura.

---

## 3.9 Conclusiones del Análisis SonarQube

El proceso de evaluación permitió identificar y corregir problemas críticos relacionados con seguridad, mantenibilidad y fiabilidad del sistema.

Los resultados obtenidos evidencian una mejora significativa respecto al estado inicial, logrando eliminar la totalidad de vulnerabilidades detectadas y reducir más del 90 % de los problemas de mantenibilidad.

Asimismo, el incremento de la cobertura de pruebas fortalece la capacidad de validación del sistema y reduce el riesgo de regresiones futuras.

En consecuencia, puede concluirse que la aplicación alcanzó un nivel de calidad técnica considerablemente superior al obtenido en la evaluación inicial, cumpliendo los objetivos establecidos para el aseguramiento de calidad mediante SonarQube.
