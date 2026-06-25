# Product Backlog - Sistema Integral de Matrícula Académica (SIMA)

## Sprint 1 - Fundamentos y Base del Sistema

| ID Épica | Como (Rol) | Deseo | Para | ID HU | Como (Rol) | Deseo | Para | Criterios de Aceptación | Prioridad | Estimación | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EPICA-1 Planificación de Horarios | Estudiante | visualizar cursos disponibles | conocer mi carga académica | HU01 | Estudiante | consultar cursos desde BD | elegir asignaturas disponibles | El sistema muestra cursos asociados a la carrera y ciclo del estudiante | Alta | 7 | MongoDB | Terminado |
| EPICA-1 Planificación de Horarios | Administrador | gestionar estructura académica | mantener información actualizada | HU02 | Administrador | registrar carreras y cursos | administrar oferta académica | CRUD funcional de carreras y cursos | Alta | 8 | MongoDB + Mongoose | Terminado |
| EPICA-4 Seguridad y Acceso | Usuario | ingresar al sistema | acceder según permisos | HU03 | Usuario | autenticarse mediante JWT | proteger información | Login funcional con validación de credenciales y roles | Crítica | 5 | Backend API | Terminado |
| EPICA-4 Seguridad y Acceso | Sistema | controlar accesos | evitar acciones no autorizadas | HU04 | Sistema | validar roles ADMIN/DOCENTE/ESTUDIANTE | proteger módulos internos | Middleware JWT restringe rutas correctamente | Crítica | 5 | HU03 | Terminado |


---

# Sprint 2 - Funcionalidades Académicas Principales

| ID Épica | Como (Rol) | Deseo | Para | ID HU | Como (Rol) | Deseo | Para | Criterios de Aceptación | Prioridad | Estimación | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EPICA-1 Planificación de Horarios | Estudiante | generar combinaciones de horarios | encontrar opciones sin cruces | HU05 | Sistema | ejecutar algoritmo Backtracking DFS | generar horarios válidos | El algoritmo elimina conflictos de horario automáticamente | Alta | 10 | Cursos + Secciones | Terminado |
| EPICA-1 Planificación de Horarios | Sistema | detectar conflictos académicos | evitar horarios imposibles | HU06 | Sistema | validar cruces de días y horas | garantizar horarios correctos | No permite superposición de cursos | Alta | 7 | HU05 | Terminado |
| EPICA-2 Experiencia del Usuario | Estudiante | visualizar horarios gráficamente | entender mi planificación | HU07 | Estudiante | ver calendario semanal | organizar mis clases | Vista gráfica funcional con horarios asignados | Media | 6 | HU05 | Terminado |
| EPICA-2 Experiencia del Usuario | Estudiante | descargar mi horario | guardar información académica | HU08 | Estudiante | exportar PDF | compartir planificación | Generación correcta de PDF del horario | Media | 5 | HU07 | Terminado |


---

# Sprint 3 - Personalización e Inteligencia Artificial

| ID Épica | Como (Rol) | Deseo | Para | ID HU | Como (Rol) | Deseo | Para | Criterios de Aceptación | Prioridad | Estimación | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EPICA-3 Inteligencia Artificial | Estudiante | registrar preferencias horarias | personalizar recomendaciones | HU09 | Estudiante | configurar turno y disponibilidad | recibir mejores opciones | Preferencias guardadas correctamente | Alta | 6 | HU05 | Terminado |
| EPICA-3 Inteligencia Artificial | Estudiante | recibir recomendaciones inteligentes | elegir mejor horario | HU10 | Sistema | aplicar MRV + Forward Checking | optimizar resultados | Genera alternativas ordenadas por puntuación | Alta | 10 | Backtracking DFS | Terminado |
| EPICA-3 Inteligencia Artificial | Sistema | priorizar mejores combinaciones | mejorar experiencia | HU11 | Sistema | aplicar scoring heurístico | recomendar horarios óptimos | Las alternativas consideran turno y concentración de días | Alta | 8 | HU10 | Terminado |
| EPICA-2 Experiencia del Usuario | Estudiante | modificar preferencias | actualizar mis criterios | HU12 | Estudiante | editar preferencias guardadas | mantener configuración actualizada | Edición funcional de preferencias | Media | 4 | HU09 | Terminado |


