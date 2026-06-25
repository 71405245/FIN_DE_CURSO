# Arquitectura de Agentes y Módulos Lógicos (SIMA)

El Sistema Integral de Matrícula Académica (SIMA) emplea una arquitectura basada en módulos especializados (agentes) que manejan diferentes áreas de responsabilidad dentro de la plataforma. Este documento describe los agentes principales y algoritmos autónomos que operan en el ecosistema.

## 1. Agente de Recomendación de Cursos (AI / Greedy Engine)
Este es el motor central de inteligencia del sistema, encargado de procesar la malla curricular y optimizar la matrícula.

- **Responsabilidad:** Analizar el historial académico del estudiante, los cursos aprobados, los prerrequisitos y las secciones disponibles para generar una propuesta de horario óptima.
- **Algoritmo:** Implementa un algoritmo *Greedy* (Voraz) que prioriza cursos de ciclos inferiores que son prerrequisitos de múltiples materias futuras, garantizando que el estudiante no se estanque en su malla.
- **Estado:** Estabilizado y robusto ante caídas de red; maneja la concurrencia durante procesos de matrícula masiva.

## 2. Agente Administrativo (Admin Panel Core)
Encargado de la orquestación de datos maestros.

- **Responsabilidades:** 
  - Gestión integral de entidades CRUD (Carreras, Estudiantes, Docentes, Cursos y Secciones).
  - Verificación de integridad referencial (ej. no permitir eliminar carreras con alumnos inscritos).
  - Importación masiva de usuarios y asignación automática de credenciales encriptadas (bcrypt).
- **Módulo de Planificación:** Evalúa el número de alumnos, capacidad de aulas y carga docente para detectar conflictos de horarios.
- **Módulo de Recursos:** Monitorea en tiempo real el estado del servidor (CPU, Memoria RAM y Uptime) asegurando la observabilidad de la infraestructura.

## 3. Agente Docente (Faculty Module)
Orquesta la interacción de los catedráticos con el registro académico.

- **Responsabilidades:**
  - Obtención dinámica de carga académica asignada.
  - **Agrupación Inteligente:** Clasificación en tiempo real de salones basada en la carrera a la que pertenece el curso (General, Ingeniería, Negocios, etc.).
  - Captura y persistencia de calificaciones oficiales con trazabilidad por estudiante y sección.
- **Analítica:** Calcula promedios en tiempo real y tasas de aprobación por sección.

## 4. Agente Estudiantil (Student Portal)
Gestiona la experiencia del alumno final.

- **Responsabilidades:**
  - Renderizado de dashboard minimalista con respuesta fluida y lógica de restricción académica.
  - Consumo del agente de recomendación para la selección de cursos.
  - Visualización de horario generado en formato calendario (sidebar estático).

## 5. Agente de Sesión y Seguridad (Auth Middleware)
Actúa como guardián de todas las interacciones HTTP.

- **Responsabilidades:**
  - Emisión y validación de JSON Web Tokens (JWT) gestionados a través de Cookies / LocalStorage.
  - Protección de rutas a través de middleware basado en Roles (ADMIN, DOCENTE, ESTUDIANTE).
  - Encriptación y ofuscación de datos sensibles.

---

### Flujo de Interacción entre Agentes
1. El **Agente Administrativo** inicializa el entorno cargando mallas, aulas y docentes.
2. El **Agente Estudiantil** solicita matrícula; esta petición es interceptada por el **Agente de Sesión** para validación.
3. Tras la validación, el **Agente de Recomendación** procesa el perfil y devuelve el horario óptimo.
4. Finalizado el semestre, el **Agente Docente** registra el rendimiento, lo que alimenta la base de datos para la siguiente iteración del **Agente de Recomendación**.
