# Documentación de Algoritmos de IA y Restricciones (Versión SIMA MERN)

Este documento detalla a nivel técnico los algoritmos principales encargados de la generación de horarios (IA), la validación de créditos y la trazabilidad de rendimiento (APM) implementados en el ecosistema SIMA.

## 1. Algoritmo de Generación de Horarios (Motor IA)
El núcleo de recomendación utiliza un motor de **Búsqueda en Profundidad (DFS)** optimizado con **Backtracking** y **Poda Heurística**, diseñado para manejar miles de combinaciones posibles en milisegundos.

### 1.1 Lógica Central (DFS con Backtracking)
El algoritmo (implementado en Node.js) toma las secciones disponibles de los cursos permitidos y explora las ramas de combinaciones válidas, eliminando soluciones que presentan cruces de horario.

```javascript
// Ubicación: controllers/estudianteController.js (generarHorarioIA)

function backtrack(cursoIndex, horarioActual) {
  // PODA: Prevenir latencia excesiva ante explosión combinatoria
  if (todasLasAlternativas.length >= 150) return;

  // Caso Base: Todos los cursos solicitados han sido evaluados
  if (cursoIndex === cursosAProcesar.length) {
    todasLasAlternativas.push([...horarioActual]);
    return;
  }

  const cursoActual = cursosAProcesar[cursoIndex];
  const opcionesSeccion = seccionesPorCurso[cursoActual._id];

  for (const seccion of opcionesSeccion) {
    // PODA 2: Validación de Cruce de Horarios (Hard Constraint)
    let cruza = false;
    for (const asignada of horarioActual) {
      if (checkOverlap(seccion, asignada)) {
        cruza = true;
        break;
      }
    }

    if (!cruza) {
      horarioActual.push(seccion);
      backtrack(cursoIndex + 1, horarioActual);
      horarioActual.pop(); // Backtrack
    }
  }
  
  // Posibilidad de horarios parciales si no se logran todos los cursos
  backtrack(cursoIndex + 1, horarioActual);
}
```

### 1.2 Sistema de Puntaje y Ranking (Soft Constraints)
Una vez halladas las combinaciones, se aplica una función de evaluación para priorizar la mejor experiencia para el alumno:

- **Maximización Académica**: +1000 puntos por cada curso matriculado.
- **Preferencia de Turno**: +500 puntos si la sección coincide con el turno deseado (Mañana/Tarde/Noche).
- **Concentración de Días**: +200 puntos si se mantiene bajo el límite de días a asistir.
- **Optimización de Tiempo**: Penalización proporcional a la cantidad de días de asistencia para evitar traslados innecesarios.

### 1.3 Sistema de Flexibilización Adaptativa
Si las restricciones son demasiado estrictas, el motor devuelve las top 5 combinaciones "mejores posibles", indicando al usuario qué porcentaje de sus preferencias se logró cumplir.

---

## 2. Algoritmo de Límite de Créditos Dinámico
A diferencia de sistemas estáticos, SIMA evalúa el historial académico en tiempo real para aplicar restricciones de carga lectiva.

### 2.1 Lógica de Reiterancia de Desaprobación (Estado Crítico)
Se define una restricción dura basada en el rendimiento histórico acumulable:
```javascript
// Ubicación: controllers/estudianteController.js (getPerfil)

const calificaciones = await Calificacion.find({ estudiante: estudianteId });

// [ALGORITMO] Solo penalizamos con 15 CR si el alumno ha jalado un mismo curso 
// 3+ veces y aún NO lo ha aprobado (Jale Activo).
const historialPorCurso = {};
calificaciones.forEach(c => {
  const cursoId = String(c.curso?._id);
  if (!historialPorCurso[cursoId]) historialPorCurso[cursoId] = { aprobado: false, jales: 0 };
  if (c.aprobado) historialPorCurso[cursoId].aprobado = true;
  else historialPorCurso[cursoId].jales++;
});

const cursosCriticos = Object.values(historialPorCurso).filter(h => h.jales >= 3 && !h.aprobado);
const limiteCreditos = cursosCriticos.length > 0 ? 15 : 22;
```

### 2.2 Penalidad por Costo de Curso (Costo Real)
Como complemento, el sistema implementa una función de **Peso Dinámico**, donde el costo en créditos de un curso aumenta según las veces que se ha desaprobado, obligando al motor de IA a priorizar el avance académico esencial.
```javascript
async function obtenerCostoRealCurso(estudianteId, cursoId, creditosBase) {
  const jales = await Calificacion.countDocuments({ estudiante: estudianteId, curso: cursoId, aprobado: false });
  // El costo real es: Créditos Base + Cantidad de Jales previos
  return creditosBase + jales;
}
```

---

## 3. Módulo de Observabilidad APM (Nuevo)
Para garantizar la estabilidad del algoritmo bajo carga masiva, se implementó un sistema de monitoreo de rendimiento integrado (Application Performance Monitoring).

- **Estructura**: Buffer Circular in-memory (O(1)).
- **Métricas**: Captura tiempo de proceso, bytes de payload (antes de compresión) y bytes reales transmitidos (después de GZIP).
- **Propósito**: Detectar degradación en el generador de horarios antes de que afecte a la base de usuarios.

```javascript
// Buffer circular para métricas sin impacto en memoria
const APM_BUFFER_SIZE = 500;
global.apiMetricsIndex = (global.apiMetricsIndex + 1) % APM_BUFFER_SIZE;
```

### 2.2 Penalidad por Costo de Curso

Como complemento, el sistema tiene una función `obtener_costo_real_curso` que aumenta el "peso" (costo en créditos) de un curso en base a cuántas veces se ha jalado (`curso.creditos + veces_desaprobado`). Esto obliga al motor DFS a priorizar que el estudiante lleve solo lo necesario.
