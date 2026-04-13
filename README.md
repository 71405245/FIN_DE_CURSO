# 🚀 Sistema Web Inteligente para la Optimización del Proceso de Matrícula Universitaria

## 📌 Descripción del Proyecto

Este proyecto consiste en el desarrollo de un sistema web inteligente orientado a estudiantes universitarios, el cual permite optimizar el proceso de planificación de la matrícula académica mediante la generación y recomendación automática de horarios.

El sistema utiliza un enfoque basado en inteligencia artificial para analizar las preferencias, restricciones y disponibilidad del estudiante, generando combinaciones de horarios válidas y recomendando aquellas que mejor se adapten a sus necesidades.

Su objetivo principal es mejorar la toma de decisiones durante la matrícula, reducir errores en la selección de cursos y optimizar el uso del tiempo del estudiante, brindando una experiencia más eficiente, intuitiva y personalizada.

## 📌 1. Documento de selección del enfoque del proyecto
📊 [Ver documento](docs/enfoque-proyecto.md)

---

## 🎯 2. Declaración de la visión del proyecto


Para estudiantes universitarios de la Universidad Continental  
Quiénes necesitan optimizar su proceso de matrícula académica  
El Sistema Web Inteligente de Matrícula Académica es un sistema web  
Que permite generar y recomendar automáticamente horarios académicos óptimos considerando las preferencias, restricciones y disponibilidad del estudiante  
A diferencia de los procesos manuales o sistemas tradicionales de matrícula  
Nuestro producto proporciona recomendaciones personalizadas, mejora la toma de decisiones y reduce errores en la selección de cursos  

---

## 📄 3. Project Charter
📊 [Ver documento](docs/project-charter.md)

---

## 📌 4. Registro de supuestos y restricciones
📄 [Ver documento](docs/supuestos-restricciones.md)

---

## 👥 5. Declaración del equipo del proyecto
👥 [Ver documento](docs/equipo-proyecto.md)

---

## 💻 6. Repositorio GitHub operativo

🔗 Repositorio: https://github.com/71405245/FIN_DE_CURSO

---

## 📊 7. Documento inicial del problema (primer borrador)

### 📌 Descripción del problema

En el proceso actual de matrícula universitaria, los estudiantes deben seleccionar manualmente sus cursos y horarios, enfrentándose a múltiples combinaciones posibles de secciones, docentes y horarios. Esta tarea resulta compleja debido a la necesidad de evitar cruces de horarios, considerar la disponibilidad personal y optimizar la distribución del tiempo.

Además, la falta de herramientas inteligentes que apoyen la toma de decisiones provoca que los estudiantes inviertan un tiempo considerable en este proceso, aumentando la probabilidad de cometer errores y generando horarios poco eficientes.

---

### 🎯 Problema central

La dificultad de los estudiantes para construir horarios académicos óptimos debido a la complejidad de las combinaciones de cursos, restricciones personales y la falta de herramientas automatizadas que faciliten la toma de decisiones.

---

### ⚙️ Variables del problema

- Disponibilidad horaria del estudiante  
- Oferta académica (cursos, secciones, docentes)  
- Distribución de horarios  
- Cantidad de cursos a matricular  
- Preferencias personales  

---

### ⚠️ Complejidad del problema

El problema presenta un alto nivel de complejidad debido a la interacción de múltiples variables, la existencia de restricciones simultáneas y la necesidad de optimizar diferentes criterios, lo cual dificulta su resolución mediante métodos manuales.

---

## 📋 8. Lista preliminar de requerimientos

### 🟢 Especificación de Requerimientos Funcionales (SMART)

