# 📄 Declaración de Trabajo (SOW) — Proyecto SIMA

# 🎓 Sistema Integral de Matrícula Académica (SIMA)

---

## 1. Información del proyecto

| Campo | Detalle |
|-|-|
| 📌 Proyecto | Sistema Integral de Matrícula Académica (SIMA) |
| 📂 Tipo | Proyecto académico de ingeniería de software |
| 👤 Patrocinador | Docente del curso |
| 👥 Equipo ejecutor | Jordan, Liand, Kevin |
| 📅 Duración | 31 de marzo – 22 de junio de 2026 |
| 🔄 Metodología | Desarrollo iterativo mediante 6 sprints |
| 🏗️ Arquitectura | MERN (MongoDB, Express, React, Node.js) |
| 📌 Estado al cierre | Finalizado — 100% de avance |

### Documento de origen del compromiso

El alcance y los entregables comprometidos fueron definidos a partir de:

- Acta de Constitución del Proyecto.
- Project Charter.
- Requisitos de alto nivel.
- Entregables definidos al inicio del proyecto.

---

# 2. Alcance comprometido

El proyecto SIMA tuvo como compromiso desarrollar un sistema web inteligente orientado a optimizar el proceso de matrícula universitaria mediante automatización, validaciones académicas y generación inteligente de horarios.

El alcance comprometido incluyó los siguientes componentes:

## 🔐 Gestión de usuarios y seguridad

- Autenticación mediante JWT.
- Control de acceso por roles:
  - ADMIN.
  - DOCENTE.
  - ESTUDIANTE.

## 🏫 Gestión académica

- Administración de carreras.
- Gestión de cursos.
- Gestión de secciones.
- Administración docente.

## 🎓 Gestión de matrícula

- Registro de matrícula estudiantil.
- Validación de prerrequisitos.
- Control de créditos.
- Detección de cruces horarios.

## 🤖 Generación inteligente de horarios

Implementación de un motor de generación automática utilizando:

- Algoritmo Backtracking.
- Heurística MRV (Minimum Remaining Values).

## 📊 Reportes y monitoreo

- Exportación de reportes académicos.
- Visualización de indicadores.
- Monitoreo del sistema.

## 🛡️ Calidad y seguridad

Validaciones mediante:

- OWASP Top 10.
- Sanitización de entradas.
- Control de acceso.
- Pruebas automatizadas.

---

# 3. Entregables comprometidos y aceptación

| Entregable | Referencia | Estado | Evidencia |
|-|-|-|-|
| 💻 Sistema web funcional | Project Charter — Entregables del proyecto | ✅ Aceptado | Código fuente en repositorio y 6 sprints completados |
| 🤖 Módulo de generación de horarios | Project Charter — Entregables del proyecto | ✅ Aceptado | Algoritmo Backtracking + MRV y pruebas unitarias |
| 📄 Exportación de horarios PDF | RF-08 | ✅ Aceptado | Módulo de generación PDF implementado |
| 📚 Documentación técnica | Acta de Constitución | ✅ Aceptado | 38 documentos organizados en `/docs` |
| 🔍 Reportes de calidad y seguridad | Control de avances | ✅ Aceptado | Evidencias SonarQube, OWASP, WCAG y SUS |
| ⚠️ Registro de riesgos | Gestión de riesgos | ✅ Aceptado | 15 riesgos documentados con mitigación |

---

# 4. Validación del cumplimiento del alcance

La siguiente comparación valida el cumplimiento entre el compromiso inicial y el resultado final obtenido.

| Compromiso inicial | Resultado final | Evidencia verificable |
|-|-|-|
| Implementar gestión académica y administrativa | ✅ Cumplido | RF-10, RF-11 y RF-12 implementados mediante CRUD de carreras, cursos, docentes y usuarios |
| Implementar autenticación y control de roles | ✅ Cumplido | JWT + Bcrypt implementados; pruebas de autenticación mediante `auth.test.js` |
| Reducir errores en selección de cursos | ✅ Cumplido | Validación de cruces horarios (RF-04) y prerrequisitos/créditos (RF-06) |
| Generar horarios automáticamente sin conflictos | ✅ Cumplido | Motor Backtracking + MRV validado mediante pruebas unitarias |
| Optimizar el tiempo del proceso de matrícula | ✅ Cumplido | Flujo automatizado mediante generación de horarios, validaciones académicas y exportación integrada. La medición cronometrada con usuarios reales queda como una validación futura fuera del alcance académico evaluado |
| Documentar completamente el sistema | ✅ Cumplido | 38 documentos técnicos y de gestión disponibles en el repositorio |

---

# 5. Criterios de aceptación del trabajo

El proyecto fue considerado aceptado al cumplir los siguientes criterios:

| Criterio | Meta definida | Resultado | Cumplimiento |
|-|-|-|-|
| Requerimientos funcionales | 20 RF implementados | 20/20 completados | ✅ 100% |
| Requerimientos no funcionales | 27 RNF atendidos | 27/27 atendidos | ✅ 100% |
| Sprints ejecutados | 6 sprints | 6/6 completados | ✅ 100% |
| Pruebas automatizadas | Backend, Frontend y E2E | 150 pruebas ejecutadas | ✅ Cumplido |
| Seguridad | 0 vulnerabilidades activas | 23 → 0 vulnerabilidades | ✅ 100% |
| Documentación técnica | Completa y accesible | 38 documentos disponibles | ✅ Cumplido |

---

# 6. Criterio de aceptación global

El trabajo se considera formalmente aceptado debido a que:

- Todos los entregables comprometidos fueron desarrollados.
- Los requerimientos funcionales fueron implementados.
- Los requerimientos no funcionales fueron atendidos.
- El proyecto finalizó dentro del cronograma establecido.
- Las métricas técnicas evidencian mejoras verificables.
- La documentación requerida fue entregada.

El cumplimiento global del proyecto SIMA corresponde al:

# ✅ 100% del alcance comprometido

---

# 7. Declaración formal de cumplimiento

Se declara que el equipo del proyecto SIMA entregó los productos, módulos y funcionalidades comprometidas en el alcance inicial definido mediante el Acta de Constitución del Proyecto y el Project Charter.

El proyecto fue desarrollado dentro del periodo establecido:

📅 **31 de marzo – 22 de junio de 2026**

y cumplió con:

- Alcance definido.
- Entregables comprometidos.
- Requisitos funcionales.
- Requisitos no funcionales.
- Validaciones técnicas.
- Gestión de riesgos.

La solución entregada representa una implementación funcional del sistema propuesto, con evidencia verificable mediante pruebas, métricas de calidad y documentación técnica.

Como consideración final, la optimización del tiempo de matrícula fue implementada mediante automatización del flujo operativo; una medición formal del tiempo con usuarios reales corresponde a una fase posterior de validación operativa.

En consecuencia:

# ✅ Se valida el cumplimiento total del trabajo comprometido y el cierre formal del proyecto SIMA.

---

# 8. Validación y conformidad

| Rol | Nombre | Estado |
|-|-|-|
| 👤 Patrocinador / Docente del curso | — | Pendiente de aprobación final |
| 👨‍💻 Gerente del Proyecto | Jordan | Conforme |
| 📋 Product Owner | Liand | Conforme |
| 🔄 Scrum Master | Kevin | Conforme |

---
