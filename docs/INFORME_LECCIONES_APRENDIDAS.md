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

## ⚡ 1.3 Optimización del rendimiento del sistema

Se aplicaron técnicas de optimización como paginación, caché y reducción de consultas redundantes.

| Métrica | Antes | Después | Mejora |
|---|---|---|---|
| Tiempo dashboard | 1.5s | 0.08s | -94.6% |
| Tráfico de datos | 2.3 MB | 24 KB | -98.9% |

📌 **Evidencia:** `Optimizacion-y-Analisis.md`

---

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

## 📄 2.2 Desalineación de documentación

Parte de la documentación quedó desactualizada respecto al sistema final.

| Documento | Estado |
|---|---|
| api.md | Obsoleto |
| installation.md | Obsoleto |
| diagrama ER | No corresponde a MongoDB |
| arquitectura.md | Actual |

📌 Problema: coexistencia de documentación de dos arquitecturas.

---

## 🧪 2.3 Cobertura desigual de pruebas

La cobertura de pruebas no fue homogénea entre capas.

| Capa | Cobertura |
|---|---|
| Backend | Alta |
| Frontend | Baja |
| E2E | Limitada |

📌 Evidencia: `pruebas-backend.md`, `pruebas-frontend.md`, `pruebas-e2e.md`

---

## ⚙️ 2.4 Error en pipeline de CI/CD

Se detectó un error en la configuración del workflow.

```yaml
off: ❌ (incorrecto)
on:  ✅ (correcto)
