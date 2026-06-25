# Registro de Restricciones y Supuestos

Este documento detalla las reglas de negocio, limitaciones técnicas y supuestos académicos que rigen el funcionamiento del sistema SIMA.

## 📌 Restricciones y Supuestos

| ID | Categoría | Restricción/Supuestos | Estado | Comentarios | Impacto |
|---|---|---|---|---|---|
| N1 | Académico | Cruces de horarios entre cursos | Activo | El sistema valida que ningún intervalo de tiempo se superponga en el mismo día para un estudiante. | Alto |
| N2 | Académico | Cumplimiento de Prerrequisitos | Activo | No se permite la matrícula en un curso si el estudiante no ha aprobado los cursos requisito o alcanzado los créditos mínimos necesarios. | Crítico |
| N3 | Académico | Límite de Créditos por Ciclo | Activo | Cada estudiante tiene un límite máximo de créditos por ciclo. El administrador puede ajustar este valor según políticas académicas. | Alto |
| N4 | Operativo | Capacidad de Secciones (Cupos) | Activo | Cada sección tiene una cantidad máxima de estudiantes. Al alcanzar el límite, el sistema bloquea nuevas matrículas, habilitando cola de espera o reasignación según disponibilidad. | Medio |
| N5 | Seguridad | Acceso basado en Roles (RBAC) | Activo | El sistema restringe funcionalidades según roles: ADMIN, DOCENTE y ESTUDIANTE. | Crítico |
| N6 | Técnico | Autenticación mediante JWT | Activo | El acceso requiere un token válido. Tokens expirados o modificados invalidan automáticamente la sesión. | Alto |
| N7 | Operativo | Disponibilidad de Salones | Activo | Una sección requiere un aula asignada con capacidad y equipamiento suficiente antes de ser habilitada. | Medio |
| N8 | Aula / Infraestructura | Compatibilidad Aula-Sección | Activo | El sistema valida que el tipo de aula sea compatible con el curso asignado (laboratorio, teoría, capacidad, equipamiento). | Alto |
| N9 | Aula / Infraestructura | Evitar Doble Asignación de Aulas | Activo | Un aula no puede ser utilizada por dos secciones diferentes en el mismo intervalo horario. | Crítico |
| N10 | Docente | Disponibilidad Horaria del Docente | Activo | El sistema considera los horarios disponibles del docente para evitar asignaciones en periodos donde no tiene disponibilidad registrada. Esta disponibilidad queda congelada una vez iniciado el periodo académico para evitar reasignaciones a mitad de ciclo. | Alto |
| N11 | Docente | Evitar Cruce de Horarios Docentes | Activo | Un docente no puede tener dos clases asignadas simultáneamente en diferentes secciones o aulas. | Crítico |
| N12 | Docente | Carga Académica Equilibrada (Diaria y Semanal) | Activo | La planificación respeta un máximo configurable de horas de dictado por día y por semana, evitando concentrar horas consecutivas excesivas y alineándose con la condición contractual del docente (tiempo completo / parcial). | Alto |
| N13 | Docente | Espacios de Descanso y Traslado entre Clases | Activo | El sistema reserva intervalos mínimos entre bloques de clase, considerando además el tiempo de traslado cuando las clases se asignan en aulas o sedes distintas. | Medio |
| N14 | Docente | Bloques Reservados para Funciones No Lectivas | Activo | Docentes con cargos administrativos (coordinación, jefatura de área) o actividades de investigación pueden tener bloques de horario reservados sin clase asignada. | Medio |
| N15 | IA / Algorítmico | Optimización de Recomendaciones | Activo | El algoritmo genera múltiples alternativas considerando restricciones académicas y de infraestructura antes de recomendar horarios. | Alto |
| N16 | IA / Algorítmico | Evitar Soluciones Inválidas | Activo | Las recomendaciones generadas deben cumplir todas las reglas académicas y operativas antes de ser mostradas al usuario. | Crítico |
| N17 | Administrativa | Integridad de Datos Académicos | Activo | La información registrada por administradores debe mantener consistencia entre cursos, docentes, aulas, estudiantes y periodos académicos. | Crítico |
| N18 | Administrativa | Gestión de Periodos Académicos | Activo | Solo se permite generar matrículas y horarios dentro de periodos académicos activos configurados por administración. | Alto |
| N19 | Rendimiento | Manejo de Grandes Volúmenes de Datos | Activo | El sistema debe mantener tiempos aceptables considerando miles de estudiantes, cursos, docentes y horarios registrados. | Alto |
| N20 | Seguridad | Protección de Información Académica | Activo | Los datos personales, notas y registros académicos deben manejarse bajo controles de acceso y protección de información. | Crítico |
| N21 | Sostenibilidad | Uso Eficiente de Recursos Computacionales y Físicos | Activo | La arquitectura reduce el consumo innecesario de procesamiento mediante optimización de consultas, y la asignación de aulas agrupa secciones por franja horaria para minimizar espacios encendidos simultáneamente. | Medio |
| N22 | Accesibilidad | Cumplimiento de Accesibilidad Web e Infraestructura | Activo | La interfaz considera criterios WCAG, y la asignación de aulas contempla necesidades de movilidad reducida de estudiantes o docentes (ubicación accesible). | Medio |
| N23 | Académico | Penalización por Cursos Desaprobados | Activo | Los cursos repetidos influyen en la recomendación para evitar una carga académica excesiva en el estudiante. | Medio |
| N24 | IA / Algorítmico | Preferencias de Horario del Estudiante | Activo | El motor de recomendación considera preferencias de turno y disponibilidad declarada por el estudiante como criterio de ordenamiento, no como restricción dura. | Medio |
| N25 | Académico | Priorización de Cursos del Ciclo Actual | Activo | La recomendación prioriza cursos pertenecientes al ciclo académico actual del estudiante sobre cursos de ciclos posteriores. | Bajo |
| N26 | Académico | Flexibilidad Diferenciada por Tipo de Curso | Activo | Los cursos electivos admiten mayor flexibilidad de horario en la recomendación que los cursos obligatorios del plan curricular. | Bajo |
| N27 | Docente | Preferencia de Jornada Docente | Activo | El sistema considera preferencias declaradas del docente respecto a horarios de mañana, tarde o noche como criterio de ordenamiento, no como restricción dura. | Medio |
| N28 | Académico | Priorización de Matrícula por Avance Académico | Activo | Ante escasez de cupos, se asume que estudiantes con mayor avance curricular o mejor rendimiento tienen prioridad de asignación. | Medio |
