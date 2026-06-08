# Software Design Description (SDD): SIMA

## 1. Introducción
Este documento detalla el diseño técnico y las especificaciones del Sistema Integral de Matrícula Académica (SIMA).

## 2. Diseño de la Base de Datos (Modelos Mongoose)

### User
- `nombre`, `apellidos`, `email`, `password` (encriptado).
- `rol`: Enum [ADMIN, DOCENTE, ESTUDIANTE].
- `carrera`: Referencia a `Carrera`.
- `cicloActual`: Numérico.

### Curso
- `nombre`, `codigo`, `creditos`.
- `prerrequisitos`: Array de Strings (códigos de curso).
- `carrera`: Referencia a `Carrera`.
- `ciclo`: Ciclo al que pertenece el curso.

### Seccion
- `codigoSeccion`, `aula`, `cupoMaximo`.
- `curso`: Referencia a `Curso`.
- `docente`: Referencia a `User`.
- `horario`: Texto descriptivo (ej. "LU-MI 08:00-10:00").
- `dias`: Array de Strings (ej. ["LU", "MI"]).
- `horaInicio`, `horaFin`: Strings para validación de IA.
- `estudiantesMatriculados`: Array de Referencias a `User`.

## 3. Lógica del Agente de Recomendación (AI Scheduler)
El motor de IA utiliza un algoritmo de **Backtracking** optimizado:
1.  **Entrada**: Preferencias de turno, cantidad de cursos y días máximos.
2.  **Proceso**:
    - Filtra cursos pendientes según historial académico.
    - Realiza una búsqueda DFS sobre las secciones disponibles.
    - **Poda**: Descarta ramas que presenten solapamientos (`checkOverlap`).
3.  **Evaluación**: Aplica heurísticas de puntuación para priorizar horarios que cumplan con los turnos solicitados.

## 4. Middleware de Seguridad
- Implementación de **JSON Web Tokens (JWT)**.
- El middleware `auth` extrae el token de los headers, lo decodifica y adjunta el usuario al objeto `req`.
- Validaciones secundarias verifican que el rol del usuario coincida con la ruta protegida.

## 5. Módulo APM (Observabilidad)
Ubicado en `server.js`, utiliza un **Buffer Circular** de tamaño O(1) para registrar métricas de API:
- `method`, `route`, `duration`, `status`.
- Conteo de bytes antes y después de la compresión GZIP.
- Esto permite al Administrador visualizar la carga del servidor sin degradar la experiencia del usuario.

## 6. Frontend y Comunicaciones
- **Tecnología**: React + Axios.
- **Patrón**: Consumo de API RESTful.
- **Componentes**: Calendario dinámico, Gráficos de Chart.js para historial, y Modales de selección interactiva.
