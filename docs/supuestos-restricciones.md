# Registro de Restricciones y Supuestos 

Este documento detalla las reglas de negocio, limitaciones técnicas y supuestos académicos que rigen el funcionamiento del sistema.

| ID | Categoría | Restricción / Supuesto | Estado | Comentarios | Impacto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R1** | Académico | Cruces de horarios entre cursos | **Activo** | El sistema valida que ningún intervalo de tiempo se superponga en el mismo día para un estudiante. | Alto |
| **R2** | Académico | Cumplimiento de Prerrequisitos | **Activo** | No se permite la matrícula en un curso si el estudiante no ha aprobado el curso requisito o alcanzado los créditos mínimos necesarios. | Crítico |
| **R3** | Académico | Límite de Créditos por Ciclo | **Activo** | Cada estudiante tiene un tope (default 24) que no puede exceder. Los administradores pueden ajustar este límite individualmente. | Alto |
| **R4** | Operativo | Capacidad de Secciones (Cupos) | **Activo** | Las secciones tienen un límite de vacantes. Una vez alcanzado, el sistema bloquea nuevas inscripciones para esa sección. | Medio |
| **R5** | Académico | Penalización por Cursos Jalados | **Activo** | Los cursos desaprobados previamente pueden "costar" más créditos en la carga proyectada para evitar sobrecarga del estudiante. | Medio |
| **R6** | Seguridad | Acceso basado en Roles (RBAC) | **Activo** | Solo usuarios con rol 'admin' pueden gestionar cursos, salones y notas. Los 'estudiantes' solo acceden a matrícula y consultas. | Crítico |
| **R7** | Técnico | Autenticación vía JWT | **Activo** | El acceso requiere un token válido en las cookies. Si el token expira o es alterado, la sesión se cierra automáticamente. | Alto |
| **R8** | IA / Algorítmico | Preferencias de Horario | **Activo** | El motor de recomendación asume que el estudiante prefiere concentrar sus clases en el turno elegido (Mañana/Tarde/Noche). | Medio |
| **R9** | Operativo | Disponibilidad de Salones | **Activo** | Una sección no puede ser creada o editada sin un salón asignado que tenga capacidad suficiente para el cupo definido. | Medio |
| **R10** | Académico | Ciclo Actual del Estudiante | **Activo** | El sistema prioriza cursos del ciclo actual del estudiante en las recomendaciones de la IA. | Bajo |

---

### Notas Adicionales
- **Impacto Crítico:** Bloquea procesos esenciales si no se cumple.
- **Impacto Alto:** Afecta directamente la validez del proceso de matrícula.
- **Impacto Medio/Bajo:** Optimiza la experiencia o gestiona recursos físicos.
