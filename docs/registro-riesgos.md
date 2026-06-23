# 📊 Registro de Riesgos (Risk Register)

**Proyecto:** SIMA — Sistema Inteligente de Matrícula Académica  
**Versión:** 2.1 (Post Mejoras Fases 2-5)  
**Fecha de Actualización:** 22 de junio de 2026  
**Estado General:** 100% de riesgos críticos mitigados

---

## 🎯 Resumen Ejecutivo

- **Riesgos identificados:** 14  
- **Riesgos mitigados / cerrados:** 13  
- **Riesgos críticos resueltos:** 100%  
- **Nivel de exposición residual:** Muy Bajo  

El equipo gestionó proactivamente los riesgos, documentando eventos reales y aplicando respuestas concretas que permitieron entregar un sistema de alta calidad.

---

## 📋 Registro de Riesgos

| ID     | Descripción del Riesgo                                      | Área            | Causa Principal                        | Impacto   | Prob. | Puntuación | Evento Real / Fecha          | Respuesta Aplicada                                                                 | Resultado / Eficacia                  | Estado          | Lecciones Aprendidas |
|--------|-------------------------------------------------------------|-----------------|----------------------------------------|-----------|-------|------------|------------------------------|------------------------------------------------------------------------------------|---------------------------------------|-----------------|----------------------|
| R-01   | Datos simulados no representativos de la realidad          | Calidad         | Uso de datos ficticios                 | Crítico   | Alto  | 6.3        | Durante seeders (Mar 2026)   | Scripts robustos de importación + validación inteligente de carreras               | Base de datos consistente             | **Cerrado**     | Validar seeders con lógica de negocio |
| R-02   | Alta complejidad del algoritmo de generación de horarios   | Técnico / IA    | Combinatoria explosiva                 | Crítico   | Muy Alto | 8.1     | Tiempo > 30s en pruebas      | Greedy + Backtracking + MRV + Forward Checking + límites de profundidad          | Tiempo reducido a < 3s                | **Mitigado**    | Combinar heurísticas con búsqueda exacta |
| R-03   | Incumplimiento de tiempos de respuesta                     | Rendimiento     | Consultas ineficientes                 | Serio     | Alto  | 5.5        | Dashboards lentos            | Paginación server-side, `.lean()`, caché y endpoint consolidado                    | Respuestas < 200ms                    | **Mitigado**    | Optimizar antes de escalar datos |
| R-04   | Fallas en detección de cruces de horarios                  | Calidad         | Lógica incompleta                      | Serio     | Medio | 3.5        | Pruebas iniciales            | 13 pruebas unitarias específicas en `scheduler.test.js`                           | 100% cobertura de casos               | **Cerrado**     | Pruebas exhaustivas en lógica crítica |
| R-05   | Vulnerabilidades en autenticación                          | Seguridad       | Validaciones débiles                   | Crítico   | Alto  | 7.0        | Auditoría OWASP              | `express-validator`, rate-limit, JWT + auto-creación de admins                     | Vulnerabilidades eliminadas           | **Cerrado**     | Auditorías OWASP en cada iteración |
| R-06   | Retraso por limitaciones de tiempo académico               | Cronograma      | Periodo corto                          | Crítico   | Alto  | 6.3        | Conflicto puerto 5000        | Cambio a puerto 5001 + proxy Vite + sprints priorizados                           | Proyecto entregado a tiempo           | **Mitigado**    | Anticipar conflictos de entorno |
| R-07   | Alta deuda técnica y Code Smells                           | Mantenibilidad  | Código legacy                          | Alto      | Alto  | 6.5        | Análisis SonarQube inicial   | Refactorización masiva (Fases 2-5) + eliminación de console.log sensible          | Deuda técnica reducida drásticamente  | **Mitigado**    | Usar SonarQube desde el día 1 |
| R-08   | Exposición de contraseñas en logs                          | Seguridad       | Debugging en producción                | Crítico   | Medio | 6.0        | Auditoría de código          | Eliminación permanente + Helmet + mongo-sanitize                                   | Vulnerabilidad cerrada                | **Cerrado**     | Nunca loguear información sensible |
| R-09   | Rendimiento pobre con volúmenes grandes de datos           | Rendimiento     | Ausencia de paginación                 | Alto      | Alto  | 6.0        | Listados de estudiantes      | Paginación server-side + proyecciones selectivas                                  | Mejora notable en velocidad           | **Mitigado**    | Siempre paginar datos masivos |
| R-10   | Problemas en importación masiva de usuarios                | Datos           | Matching inconsistente de carreras     | Medio     | Alto  | 4.5        | Seeders (Mar 2026)           | Algoritmo mejorado + pre-hash bcrypt + manejo de duplicados                       | Importación exitosa                   | **Cerrado**     | Automatizar y validar datos masivos |
| R-11   | Fallos en pipeline CI/CD y análisis SonarQube              | Calidad         | Configuración incompleta               | Medio     | Medio | 3.5        | Workflow inicial             | Archivo `sonar.yml` mejorado con `fetch-depth: 0`                                 | Análisis continuo funcionando         | **En Monitoreo**| Mantener actualizado el CI/CD |
| R-12   | Alto impacto ambiental (huella de carbono)                 | Sostenibilidad  | Sin compresión ni optimización         | Medio     | Alto  | 5.0        | Medición comparativa         | GZIP + script `comparativa_consumo.js` + métricas CO₂                             | Reducción demostrada                  | **Mitigado**    | Incorporar Green Code desde el diseño |
| R-13   | Baja accesibilidad web (WCAG)                              | Usabilidad      | Ausencia de ARIA y semántica          | Serio     | Medio | 4.5        | Evaluación WCAG              | Implementación completa WCAG 2.1 AA                                               | Cumplimiento Nivel AA                 | **Cerrado**     | Accesibilidad desde el diseño |
| R-14   | Conflictos de entorno local (puertos, Docker)              | Técnico         | Configuración por defecto              | Alto      | Alto  | 5.5        | Pruebas E2E (Abr 2026)       | Estandarización de puertos + documentación clara                                  | Entorno estable                       | **Cerrado**     | Documentar requisitos de entorno |

---

## 📈 Riesgos Residuales (En Monitoreo)

| ID     | Riesgo                                      | Nivel Actual | Acción Recomendada                     |
|--------|---------------------------------------------|--------------|----------------------------------------|
| R-11   | Pipeline CI/CD                              | Bajo         | Monitoreo continuo de SonarCloud       |
| R-15   | Cambios frecuentes de requerimientos        | Medio        | Control estricto de cambios            |

---

## 🏆 Logros en Gestión de Riesgos

- **100%** de riesgos críticos resueltos.
- Eliminación total de vulnerabilidades OWASP y Security Hotspots.
- Mejora dramática en calidad de código (SonarQube) y cobertura de pruebas.
- Implementación exitosa de prácticas de **Green Code**, **WCAG AA** y **observabilidad**.
- Documentación completa de eventos reales y respuestas aplicadas.
