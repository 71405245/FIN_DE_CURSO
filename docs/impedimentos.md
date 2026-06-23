# 🚧 Registro de Impedimentos (Impediment Log)

**Proyecto:** SIMA — Sistema Inteligente de Matrícula Académica  
**Versión:** 2.1 (Post Mejoras Fases 2-5)  
**Fecha de Actualización:** 22 de junio de 2026  
**Total Impedimentos Documentados:** 11  
**Estado General:** 100% Resueltos / Mitigados

---

## 🎯 Resumen Ejecutivo

Este registro documenta los **obstáculos reales** que frenaron o ralentizaron el progreso del equipo durante el desarrollo de SIMA. 

Su objetivo es identificar bloqueadores tempranamente, registrar las acciones tomadas y extraer lecciones aprendidas para futuros proyectos.

---

## 📋 Tabla de Impedimentos

| ID      | Descripción del Impedimento                                      | Fecha         | Severidad   | Impacto en el Proyecto              | Responsable       | Acciones Tomadas para Resolver                                                                 | Fecha Resolución | Estado         | Lecciones Aprendidas |
|---------|------------------------------------------------------------------|---------------|-------------|-------------------------------------|-------------------|------------------------------------------------------------------------------------------------|------------------|----------------|----------------------|
| IMP-01  | Conflicto de puerto 5000 con Docker Desktop                     | 10 Abr 2026   | **Alto**    | Bloqueo total de pruebas E2E        | DevOps            | Cambio a puerto 5001 + actualización de proxy en `vite.config.js` + documentación            | 15 Abr 2026      | **Resuelto**   | Estandarizar puertos desde el inicio |
| IMP-02  | Cobertura de pruebas extremadamente baja (19.44%)               | Feb 2026      | Alto        | Alto riesgo de regresiones          | Backend Dev + QA  | Desarrollo intensivo de +50 pruebas Jest/Supertest + integración en pipeline                 | 05 May 2026      | **Resuelto**   | Escribir pruebas desde las primeras iteraciones |
| IMP-03  | Exposición de contraseñas en logs (`console.log`)               | Mar 2026      | **Crítico** | Vulnerabilidad de seguridad grave   | Backend Dev       | Eliminación inmediata + refactor de `authController` + implementación de Helmet              | 10 Abr 2026      | **Resuelto**   | Realizar auditorías de seguridad frecuentes |
| IMP-04  | Lentitud severa en listados administrativos                      | Mar 2026      | Alto        | Mala experiencia de usuario         | Backend Dev       | Paginación server-side, `.lean()`, caché y endpoint consolidado                               | 20 Abr 2026      | **Resuelto**   | Optimizar consultas antes de cargar datos masivos |
| IMP-05  | Problemas graves de accesibilidad (WCAG)                        | Mar-Abr 2026  | Alto        | Incumplimiento de estándares        | Frontend Dev      | Implementación completa de ARIA, labels, roles y navegación por teclado                      | 08 May 2026      | **Resuelto**   | Incluir accesibilidad desde el diseño inicial |
| IMP-06  | Errores y lentitud en importación masiva (3000 estudiantes)     | Mar 2026      | Medio       | Retraso en seeders                  | Backend Dev       | Mejora del algoritmo de matching + pre-hash de contraseñas + manejo robusto de errores       | 02 Abr 2026      | **Resuelto**   | Validar datos masivos con scripts dedicados |
| IMP-07  | Alta deuda técnica detectada por SonarQube                      | Feb 2026      | Alto        | Mantenibilidad comprometida         | Todo el equipo    | Refactorización masiva (Fases 2-5) + integración continua de SonarQube                       | 25 May 2026      | **Resuelto**   | Usar SonarQube desde el primer commit |
| IMP-08  | Tiempo limitado del semestre académico                          | Todo el proyecto | Crítico  | Presión constante en entregables    | Product Owner     | Metodología Scrum con sprints cortos + priorización estricta del backlog                     | En curso         | **Mitigado**   | Incluir buffers de tiempo en la planificación |
| IMP-09  | Alto consumo de red y huella de carbono                         | Abr 2026      | Medio       | Impacto en sostenibilidad           | Full Stack        | Activación de GZIP + script de comparativa de consumo + métricas CO₂                         | 12 May 2026      | **Resuelto**   | Incorporar Green Code como práctica diaria |
| IMP-10  | Fallos repetidos en pruebas E2E (Playwright / Cypress)          | Abr 2026      | Alto        | Bloqueo de validación final         | QA                | Corrección de puertos, uso de `.clear()` y modo serial en pruebas                            | 18 Abr 2026      | **Resuelto**   | Ejecutar E2E en entornos aislados |
| IMP-11  | Dependencias obsoletas y bloat en package.json                  | Mar 2026      | Medio       | Tamaño innecesario y riesgos        | Full Stack        | Limpieza completa de dependencias muertas (`"all"`, etc.)                                     | 10 May 2026      | **Resuelto**   | Auditar dependencias regularmente |

---

## 📊 Estadísticas de Impedimentos

| Severidad     | Cantidad | Porcentaje |
|---------------|----------|----------|
| Crítico       | 2        | 18.2%    |
| Alto          | 6        | 54.5%    |
| Medio         | 3        | 27.3%    |

**Tiempo promedio de resolución:** 12 días  
**Impedimentos resueltos en la misma iteración:** 7

---

## 🏆 Lecciones Aprendidas Generales

- Los **impedimentos técnicos de entorno** (puertos, Docker, dependencias) deben anticiparse en la fase de planificación.
- La **calidad de código y pruebas** no pueden dejarse para el final; generan deuda técnica difícil de pagar.
- La **seguridad y accesibilidad** deben tratarse como impedimentos prioritarios desde el diseño.
- El uso continuo de **SonarQube** y **pruebas automatizadas** permite detectar bloqueadores tempranamente.
- La comunicación diaria y retrospectivas frecuentes ayudan a remover impedimentos rápidamente.
