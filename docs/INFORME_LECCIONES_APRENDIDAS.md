# 📘 Informe de Lecciones Aprendidas y Retrospectivas — Proyecto SIMA

Durante el desarrollo del proyecto SIMA, realizamos sesiones de retrospectiva en cada sprint bajo la metodología Scrum. Estas sesiones nos permitieron analizar de forma continua qué prácticas funcionaron correctamente y qué aspectos debían mejorarse. A continuación, presentamos el consolidado de lecciones aprendidas basado en evidencia del proyecto.

---
## Proyecto SIMA — Sistema Inteligente / Integral de Matrícula Académica

![Status](https://img.shields.io/badge/Estado-Proyecto%20Finalizado-success?style=for-the-badge)
![Type](https://img.shields.io/badge/Tipo-Lessons%20Learned%20Report-blue?style=for-the-badge)
![Method](https://img.shields.io/badge/Metodolog%C3%ADa-Scrum%20%2F%20%C3%81gil-orange?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack%20Final-MERN-61DAFB?style=for-the-badge)

---


# ✅ 1. Lo que funcionó bien (prácticas que debemos mantener)

## 🧠 1.1 Implementación de inteligencia artificial para generación de horarios

Se desarrolló un motor de generación de horarios utilizando **backtracking con heurísticas (MRV y poda)**, permitiendo resolver un problema complejo de asignación de forma eficiente.

| Aspecto | Resultado |
|---|---|
| Técnica usada | Backtracking + MRV |
| Problema resuelto | Generación de horarios sin cruces |
| Rendimiento | < 1 segundo en promedio |
| Enfoque | Degradación elegante ante restricciones estrictas |

📌 **Evidencia:** `Desarrollo-del-algoritmo.md`, `Spec.md`, `arquitectura.md`

---

## 🛡️ 1.2 Mejora de seguridad basada en OWASP

Aplicamos buenas prácticas de seguridad basadas en OWASP Top 10, logrando reducir vulnerabilidades críticas a cero.

| Indicador | Antes | Después |
|---|---|---|
| Vulnerabilidades | 23 | 0 |
| Security Rating | E | A |
| Security Hotspots | 14 | 0 |

📌 **Evidencia:** `analisis_OWASP.md`, `analisis_SonarQube.md`

---


## ⚡ 1.3 Optimización del rendimiento del sistema (Green Software + Indexación)

Uno de los logros más importantes del proyecto fue la mejora progresiva del rendimiento del sistema. En una primera etapa, el sistema presentaba **lentitud significativa cuando se trabajaba con grandes volúmenes de datos**, especialmente en módulos como el listado de estudiantes, el dashboard administrativo y la generación de reportes. Esto se debía principalmente a consultas no optimizadas, falta de indexación en la base de datos, ausencia de paginación y procesamiento excesivo de información en cada solicitud.

Posteriormente, se aplicó un proceso de **optimización y refactorización orientado a rendimiento y eficiencia energética (Green Software)**, lo que permitió mejorar de forma considerable el comportamiento del sistema bajo carga.

Entre las mejoras implementadas destacan:

- **Indexación de campos críticos en la base de datos**, lo que redujo significativamente los tiempos de búsqueda y filtrado en consultas frecuentes.
- **Implementación de paginación en listados grandes**, evitando la carga completa de registros en memoria y mejorando la respuesta del frontend.
- **Reducción de consultas redundantes y optimización de endpoints**, disminuyendo la carga del servidor.
- **Uso de caché para consultas repetitivas**, evitando recomputación innecesaria de datos.
- **Aplicación de principios de Green Software**, como la reducción de polling innecesario, optimización del consumo de recursos y mejora del uso del servidor bajo carga.

Gracias a estas mejoras, el sistema pasó de ser **lento y poco eficiente con grandes volúmenes de datos**, a un sistema con **tiempos de respuesta mucho más rápidos, mayor estabilidad y mejor experiencia de usuario**, incluso en escenarios de alta demanda.

📌 **Evidencia:** `Optimizacion-y-Analisis.md`, `aplicacion_greencode.md`

## ♿ 1.4 Usabilidad y accesibilidad

Se validó el sistema con usuarios reales y estándares WCAG 2.1.

| Indicador | Resultado |
|---|---|
| SUS Score | 85.75 (Excelente) |
| Accesibilidad | 45 → 95 |
| Nivel WCAG | AA |

📌 **Evidencia:** `analisis_SUS.md`, `validacion_WCAG.md`

---

## 🔁 1.5 Trabajo con metodología Scrum

El desarrollo se organizó en sprints con entregas incrementales.

| Sprint | Cumplimiento |
|---|---|
| Sprint 1–6 | 100% |
| Historias completadas | 183 pts |
| Duración total | 15 semanas |

📌 **Evidencia:** `backlog_del_sprint.md`, `cronograma-SIMA.png`

---

# ⚠️ 2. Lo que no funcionó bien (aspectos a mejorar)

---

## 🔀 2.1 Cambio de stack tecnológico sin control formal

Se realizó un cambio de arquitectura sin registro formal de decisión.

| Etapa | Tecnología |
|---|---|
| Inicio | Python + Django + MySQL |
| Final | MERN (React + Node + MongoDB) |

📌 Problema: No existe ADR ni documento formal del cambio.

📌 Evidencia: `enfoque-proyecto.md`, `arquitectura.md`, `Spec.md`

---

## 🧪 2.2 Cobertura desigual de pruebas

La cobertura de pruebas no fue homogénea entre capas.

| Capa | Cobertura |
|---|---|
| Backend | Alta |
| Frontend | Baja |
| E2E | Limitada |

📌 Evidencia: `pruebas-backend.md`, `pruebas-frontend.md`, `pruebas-e2e.md`

---
# 📌 3. Conclusión

Como equipo, concluimos que el proyecto SIMA ha sido exitoso en términos de implementación técnica, logrando desarrollar un sistema funcional, estable y con un alto nivel de complejidad resuelto, especialmente en el módulo de generación de horarios mediante inteligencia artificial, así como en los procesos de autenticación, gestión académica y administración del sistema.

Uno de los principales logros del proyecto fue la evolución significativa del rendimiento del sistema. En una primera etapa, el sistema presentaba **problemas serios de lentitud cuando se trabajaba con grandes volúmenes de datos**, especialmente en módulos como el listado de estudiantes, generación de reportes y dashboard administrativo. En ese contexto, las respuestas del sistema eran percibidas como lentas debido a consultas no optimizadas, ausencia de paginación, falta de índices en la base de datos y procesamiento innecesario de información en cada solicitud.

Sin embargo, a través de un proceso de **optimización progresiva y aplicación de prácticas de Green Software**, se logró una mejora sustancial del rendimiento general. Se implementaron técnicas como:

- **Indexación de campos críticos en la base de datos**, mejorando significativamente el tiempo de respuesta en consultas frecuentes.
- **Paginación de resultados**, evitando la carga masiva de registros en memoria y en el frontend.
- **Reducción de consultas redundantes y consolidación de endpoints**, disminuyendo la carga del servidor.
- **Uso de caché y control de peticiones repetitivas**, reduciendo el procesamiento innecesario.
- **Aplicación de principios de Green Code**, como reducción de polling innecesario, uso de Page Visibility API y optimización del consumo de recursos.

Gracias a estas mejoras, el sistema pasó de un comportamiento inicialmente lento bajo carga de datos, a un sistema **mucho más eficiente, con tiempos de respuesta considerablemente reducidos y mejor experiencia de usuario**, incluso en escenarios con mayor volumen de información.

En paralelo, el proyecto también fortaleció su nivel de calidad mediante la incorporación de prácticas de seguridad basadas en OWASP, mejoras en accesibilidad WCAG, pruebas automatizadas y validación con usuarios reales, lo que permitió asegurar no solo un sistema funcional, sino también confiable y usable.

No obstante, a nivel de gestión del proyecto, identificamos debilidades importantes relacionadas con la documentación y el control de cambios, como el cambio de arquitectura sin registro formal, la existencia de documentación desactualizada y el cierre incompleto de algunos artefactos de gestión (riesgos, impedimentos y retrospectivas). Estos aspectos afectan la trazabilidad del proyecto y representan oportunidades claras de mejora para futuros desarrollos.

Finalmente, consideramos que este proyecto nos deja como aprendizaje principal que **la excelencia técnica debe ir acompañada de una gestión disciplinada del proyecto**, donde cada decisión arquitectónica, mejora de rendimiento y cambio estructural sea correctamente documentado, validado y cerrado. Solo de esta forma es posible garantizar la mantenibilidad, escalabilidad y comprensión del sistema a largo plazo.
