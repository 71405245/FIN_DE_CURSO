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

### 🔹 Lenguaje de programación:
- Python  
Se selecciona por su simplicidad, legibilidad y amplia adopción en el desarrollo de aplicaciones web y sistemas inteligentes.

---

### 🔹 Framework backend:
- Django  
Framework robusto que permite el desarrollo rápido de aplicaciones web seguras y escalables. Incluye funcionalidades integradas como autenticación, ORM y administración automática.

---

### 🔹 Base de datos:
- MySQL / SQL Server  
Se utilizan sistemas de gestión de bases de datos relacionales que garantizan integridad, consistencia y eficiencia en el manejo de datos académicos.

---

### 🔹 Frontend:
- HTML, CSS, Bootstrap 5  
Permiten construir interfaces web responsivas y fáciles de usar, mejorando la experiencia del usuario.

---

### 🔹 Generación de documentos:
- ReportLab / xhtml2pdf  
Herramientas utilizadas para la generación de reportes y exportación de horarios en formato PDF.

---

### 🔹 Componentes adicionales:

- ORM de Django: Facilita la interacción con la base de datos mediante objetos, reduciendo la complejidad del código SQL.  
- Sistema de autenticación integrado: Permite gestionar usuarios y roles de manera segura.  
- Lógica personalizada para IA: Implementación de algoritmos para la recomendación de cursos y generación de horarios óptimos.
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

## 8. Justificación técnica del enfoque seleccionado

El enfoque basado en inteligencia artificial se justifica técnicamente debido a la naturaleza compleja del problema, el cual involucra múltiples variables, restricciones y criterios de optimización que deben ser evaluados de manera simultánea.

Desde un punto de vista computacional, la generación de horarios académicos puede modelarse como un problema de combinación y optimización, donde el número de posibles configuraciones crece exponencialmente en función de la cantidad de cursos y secciones disponibles. Este tipo de problema resulta ineficiente de resolver mediante métodos manuales o enfoques basados únicamente en reglas estáticas.

El uso de un módulo de recomendación permite aplicar técnicas heurísticas o algoritmos de optimización que reducen el espacio de búsqueda y priorizan soluciones que se ajustan mejor a las preferencias del usuario, mejorando la eficiencia del sistema y la calidad de las recomendaciones.

Asimismo, la elección del stack tecnológico responde a criterios de rendimiento, escalabilidad y mantenibilidad:

- **Python** se selecciona por su simplicidad, legibilidad y amplia adopción en el desarrollo de aplicaciones web y soluciones basadas en inteligencia artificial.
- **Django** permite un desarrollo rápido y seguro gracias a sus componentes integrados, como el ORM, el sistema de autenticación y la administración automática.
- **MySQL / SQL Server** garantizan la integridad, consistencia y eficiencia en el manejo de datos relacionales.
- **HTML, CSS y Bootstrap 5** permiten construir interfaces web responsivas y accesibles, mejorando la experiencia del usuario.
- **ReportLab / xhtml2pdf** facilitan la generación de reportes y exportación de horarios en formato PDF.

Adicionalmente, el uso del ORM de Django simplifica la interacción con la base de datos, reduciendo la complejidad del desarrollo, mientras que el sistema de autenticación integrado permite gestionar usuarios y roles de manera segura.

Finalmente, la adopción de la metodología Scrum se justifica por su capacidad de gestionar proyectos con alto grado de incertidumbre y cambios frecuentes en los requerimientos, permitiendo entregas incrementales y mejora continua del sistema.

En conjunto, este enfoque tecnológico y metodológico proporciona una solución robusta, escalable y alineada con los objetivos del proyecto.