| ID | Nombre del Requerimiento | Descripción Técnica (Trigger / Lógica / Resultado) | Criterio de Aceptación |
|----|--------------------------|---------------------------------------------------|------------------------|
| RF-01 | Registro de preferencias del estudiante | Trigger: El estudiante accede al formulario de preferencias. Lógica: El sistema valida campos obligatorios (cursos, horario, días, créditos). Resultado: Almacena las preferencias del usuario. | Dado que el usuario ingresa datos válidos, cuando presiona “Guardar”, entonces el sistema persiste la información y muestra confirmación en ≤ 1 s. |
| RF-02 | Visualización de la oferta académica | Trigger: El usuario solicita ver cursos. Lógica: Consulta base de datos de cursos y secciones. Resultado: Lista paginada de cursos con detalles. | Dado que existen cursos, cuando accede al módulo, entonces se muestran al menos 10 registros por página con filtros. |
| RF-03 | Detección de cruces de horario | Trigger: Evaluación de secciones seleccionadas. Lógica: Compara intervalos de tiempo y detecta solapamientos. Resultado: Marca combinaciones inválidas. | Dado un traslape, cuando se valida, entonces el sistema identifica el conflicto en ≤ 200 ms. |
| RF-04 | Generación de combinaciones de horarios | Trigger: Solicitud del usuario. Lógica: Genera combinaciones y filtra conflictos. Resultado: Lista de horarios válidos. | Dado 3 a 7 cursos, cuando se genera, entonces el sistema produce combinaciones válidas en ≤ 5 s. |
| RF-05 | Recomendación de horarios óptimos | Trigger: Combinaciones generadas. Lógica: Aplica puntuación según preferencias. Resultado: Ordena combinaciones. | Dado combinaciones válidas, cuando se evalúan, entonces retorna top 5 en ≤ 1 s. |
| RF-06 | Edición de preferencias | Trigger: Usuario modifica datos. Lógica: Valida y actualiza información. Resultado: Cambios persistidos. | Dado un cambio válido, cuando guarda, entonces el sistema actualiza correctamente los datos. |
| RF-07 | Visualización gráfica del horario | Trigger: Selección de combinación. Lógica: Representa datos en grilla semanal. Resultado: Vista tipo calendario. | Dado un horario, cuando se visualiza, entonces se muestra correctamente sin superposición. |
| RF-08 | Exportación de horarios | Trigger: Solicitud de exportación. Lógica: Genera archivo PDF o imagen. Resultado: Descarga del archivo. | Dado un horario, cuando exporta, entonces el sistema descarga el archivo en ≤ 3 s. |
---

### 🔸 Requerimientos no funcionales (RNF)

# 9. Especificación de Requerimientos No Funcionales (SMART)

| ID | Nombre del Requerimiento | Descripción Técnica | Criterio de Aceptación |
|----|--------------------------|--------------------|------------------------|
| RNF-01 | Rendimiento | El sistema debe procesar la generación de horarios de manera eficiente, optimizando el uso de recursos y tiempo de ejecución. | Dado que el usuario solicita generar horarios, cuando el sistema ejecuta el proceso, entonces debe completarlo en ≤ 5 segundos. |
| RNF-02 | Usabilidad | El sistema debe ser intuitivo, fácil de usar y permitir una interacción clara para el usuario. | Dado un usuario nuevo, cuando utiliza el sistema, entonces debe completar el proceso en ≤ 3 minutos sin errores. |
| RNF-03 | Compatibilidad | El sistema debe ser accesible desde diferentes navegadores web modernos. | Dado que el usuario accede desde Chrome, Edge o Firefox, cuando utiliza el sistema, entonces debe funcionar correctamente sin fallos. |
| RNF-04 | Seguridad | El sistema debe proteger la información del usuario y controlar el acceso mediante autenticación. | Dado que el usuario inicia sesión, cuando accede al sistema, entonces sus datos deben estar protegidos y no ser accesibles por terceros. |
| RNF-05 | Disponibilidad | El sistema debe estar disponible para su uso durante el tiempo de operación definido. | Dado que el usuario accede al sistema, cuando lo utiliza, entonces debe estar disponible al menos el 95% del tiempo. |