---

# Sprint 4 - Gestión Docente y Administración Académica

| ID Épica | Como (Rol) | Deseo | Para | ID HU | Como (Rol) | Deseo | Para | Criterios de Aceptación | Prioridad | Estimación | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EPICA-5 Gestión Docente | Docente | visualizar mis cursos asignados | conocer mi carga académica | HU13 | Docente | consultar secciones asignadas | organizar actividades | Dashboard docente funcional | Alta | 6 | Usuarios + Secciones | Terminado |
| EPICA-5 Gestión Docente | Docente | registrar calificaciones | gestionar evaluación | HU14 | Docente | ingresar notas de estudiantes | actualizar historial académico | Validación de notas entre 0 y 20 | Alta | 7 | HU13 | Terminado |
| EPICA-5 Gestión Docente | Administrador | gestionar docentes y secciones | organizar la oferta académica | HU15 | Administrador | asignar docentes, aulas y cupos | administrar matrícula | CRUD completo de secciones | Alta | 8 | MongoDB | Terminado |
| EPICA-5 Gestión Docente | Sistema | controlar carga docente | evitar sobrecarga | HU16 | Sistema | validar conflictos docentes | mejorar planificación | No permite docentes con horarios cruzados | Media | 6 | HU15 | Terminado |


---

# Sprint 5 - Calidad, Seguridad y Sostenibilidad

| ID Épica | Como (Rol) | Deseo | Para | ID HU | Como (Rol) | Deseo | Para | Criterios de Aceptación | Prioridad | Estimación | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EPICA-6 Seguridad y Calidad | Sistema | proteger la plataforma | evitar vulnerabilidades | HU17 | Sistema | implementar OWASP Top 10 | mejorar seguridad | Mitigaciones aplicadas y auditoría SonarQube A | Crítica | 10 | Backend | Terminado |
| EPICA-6 Seguridad y Calidad | Sistema | proteger ataques externos | asegurar API | HU18 | Sistema | aplicar Helmet, Rate Limit y Sanitización | prevenir ataques | API protegida contra inyección y fuerza bruta | Crítica | 8 | HU17 | Terminado |
| EPICA-6 Seguridad y Calidad | Equipo desarrollo | validar funcionamiento | garantizar estabilidad | HU19 | Tester | ejecutar pruebas unitarias frontend/backend | detectar errores | Cobertura y pruebas automatizadas funcionando | Alta | 8 | Código final | Terminado |
| EPICA-6 Seguridad y Calidad | Equipo desarrollo | validar experiencia completa | simular usuario real | HU20 | Tester | ejecutar Cypress y Playwright | validar flujo completo | Login y procesos críticos aprobados | Alta | 8 | Frontend + Backend | Terminado |
| EPICA-6 Green Code | Administrador | monitorear recursos | optimizar consumo | HU21 | Sistema | medir CPU/RAM/CO2 | mejorar sostenibilidad | Dashboard APM funcional | Media | 7 | Backend | Terminado |


---

# Sprint 6 - Cierre, Optimización y Despliegue

| ID Épica | Como (Rol) | Deseo | Para | ID HU | Como (Rol) | Deseo | Para | Criterios de Aceptación | Prioridad | Estimación | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EPICA-7 Plataforma Final | Usuario | usar sistema rápido | mejorar experiencia | HU22 | Sistema | optimizar consultas y rendimiento | reducir tiempos de respuesta | Sistema estable bajo carga | Alta | 8 | Todas | Terminado |
| EPICA-7 Plataforma Final | Administrador | importar información masiva | facilitar administración | HU23 | Administrador | cargar datos mediante archivos | reducir trabajo manual | Importación procesada correctamente | Media | 6 | MongoDB | Terminado |
| EPICA-7 Plataforma Final | Usuario | acceder desde diferentes dispositivos | mejorar accesibilidad | HU24 | Usuario | usar interfaz adaptable | garantizar disponibilidad | Compatible con navegadores principales | Media | 5 | Frontend | Terminado |
| EPICA-7 Plataforma Final | Equipo desarrollo | documentar solución | facilitar mantenimiento | HU25 | Equipo | generar documentación técnica | mantener proyecto escalable | Documentación completa del sistema | Alta | 5 | Proyecto final | Terminado |
