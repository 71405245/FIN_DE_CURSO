# Reporte Integral de Mejoras en SIMA (Sistema Integral de Matrícula Académica)

Este documento centraliza todas las actualizaciones, refactorizaciones y mejoras implementadas en la plataforma SIMA, basándose en los cuatro pilares fundamentales de calidad de software moderno: **SonarQube (Clean Code)**, **OWASP Top 10 (Seguridad)**, **WCAG (Accesibilidad)** y **SUS (Usabilidad)**.

---

## 1. Auditoría y Remediación con SonarQube (Clean Code)
Se desplegó un servidor local de SonarQube (v10.7) para analizar los directorios de `frontend` y `backend`. Inicialmente se detectaron más de 180 "Code Smells" y problemas críticos.

### Optimizaciones Logradas:
* **Erradicación de "Code Smells" Críticos y Mayores**: Se redujeron a prácticamente cero. Se refactorizaron bloques de código con alta "Complejidad Cognitiva" (Nested Ternaries o condicionales if-else muy anidados).
* **Validación Estricta de Componentes (React)**: Se aplicó `PropTypes` a **todos** los componentes del Admin Dashboard (`PlanificacionManager.jsx`, `RecursosManager.jsx`, etc.), garantizando que los props reciban el tipo exacto de dato esperado (shape, arrays, strings) y evitando errores silenciosos de renderizado.
* **Estabilidad del Virtual DOM**: Se sustituyó el anti-patrón de usar índices (`key={i}`) dentro de bucles `map()` por identificadores únicos (`_id`), lo cual evita la destrucción innecesaria de nodos en React.
* **Cobertura (Coverage) de Backend**: Mediante Jest y Supertest se amplió masivamente el coverage de controladores críticos (como el `estudianteController`), alcanzando más de un 70% de cobertura de ramas (Branches).

---

## 2. Seguridad Backend: Lineamientos OWASP Top 10 (Edición Moderna)
Aseguramos la API Node.js/Express contra los vectores de ataque más predominantes del ecosistema web:

### Defensas Implementadas:
* **Protección contra Inyección NoSQL (A03:2021-Injection)**: Se integró `express-mongo-sanitize` de forma global para interceptar parámetros y cuerpos de peticiones HTTP, removiendo operadores reservados (como `$gt`, `$set`) que pudieran corromper las consultas de MongoDB.
* **Cabeceras HTTP Seguras (A05:2021-Security Misconfiguration)**: Se incorporó `helmet` para inyectar políticas de seguridad estrictas (HSTS, bloqueo de iFrames contra Clickjacking, y políticas contra MIME Sniffing).
* **Mitigación de Fuerza Bruta y DoS (A07:2021-Identification and Authentication Failures)**: Se implementó `express-rate-limit` exclusivamente sobre la ruta de inicio de sesión (`/api/auth/login`). Un atacante no podrá realizar más de 10 intentos en 15 minutos.
* **Sanitización de Entradas Pre-Controlador**: Utilización de `express-validator` para validar correos, strings y contraseñas vacías antes de tocar la base de datos, abortando inmediatamente la petición (Fail-Fast).

---

## 3. Accesibilidad Web Universal (WCAG 2.1 - Nivel AA)
El portal fue readaptado para que sea inclusivo, operable y comprensible por usuarios con herramientas de asistencia (Screen Readers) y navegación exclusiva por teclado.

### Adaptaciones Realizadas:
* **Navegación Interactiva por Teclado**: Elementos interactivos emulados (tarjetas, filas y botones que antes eran simples `<div>`) ahora cuentan con `tabIndex={0}` y eventos `onKeyDown` para asegurar que el presionar "Enter" o "Espacio" equivalga a un click del ratón.
* **Etiquetado Semántico en Formularios**: Se erradicó la orfandad de etiquetas en React. Todo `<input>`, `<select>` y `<textarea>` cuenta ahora con un identificador único asociado a su `<label htmlFor="...">` correspondiente.
* **Regiones Vivas (ARIA Live)**: Las alertas rojas de error o verdes de éxito ahora están envueltas en contenedores `<div role="alert" aria-live="assertive">` y `<output aria-live="polite">`, provocando que el lector de pantalla narre de inmediato la alerta sin necesidad de intervención manual del usuario.
* **Estandarización Semántica**: Se migraron roles genéricos (como `role="dialog"`) a etiquetas HTML5 modernas como `<dialog open>`.

---

## 4. Usabilidad y Experiencia de Usuario (Impacto en la métrica SUS)
Aunque el System Usability Scale (SUS) es un test empírico, las refactorizaciones aplicadas maximizan teóricamente el puntaje al reducir fricciones sistémicas:

* **Respuestas Predictivas:** Al sanitizar y validar variables desde los middlewares, la plataforma es capaz de retornar descripciones exactas de qué falló (ej: "Email no válido"), reduciendo el nivel de estrés cognitivo y mejorando el ítem *"Me pareció fácil de usar"*.
* **Iconografía Narrativa:** Se agregaron `aria-label` descriptivos a los iconos de los menús (ej. botón de "Cerrar" en los modales de Planificación), subsanando confusiones para el usuario y fomentando el ítem *"Las diferentes funciones estaban bien integradas"*.
* **Estabilidad y Tiempos Carga (Green Code):** Con la implementación de buffers circulares y caché de memoria en el servidor, los dashboards de administración cargan de forma instantánea sin castigar a la base de datos, impactando de lleno en la percepción de velocidad de la plataforma.
