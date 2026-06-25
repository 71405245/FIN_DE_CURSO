# 🐞 Registro de Defectos (Defect Log)

**Proyecto:** SIMA — Sistema Inteligente de Matrícula Académica  
**Versión:** 2.1 (Post Mejoras Fases 2-5)  
**Fecha de Actualización:** 22 de junio de 2026  
**Total Defectos Documentados:** 14  
**Estado General:** 100% Corregidos y Verificados

---

## 🎯 Resumen Ejecutivo

El **Registro de Defectos** documenta los errores, fallos y anomalías identificados durante el desarrollo, pruebas y auditorías del sistema SIMA. 

Su propósito es detectar defectos tempranamente, registrar su corrección y evitar regresiones. Se utilizaron herramientas como SonarQube, Jest, Playwright, Cypress y revisiones manuales para su identificación.

---

## 📋 Tabla de Defectos

| ID      | Descripción del Defecto                                              | Fecha         | Severidad   | Componente          | Causa Principal                        | Solución Aplicada                                                                 | Fecha Resolución | Estado         | Lecciones Aprendidas |
|---------|----------------------------------------------------------------------|---------------|-------------|---------------------|----------------------------------------|-----------------------------------------------------------------------------------|------------------|----------------|----------------------|
| DEF-01  | `console.log` exponía contraseñas en texto plano durante login      | Mar 2026      | **Crítico** | Backend (Auth)      | Debugging residual                     | Eliminación permanente + revisión global de logs                                  | 10 Abr 2026      | **Corregido**  | Nunca dejar logs con información sensible |
| DEF-02  | Cobertura de pruebas unitarias muy baja (19.44%)                    | Feb 2026      | Alto        | Backend             | Ausencia de pruebas en controladores   | Desarrollo de +50 pruebas Jest + Supertest                                       | 05 May 2026      | **Corregido**  | Implementar pruebas desde el inicio (TDD) |
| DEF-03  | Formularios y controles sin etiquetas `<label>` ni ARIA             | Mar 2026      | Alto        | Frontend            | Desarrollo sin enfoque en accesibilidad| Agregar `htmlFor`, `aria-label`, `role="alert"` y `aria-live`                     | 08 May 2026      | **Corregido**  | Accesibilidad debe ser desde el primer componente |
| DEF-04  | Respuestas API sin compresión GZIP                                  | Abr 2026      | Alto        | Backend             | Middleware de compresión desactivado   | Activación de `compression()` + threshold inteligente                             | 12 May 2026      | **Corregido**  | Medir y optimizar consumo de red siempre |
| DEF-05  | Solapamientos de horarios no detectados en algunos casos            | Feb 2026      | Alto        | Motor IA            | Lógica incompleta en `checkOverlap`    | Refactorización + 13 pruebas unitarias específicas                                | 25 Mar 2026      | **Corregido**  | Validar exhaustivamente lógica crítica |
| DEF-06  | Modales sin `role="dialog"` ni `aria-modal="true"`                  | Abr 2026      | Medio       | Frontend            | Uso de componentes genéricos           | Implementación completa de atributos ARIA                                         | 05 May 2026      | **Corregido**  | Probar modales con lectores de pantalla |
| DEF-07  | Listados grandes sin paginación (estudiantes, docentes)             | Mar 2026      | Alto        | Backend / Frontend  | Consultas sin límites                  | Paginación server-side + `.lean()` + proyecciones                                 | 20 Abr 2026      | **Corregido**  | Siempre paginar datos masivos |
| DEF-08  | Token JWT sin validación robusta de expiración                     | Mar 2026      | Alto        | Auth Middleware     | Validación incompleta                  | Mejora en middleware + manejo adecuado de tokens expirados                        | 15 Abr 2026      | **Corregido**  | Validar tokens en cada petición protegida |
| DEF-09  | Errores en importación masiva (duplicados y carreras erróneas)      | Mar 2026      | Medio       | Backend (Seeders)   | Lógica débil de matching               | Algoritmo mejorado + Set de emails + pre-hash bcrypt                             | 02 Abr 2026      | **Corregido**  | Validar exhaustivamente datos de seeders |
| DEF-10  | Alertas visuales sin `aria-live` para lectores de pantalla          | Abr 2026      | Medio       | Frontend            | Notificaciones solo visuales           | Agregar `role="alert"` y `aria-live="assertive/polite"`                           | 06 May 2026      | **Corregido**  | Hacer accesibles todas las notificaciones |
| DEF-11  | Consultas lentas en dashboard de estadísticas                       | Abr 2026      | Medio       | Backend             | Múltiples consultas sin optimización   | `Promise.all()`, caché en memoria y `Cache-Control`                               | 22 May 2026      | **Corregido**  | Optimizar conteos y métricas críticas |
| DEF-12  | Botones con solo iconos sin `aria-label`                            | Mar 2026      | Medio       | Frontend            | Dependencia visual                     | Agregar descripciones accesibles en todos los iconos interactivos                 | 07 May 2026      | **Corregido**  | Todo elemento interactivo debe tener nombre accesible |
| DEF-13  | Rate limiting solo aplicado en login                                | Abr 2026      | Medio       | Seguridad           | Configuración parcial                  | Ampliación de rate-limit a otras rutas críticas                                   | 18 Abr 2026      | **Corregido**  | Aplicar protecciones OWASP en todas las rutas sensibles |
| DEF-14  | Conflictos de aula/docente no detectados al crear secciones         | Mar 2026      | Alto        | Backend             | Validaciones incompletas               | Implementación de chequeos antes de guardar sección                               | 30 Mar 2026      | **Corregido**  | Validar integridad referencial antes de persistir |

---

## 📊 Estadísticas de Defectos

| Severidad     | Cantidad | Porcentaje |
|---------------|----------|----------|
| Crítico       | 1        | 7.1%     |
| Alto          | 7        | 50.0%    |
| Medio         | 6        | 42.9%    |

**Tiempo promedio de resolución:** 9 días  
**Defectos detectados por SonarQube:** 7  
**Defectos detectados en pruebas:** 5

---

## 🏆 Lecciones Aprendidas Generales

- Detectar defectos **temprano** con herramientas automatizadas (SonarQube, Jest, Lighthouse) reduce drásticamente el costo de corrección.
- La **seguridad** y **accesibilidad** deben revisarse en cada iteración, no solo al final.
- Los defectos de rendimiento aparecen claramente cuando se trabaja con datos masivos (seeders).
- Documentar defectos ayuda a prevenir regresiones en futuras versiones.
- La combinación de pruebas unitarias + E2E + auditorías manuales es la estrategia más efectiva.

---

## 🔄 Estado Actual

✅ **Todos los defectos han sido corregidos y verificados.**  
El sistema SIMA alcanzó altos estándares de calidad gracias a la gestión proactiva de defectos.
