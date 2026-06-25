# 📋 Registro de Incidentes / Problemas (Issue Log)

**Proyecto:** SIMA — Sistema Inteligente de Matrícula Académica  
**Versión:** 2.1 (Post Mejoras Fases 2-5)  
**Fecha de Actualización:** 22 de junio de 2026  
**Total Incidentes Documentados:** 13  
**Estado General:** 100% Resueltos

---

## 🎯 Resumen Ejecutivo

Este registro documenta los **problemas reales** que surgieron durante el desarrollo y ejecución del proyecto SIMA. Su propósito es registrar incidentes con trazabilidad, facilitar el aprendizaje del equipo y servir como evidencia de madurez en la gestión de proyectos.

Todos los incidentes fueron identificados, priorizados y resueltos exitosamente.

---

## 📋 Tabla de Incidentes

| ID     | Descripción del Incidente                                           | Fecha         | Severidad   | Estado      | Responsable       | Causa Principal                          | Solución Aplicada                                                                 | Fecha Resolución | Lecciones Aprendidas |
|--------|---------------------------------------------------------------------|---------------|-------------|-------------|-------------------|------------------------------------------|-----------------------------------------------------------------------------------|------------------|----------------------|
| I-01   | `console.log` exponía contraseñas en texto plano en autenticación   | Mar 2026      | **Crítico** | Resuelto    | Backend Dev       | Debugging residual en `authController.js` | Eliminación permanente + revisión de logs en todo el proyecto                     | 10 Abr 2026      | Nunca loguear datos sensibles |
| I-02   | Conflicto de puerto 5000 con Docker Desktop                        | Abr 2026      | Alto        | Resuelto    | DevOps            | Puerto por defecto compartido            | Cambio a puerto **5001** + actualización de proxy en `vite.config.js`             | 15 Abr 2026      | Estandarizar puertos y documentar entornos |
| I-03   | Cobertura de pruebas muy baja (19.44% en controladores críticos)    | Feb-Mar 2026  | Alto        | Resuelto    | QA / Backend      | Falta de pruebas unitarias               | Desarrollo de +50 pruebas Jest + Supertest                                       | 05 May 2026      | Las pruebas deben escribirse desde el inicio |
| I-04   | Lentitud extrema en listados administrativos (estudiantes, secciones) | Mar 2026   | Alto        | Resuelto    | Backend Dev       | Consultas sin paginación ni optimización | Paginación server-side + `.lean()` + caché + endpoint consolidado                 | 20 Abr 2026      | Optimizar consultas antes de tener grandes volúmenes |
| I-05   | Problemas de accesibilidad (WCAG) en formularios, modales y botones | Mar-Abr 2026  | Alto        | Resuelto    | Frontend Dev      | Ausencia de ARIA, labels y semántica     | Implementación completa WCAG 2.1 AA (ARIA, roles, contraste, teclado)             | 08 May 2026      | La accesibilidad debe ser desde el diseño |
| I-06   | Alto consumo de red y huella de carbono (sin compresión)            | Abr 2026      | Medio       | Resuelto    | Full Stack        | Respuestas sin GZIP                      | Activación de compresión + `comparativa_consumo.js` + métricas CO₂               | 12 May 2026      | Medir impacto ambiental desde el desarrollo |
| I-07   | Fallos en pruebas E2E (Playwright y Cypress)                       | Abr 2026      | Alto        | Resuelto    | QA                | Configuración de puertos y inputs        | Ajuste de puertos + `.clear()` en Cypress + modo serial                           | 18 Abr 2026      | Ejecutar E2E en entornos estables y aislados |
| I-08   | Alto número de Code Smells y Deuda Técnica (SonarQube)             | Feb 2026      | Alto        | Resuelto    | Todo el equipo    | Código legacy y malas prácticas          | Refactorización masiva (Fases 2-5) + integración SonarQube en CI/CD               | 25 May 2026      | Usar herramientas de calidad desde el inicio |
| I-09   | Errores en importación masiva de estudiantes y docentes            | Mar 2026      | Medio       | Resuelto    | Backend Dev       | Mapeo inconsistente de carreras          | Mejora de lógica de matching + pre-cálculo de hashes + manejo robusto de errores  | 02 Abr 2026      | Validar exhaustivamente datos de seeders |
| I-10   | Vulnerabilidades OWASP detectadas (Inyección, Headers, Rate Limit) | Mar 2026      | Crítico     | Resuelto    | Backend Dev       | Ausencia de protecciones                 | `express-mongo-sanitize`, Helmet y `express-rate-limit`                           | 15 Abr 2026      | Aplicar OWASP Top 10 en cada iteración |
| I-11   | Modales y alertas no accesibles para lectores de pantalla          | Abr 2026      | Medio       | Resuelto    | Frontend Dev      | Falta de atributos ARIA                  | Agregar `role="alert"`, `aria-live`, `aria-modal` y `aria-label`                  | 05 May 2026      | Probar siempre con herramientas asistivas |
| I-12   | Alto tiempo de respuesta en endpoints del dashboard                | Abr 2026      | Medio       | Resuelto    | Backend Dev       | Consultas sin caché ni optimización      | Caché en memoria + `Cache-Control` + optimización de conteos                      | 22 May 2026      | Monitorear rendimiento continuamente |
| I-13   | Dependencias innecesarias y bloat en package.json                  | Mar 2026      | Medio       | Resuelto    | Full Stack        | Paquetes obsoletos (`"all"`, etc.)       | Limpieza de dependencias muertas y optimización de `package.json`                 | 10 May 2026      | Auditar dependencias regularmente |

---

## 📊 Estadísticas de Incidentes

| Severidad     | Cantidad | Porcentaje |
|---------------|----------|----------|
| Crítico       | 2        | 15.4%    |
| Alto          | 6        | 46.2%    |
| Medio         | 5        | 38.5%    |

**Tiempo promedio de resolución:** 11 días  
**Incidentes detectados por herramientas automáticas:** 8 (SonarQube, Jest, Playwright)

---

## 🏆 Lecciones Aprendidas Generales

- Los **problemas de seguridad** y **accesibilidad** deben revisarse continuamente, no solo al final.
- Los **conflictos de entorno** (puertos, Docker, dependencias) deben anticiparse con documentación clara.
- Las **pruebas automatizadas** (unitarias + E2E) son esenciales para detectar incidentes tempranamente.
- La **deuda técnica** crece rápidamente si no se usa SonarQube desde las primeras iteraciones.
- Documentar incidentes en tiempo real facilita la retrospectiva y evita repeticiones.
