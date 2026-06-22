# Informe Final del Proyecto - SIMA

## 1. Resumen ejecutivo

El proyecto SIMA tuvo como objetivo desarrollar un sistema web inteligente que optimice la gestión de matrícula universitaria mediante la generación automática de horarios personalizados, administración académica integral y un motor de recomendación basado en restricciones académicas y operativas.

El sistema fue desarrollado bajo una arquitectura MERN (MongoDB, Express, React y Node.js), organizado en 6 sprints ejecutados entre el 31 de marzo y el 22 de junio de 2026, alcanzando un cumplimiento del 100% del alcance planificado.

Se implementaron:

- 20 requerimientos funcionales (RF-01 a RF-20)
- 27 requerimientos no funcionales (RNF-01 a RNF-27)

Incluyendo:

- Autenticación mediante JWT y control de roles.
- Gestión administrativa y docente.
- Matrícula estudiantil.
- Generación inteligente de horarios mediante Backtracking + heurística MRV.
- Exportación de reportes PDF.
- Monitoreo del sistema.

La calidad fue validada mediante:

- SonarQube.
- OWASP Top 10.
- WCAG 2.1 AA.
- SUS (85.75 puntos).
- 150 pruebas automatizadas.

El proyecto finalizó cumpliendo alcance, cronograma y presupuesto establecido.

---

# 2. Desempeño del alcance

## 2.1 Cumplimiento de requerimientos

| Tipo | Cantidad | Estado |
|-|-|-|
| Requerimientos funcionales | 20 | 100% completados |
| Requerimientos no funcionales | 27 | 100% atendidos |

## 2.2 Trazabilidad plan vs ejecución

| Módulo | Evidencia |
|-|-|
| Autenticación y roles | JWT + Bcrypt + pruebas Jest |
| Gestión académica | CRUD de carreras, cursos y usuarios |
| Matrícula | Validación de prerrequisitos y cruces |
| Motor IA | Backtracking + MRV |
| Reportes | Exportación PDF y KPIs |
| Seguridad | OWASP, sanitización y rate limiting |

---

# 3. Desempeño del cronograma

| Sprint | Periodo | Estado |
|-|-|-|
| Sprint 1 | 31 mar - 13 abr | Completado |
| Sprint 2 | 14 abr - 27 abr | Completado |
| Sprint 3 | 28 abr - 11 may | Completado |
| Sprint 4 | 12 may - 25 may | Completado |
| Sprint 5 | 26 may - 8 jun | Completado |
| Sprint 6 | 9 jun - 22 jun | Completado |

Resultado:

- 6/6 sprints completados.
- 100% del cronograma cumplido.
- Sin extensiones de plazo.

---

# 4. Desempeño de calidad

## SonarQube antes/después

| Métrica | Antes | Después |
|-|-|-|
| Vulnerabilidades | 23 | 0 |
| Reliability Issues | 173 | 27 |
| Maintainability Issues | 297 | 21 |
| Security Hotspots | 14 | 0 |
| Coverage | 16% | 38.7% |

## Pruebas

| Tipo | Herramienta |
|-|-|
| Backend | Jest |
| Frontend | Vitest + RTL |
| E2E | Playwright + Cypress |

Total:

**150 pruebas automatizadas**

## Usabilidad

Resultado SUS:

**85.75/100 - Excelente**

---

# 5. Desempeño de costos

Presupuesto estimado:

**$1,597**

El valor representa esfuerzo equivalente en horas-persona.

No existieron costos reales por licencias debido al uso de herramientas open source:

- React
- Node.js
- MongoDB
- Jest
- Vitest
- Cypress
- Playwright

Desviación:

**$0**

---

# 6. Riesgos e incidencias

Se identificaron:

**15 riesgos (R-01 a R-15)**

Principales riesgos:

| Riesgo | Mitigación |
|-|-|
| Complejidad del algoritmo | Backtracking + MRV |
| Datos simulados | Validación de escenarios |
| Falta de tiempo académico | Priorización del backlog |

## Incidencias resueltas

| Problema | Solución |
|-|-|
| Vulnerabilidades SonarQube | Corrección y refactorización |
| Problemas de fiabilidad | Mejora del código |
| Baja cobertura inicial | Nuevas pruebas automatizadas |

---

# 7. Conclusiones

SIMA cumplió el 100% del alcance planificado, dentro del cronograma y presupuesto establecido.

Las métricas obtenidas demuestran:

- Mejora de calidad del código.
- Reducción total de vulnerabilidades.
- Cumplimiento de requerimientos.
- Validación mediante pruebas automatizadas.
- Gestión efectiva de riesgos.

El proyecto deja una base tecnológica preparada para futuras mejoras como integración con datos reales, despliegue cloud y evolución del motor inteligente de recomendación.
