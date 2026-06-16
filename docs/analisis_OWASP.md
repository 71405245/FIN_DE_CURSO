# 4. Evaluación de Seguridad Basada en OWASP Top 10 2025

## 4.1 Introducción

La seguridad constituye uno de los pilares fundamentales de la calidad del software moderno. Con el objetivo de identificar riesgos potenciales y fortalecer la protección del sistema, se realizó una auditoría técnica basada en los principios y categorías propuestas por OWASP Top 10 2025.

El análisis permitió evaluar la exposición del sistema frente a vulnerabilidades comunes en aplicaciones web, identificar riesgos de seguridad presentes en la implementación y validar la efectividad de las medidas de mitigación aplicadas.

---

## 4.2 Metodología de Evaluación

La evaluación se desarrolló mediante una combinación de:

- Análisis estático utilizando SonarQube.
- Revisión manual del código fuente.
- Inspección de mecanismos de autenticación y autorización.
- Verificación de validaciones de entrada.
- Revisión de gestión de sesiones.
- Identificación de configuraciones inseguras.
- Validación de controles de acceso.

El objetivo fue identificar vulnerabilidades alineadas con las categorías de riesgo definidas por OWASP Top 10.

---

## 4.3 Estado Inicial de Seguridad

Durante la evaluación inicial se identificaron múltiples hallazgos relacionados con prácticas de desarrollo que podrían representar riesgos para la seguridad del sistema.

### Resumen Inicial

| Indicador | Resultado |
|------------|------------|
| Vulnerabilities | 23 |
| Security Hotspots | 14 |
| Security Rating | E |
| Riesgo General | Alto |

### Evidencia Inicial

**Figura 9. Dashboard de seguridad antes de las correcciones**

> <img width="1330" height="232" alt="image" src="https://github.com/user-attachments/assets/ba8566e4-22d1-4b62-b142-37a0d35a4f8d" />


---

## 4.4 Matriz de Vulnerabilidades Identificadas

| Categoría OWASP | Vulnerabilidad Detectada | Nivel de Riesgo | Estado Inicial |
|-----------------|-------------------------|-----------------|----------------|
| A01 Broken Access Control | Validaciones insuficientes de acceso | Alto | Detectado |
| A02 Cryptographic Failures | Uso de mecanismos inseguros para generación de valores aleatorios | Alto | Detectado |
| A03 Injection | Posibles entradas sin validación adecuada | Medio | Detectado |
| A04 Insecure Design | Validaciones incompletas en componentes críticos | Medio | Detectado |
| A05 Security Misconfiguration | Configuraciones susceptibles a malas prácticas | Alto | Detectado |
| A07 Identification and Authentication Failures | Posibles debilidades en autenticación | Medio | Detectado |
| A09 Security Logging and Monitoring Failures | Limitaciones en trazabilidad de eventos | Bajo | Detectado |

> **Nota:** Ajustar la matriz según las vulnerabilidades exactas observadas en las capturas y reportes del proyecto.

---

## 4.5 Análisis de Riesgos

### Riesgos para la Confidencialidad

Las vulnerabilidades identificadas podían permitir el acceso indebido a información sensible almacenada o procesada por la aplicación.

### Riesgos para la Integridad

Algunas debilidades detectadas podían facilitar la manipulación no autorizada de datos críticos del sistema.

### Riesgos para la Disponibilidad

La presencia de errores relacionados con validaciones y manejo de entradas incrementaba la probabilidad de interrupciones o comportamientos inesperados.

### Riesgos Operativos

Las configuraciones inseguras y la existencia de código vulnerable incrementaban el riesgo general de explotación por parte de usuarios maliciosos.

---

## 4.6 Validación de Autenticación

Se realizó una revisión de los mecanismos de autenticación implementados en la aplicación.

### Aspectos Evaluados

- Gestión de credenciales.
- Validación de usuarios.
- Protección de sesiones.
- Control de acceso a recursos protegidos.
- Persistencia de autenticación.

### Hallazgos Iniciales

Durante la evaluación se identificaron oportunidades de mejora relacionadas con prácticas seguras de autenticación y protección de recursos sensibles.

### Evidencia

**Figura 10. Validación de autenticación**

> <img width="405" height="612" alt="image" src="https://github.com/user-attachments/assets/1dea53f9-51af-4e9f-8d33-1557bdfa07d7" />

---

## 4.7 Validación de Autorización

Se verificó la correcta aplicación de restricciones de acceso según los roles y permisos definidos por el sistema.

### Aspectos Revisados

- Acceso a funcionalidades administrativas.
- Restricción de recursos sensibles.
- Validación de permisos por rol.
- Protección de rutas privadas.

