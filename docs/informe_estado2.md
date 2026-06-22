# Informe de Estado del Proyecto

| Campo | Detalle |
|---|---|
| **Nombre del Proyecto** | SIMA - Sistema Integral de Matrícula Académica |
| **Gerente del Proyecto** | Liand Mejía |
| **Fecha** | 22/06/2026 |
| **Periodo del Informe** | Semana 15 |
| **Estado del Proyecto** | Finalizado |

---

# Estado del Proyecto

| Área | Descripción |
|---|---|
| **Alcance** | Se completó el desarrollo integral del sistema SIMA, incluyendo módulos de autenticación, gestión administrativa, gestión docente, matrícula estudiantil, generación inteligente de horarios, exportación de reportes y monitoreo del sistema. |
| **Cronograma** | El proyecto finalizó dentro del periodo planificado, completando las funcionalidades previstas en los 6 sprints definidos. |
| **Porcentaje de avance** | 100% completado |
| **Costes** | No se presentan desviaciones económicas debido a que corresponde a un proyecto académico desarrollado con herramientas de código abierto. |
| **Ejecución del presupuesto** | No aplica |
| **Calidad** | El sistema cuenta con validaciones funcionales, pruebas unitarias, pruebas E2E, revisión de seguridad, accesibilidad y evaluación de experiencia de usuario. |
| **Actividades de calidad realizadas** | Ejecución de pruebas frontend con Vitest y React Testing Library, pruebas backend, pruebas E2E con Cypress y Playwright, análisis de seguridad mediante OWASP Top 10, auditoría estática con SonarQube, validación WCAG 2.1 AA y evaluación SUS de usabilidad. |

---

# Tecnologías Implementadas

| Área | Tecnologías |
|---|---|
| **Frontend** | React + Vite, React Router, Vanilla CSS, HTML semántico, ARIA Attributes |
| **Backend** | Node.js + Express |
| **Base de Datos** | MongoDB + Mongoose |
| **Seguridad** | JWT, Bcryptjs, Helmet, Express Rate Limit, Sanitización de entradas |
| **Generación de documentos** | PDFKit para generación de horarios en PDF |
| **Pruebas** | Vitest, React Testing Library, Jest, Cypress y Playwright |
| **Calidad de código** | SonarQube |
| **Optimización** | Green Code, caché, compresión GZIP, optimización de consultas |
| **Inteligencia Artificial** | Motor de generación de horarios mediante DFS + Backtracking con restricciones académicas |

---

# Funcionalidades Implementadas

| Módulo | Estado |
|---|---|
| Autenticación segura con JWT y control de roles ADMIN, DOCENTE y ESTUDIANTE | Completado |
| Gestión administrativa de carreras, cursos, docentes, alumnos y secciones | Completado |
| Gestión docente para consulta de cursos asignados y registro de notas | Completado |
| Matrícula estudiantil con validación de créditos y prerrequisitos | Completado |
| Generador inteligente de horarios sin cruces mediante algoritmo de búsqueda | Completado |
| Recomendación de horarios basada en preferencias del estudiante | Completado |
| Exportación de horarios en formato PDF | Completado |
| Monitoreo de recursos del sistema (CPU/RAM/APM) | Completado |
| Optimización energética mediante prácticas Green Code | Completado |
| Accesibilidad web bajo criterios WCAG 2.1 AA | Completado |

---

# Riesgos Gestionados

| Riesgo | Responsable | Mitigación |
|---|---|---|
| Conflictos de puertos entre backend y servicios externos | Equipo Backend | Migración del backend al puerto 5001 y actualización del proxy de Vite. |
| Complejidad del algoritmo de generación de horarios | Equipo Desarrollo | Implementación de DFS con Backtracking, heurística MRV y límites de búsqueda para evitar sobrecarga. |
| Posibles vulnerabilidades de seguridad | Equipo Desarrollo | Implementación de controles OWASP Top 10, JWT, Bcrypt, Helmet, Rate Limit y sanitización. |
| Degradación del rendimiento por monitoreo constante | Equipo Backend | Uso de buffer circular, caché temporal y reducción de consultas innecesarias. |
| Problemas de experiencia de usuario | Equipo Frontend | Mejoras UX/UI, accesibilidad WCAG y evaluación SUS. |

---

# Próximos avances

Al encontrarse el proyecto en estado finalizado, los siguientes puntos corresponden a posibles mejoras futuras:

- Implementación de despliegue en infraestructura cloud.
- Integración con sistemas universitarios externos.
- Ampliación del motor inteligente con modelos predictivos.
- Implementación de notificaciones automáticas para estudiantes y docentes.
- Escalamiento del sistema para soportar mayores cargas de usuarios.

---

# Notas Finales

- El sistema SIMA se encuentra completamente funcional en entorno local.
- Se implementó una arquitectura MERN moderna basada en React, Node.js, Express y MongoDB.
- Se logró integrar seguridad mediante JWT, control de roles y protección contra vulnerabilidades comunes.
- El motor inteligente permite generar alternativas de horarios considerando restricciones académicas, preferencias del estudiante y disponibilidad de recursos.
- Se aplicaron prácticas de desarrollo sostenible mediante Green Code para reducir consumo innecesario de recursos.
- La plataforma fue validada mediante pruebas automatizadas, análisis de calidad y criterios de accesibilidad.
