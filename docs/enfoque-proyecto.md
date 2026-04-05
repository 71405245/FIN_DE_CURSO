# 📊 Documento de Selección del Enfoque del Proyecto

## 🧠 Proyecto:
**Sistema web inteligente para la optimización del proceso de matrícula universitaria mediante un módulo de recomendación de horarios basado en inteligencia artificial**

---

## 1. Introducción

El presente documento tiene como objetivo definir y justificar el enfoque tecnológico y metodológico seleccionado para el desarrollo del sistema propuesto. Para ello, se analizan diferentes alternativas de solución, comparando sus ventajas y limitaciones, con el fin de elegir la opción más adecuada en función del problema identificado, las restricciones del proyecto y los objetivos planteados.

---

## 2. Alternativas de solución consideradas

Para abordar el problema de la planificación de horarios académicos, se identificaron las siguientes alternativas:

### 🔹 Alternativa 1: Proceso manual
Consiste en que el estudiante seleccione sus horarios revisando manualmente la oferta académica sin ningún tipo de asistencia automatizada.

**Ventajas:**
- No requiere desarrollo tecnológico  
- Bajo costo  

**Desventajas:**
- Alto consumo de tiempo  
- Mayor probabilidad de errores  
- No optimiza la toma de decisiones  

---

### 🔹 Alternativa 2: Sistema basado en reglas
Sistema que genera horarios en función de reglas predefinidas (por ejemplo: evitar cruces, respetar disponibilidad).

**Ventajas:**
- Fácil de implementar  
- Resultados predecibles  

**Desventajas:**
- Baja flexibilidad  
- No se adapta a preferencias complejas  
- Limitada capacidad de optimización  

---

### 🔹 Alternativa 3: Sistema con inteligencia artificial (seleccionada)
Sistema que utiliza algoritmos de recomendación para generar y sugerir horarios óptimos en base a múltiples variables.

**Ventajas:**
- Mayor precisión en recomendaciones  
- Adaptabilidad a preferencias del usuario  
- Capacidad de optimizar múltiples criterios  

**Desventajas:**
- Mayor complejidad de implementación  
- Requiere mayor tiempo de desarrollo  

---

## 3. Evaluación comparativa

| Criterio            | Proceso Manual | Sistema por Reglas | Sistema con IA |
|--------------------|---------------|-------------------|----------------|
| Automatización     | Baja          | Media             | Alta           |
| Precisión          | Baja          | Media             | Alta           |
| Adaptabilidad      | Baja          | Baja              | Alta           |
| Complejidad        | Baja          | Media             | Alta           |
| Eficiencia         | Baja          | Media             | Alta           |

---

## 4. Selección del enfoque

Luego del análisis comparativo, se selecciona la alternativa basada en inteligencia artificial, debido a su capacidad para ofrecer soluciones más eficientes, adaptables y alineadas con las necesidades del usuario.

Este enfoque permite abordar la complejidad del problema, considerando múltiples variables y restricciones, lo que no es posible lograr de manera eficiente mediante métodos manuales o sistemas basados únicamente en reglas.

---

## 5. Arquitectura y stack tecnológico

### 🔹 Frontend:
- React.js  
Se selecciona por su capacidad para crear interfaces dinámicas, reutilizables y de alto rendimiento.

### 🔹 Backend:
- Node.js  
Permite desarrollar servicios rápidos y escalables, ideales para aplicaciones web modernas.

### 🔹 Base de datos:
- PostgreSQL  
Ofrece robustez, integridad de datos y buen rendimiento en consultas complejas.

### 🔹 Módulo de IA:
- Algoritmo de recomendación (basado en lógica heurística o IA)  
Encargado de generar combinaciones de horarios y priorizar las más óptimas.

---

## 6. Metodología de desarrollo

Se adopta la metodología ágil Scrum debido a su enfoque iterativo e incremental, lo cual permite adaptarse a cambios durante el desarrollo del proyecto.

### 🔹 Distribución de Sprints:

- **Sprint 0:** Análisis del problema y planificación  
- **Sprint 1:** Diseño del sistema  
- **Sprint 2:** Desarrollo de funcionalidades principales  
- **Sprint 3:** Pruebas y validación  

Scrum facilita la organización del equipo, el seguimiento del progreso y la entrega continua de valor.

---

## 7. Justificación final

El enfoque seleccionado combina tecnologías modernas con un modelo de desarrollo ágil, permitiendo construir una solución eficiente, escalable y alineada con los objetivos del proyecto.

La incorporación de un módulo de recomendación basado en inteligencia artificial representa un valor diferencial, ya que mejora significativamente la experiencia del usuario y optimiza el proceso de toma de decisiones durante la matrícula académica.