### Resultado

Las validaciones implementadas fueron fortalecidas para reducir riesgos asociados a accesos no autorizados.

### Evidencia

**Figura 11. Validación de autorización**

> <img width="423" height="625" alt="image" src="https://github.com/user-attachments/assets/245bf319-f7f7-4d46-a738-cf5d6e46159a" />


---

## 4.8 Validación de Manejo de Sesiones

Se evaluó la forma en que el sistema administra las sesiones de usuario.

### Aspectos Analizados

- Creación de sesiones.
- Expiración de sesiones.
- Persistencia de autenticación.
- Protección frente a secuestro de sesión.
- Almacenamiento seguro de tokens.

### Resultado

Se implementaron mejoras orientadas a fortalecer la gestión de sesiones y reducir riesgos asociados a accesos indebidos.

### Evidencia

**Figura 12. Validación de sesiones**

> <img width="411" height="611" alt="image" src="https://github.com/user-attachments/assets/5b1bd102-b5ab-4979-84e7-1ed97b3b32fe" />


---

## 4.9 Validación de Sanitización de Entradas

La sanitización de datos constituye una medida fundamental para prevenir ataques de inyección y manipulación de información.

### Aspectos Evaluados

- Validación de formularios.
- Control de parámetros recibidos.
- Restricciones de formato.
- Manejo seguro de entradas de usuario.

### Resultado

Se fortalecieron los mecanismos de validación para minimizar riesgos relacionados con entradas maliciosas.

### Evidencia

**Figura 13. Validación de entradas**

> <img width="1128" height="506" alt="image" src="https://github.com/user-attachments/assets/15246c52-ff63-4681-bbbd-91e4fbcf5aa4" />


---

## 4.10 Mitigaciones Implementadas

Con base en los hallazgos obtenidos se ejecutaron diversas acciones correctivas.

### Mitigaciones Aplicadas

- Eliminación de vulnerabilidades detectadas por SonarQube.
- Refactorización de componentes con riesgos de seguridad.
- Corrección de configuraciones inseguras.
- Mejora de validaciones de entrada.
- Fortalecimiento de controles de acceso.
- Optimización de mecanismos de autenticación.
- Revisión de componentes identificados como Security Hotspots.

### Evidencia de Mitigaciones

**Figura 14. Correcciones implementadas**

> **INSERTAR CAPTURA AQUÍ**

---

## 4.11 Resultados Posteriores a las Correcciones

Tras implementar las acciones correctivas se ejecutó una nueva evaluación de seguridad.

### Resumen Final

| Indicador | Antes | Después |
|------------|---------|---------|
| Vulnerabilities | 23 | 0 |
| Security Hotspots | 14 | 1 |
| Riesgo General | Alto | Bajo |
| Security Rating | E | A |

### Evidencia Final

**Figura 15. Dashboard de seguridad después de las correcciones**

> <img width="536" height="604" alt="image" src="https://github.com/user-attachments/assets/553b2d23-5597-4bc8-9a6e-7dd01d983b4e" />


---

## 4.12 Comparación Antes vs Después

| Métrica | Antes | Después | Mejora |
|----------|----------|----------|----------|
| Vulnerabilities | 23 | 0 | 100 % |
| Security Hotspots | 14 | 1 | 92.8 % |
| Riesgo General | Alto | Bajo | Mitigado |
| Exposición de Seguridad | Elevada | Mínima | Reducida |

### Evidencia Comparativa

---

## 4.13 Riesgo Residual

Después de las correcciones realizadas, la evaluación identificó únicamente un Security Hotspot pendiente de revisión manual.

Este hallazgo no representa una vulnerabilidad activa, sino un punto que requiere validación adicional por parte del equipo de desarrollo para confirmar que no existe riesgo asociado.

En consecuencia, el riesgo residual del sistema se considera bajo y aceptable para operación.

---

## 4.14 Conclusiones del Análisis OWASP

La auditoría de seguridad permitió identificar y corregir vulnerabilidades que comprometían la calidad técnica del sistema.

Los resultados obtenidos evidencian una mejora significativa en la postura de seguridad de la aplicación, logrando eliminar la totalidad de vulnerabilidades detectadas y reduciendo en más del 90 % los elementos catalogados como Security Hotspots.

Las medidas implementadas fortalecieron los mecanismos de autenticación, autorización, validación de entradas y protección general del sistema, reduciendo considerablemente la superficie de ataque y alineando la solución con las buenas prácticas promovidas por OWASP Top 10.

En términos generales, la aplicación evolucionó desde un escenario de riesgo elevado hacia un entorno considerablemente más seguro, estable y preparado para su operación en un contexto real.
