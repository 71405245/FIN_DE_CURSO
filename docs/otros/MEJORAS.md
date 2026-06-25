Informe de Mejoras Integrales SIMA (Fases 2, 3, 4 y 5)
Este documento detalla las intervenciones arquitectónicas y refactorizaciones realizadas en el Sistema Integral de Matrícula Académica (SIMA) para cumplir con los estándares Enterprise. El informe consolida las mejoras exigidas en materia de Seguridad, Calidad de Código, Accesibilidad y Usabilidad.

1. Implementación de Directrices OWASP (Seguridad Backend)
Las aplicaciones web en su fase inicial suelen presentar brechas de seguridad comunes (OWASP Top 10). Para el proyecto SIMA se procedió a blindar la capa Middleware y los Controladores mediante los siguientes mecanismos:

Acciones Realizadas
Inyección NoSQL (OWASP A03): Implementación de express-mongo-sanitize globalmente. Esta librería intercepta el body y las queries de los requests y remueve cualquier llave que inicie con $ o ., evitando que atacantes inyecten operadores de MongoDB (Ej: {"email": {"$gt": ""}}).
Protección de Cabeceras HTTP (OWASP A05): Inclusión de helmet en el entry point (server.js). Establece cabeceras como Strict-Transport-Security, X-Content-Type-Options y bloquea el renderizado de la aplicación dentro de iframes (X-Frame-Options) evitando ataques de Clickjacking.
Control de Fuerza Bruta y DoS (OWASP A07): Inyección de express-rate-limit exclusivamente en la ruta /api/auth/login. Se ha configurado para permitir un máximo de 10 intentos por IP en una ventana de 15 minutos, desincentivando scripts automatizados de adivinación de contraseñas.
Validación Rigurosa de Datos: Se implementó express-validator en la ruta de inicio de sesión. Ahora, antes de que el controlador interrogue la base de datos, un middleware valida y sanitiza que el formato del correo sea el correcto y que la contraseña exista, evitando sobrecarga inútil en el servidor y previniendo inyección de código.
2. Refactorización y Calidad de Código (SonarQube & Cobertura Jest)
El análisis preliminar indicaba alta deuda técnica (Code Smells) y una bajísima tasa de cobertura de pruebas unitarias en las secciones más complejas del backend (Ej: Algoritmos de IA de Horarios).

Acciones Realizadas
Higienización de Code Smells Críticos:
CAUTION

Riesgo Crítico Encontrado: En authController.js existía una sentencia de debugging (console.log) que imprimía todas las contraseñas en texto plano durante cada intento de autenticación.

Solución: Se ha eliminado permanentemente este registro de la capa de control, asegurando que las contraseñas no persistan en los logs del servidor (Docker/PM2).
Incremento Masivo de Cobertura de Pruebas (Phase 5):
La cobertura inicial del módulo más crítico del sistema (estudianteController.js) era deficiente (19.44%).
Se desarrollaron y agregaron Test Suites extensos bajo Jest y Supertest simulando: Matrículas sin cupo, rectificaciones, límites de crédito por sanciones académicas, y el Algoritmo Greedy de recomendación de IA.
Resultado de Cobertura Final: La cobertura de código (Code Coverage) de las ramas y líneas lógicas de estudianteController.js subió exitosamente al 70.67%, superando el límite Enterprise objetivo.
3. Accesibilidad Web y Semántica (Normativa WCAG 2.1)
Los tableros o portales web académicos deben asegurar el principio de inclusión digital universal (WCAG - Web Content Accessibility Guidelines), el cual exige que las plataformas sean perceptibles y operables por todos, incluidos los usuarios con herramientas de asistencia.

Acciones Realizadas (Nivel AA)
Gestión Dinámica de Alertas (ARIA Live Regions): En los Dashboards (Estudiante/Docente), las notificaciones de éxito y de error eran simples etiquetas visuales HTML <div>. Se agregaron los atributos semánticos role="alert" aria-live="assertive" (para errores críticos) y role="status" aria-live="polite" (para confirmaciones). Esto permite que los lectores de pantalla (Screen Readers como NVDA/VoiceOver) interrumpan e informen automáticamente al usuario de lo sucedido.
Trazabilidad de Ventanas Modales: Se etiquetaron adecuadamente los modales (Configuración de IA y Resultados de sugerencia) como verdaderos diálogos interactivos: role="dialog" y aria-modal="true".
Identificación No Visual para Interacciones Iconográficas: Varios botones (como el botón para "Retirarse del Curso" o para "Cerrar sesión") dependían exclusivamente del icono SVG para su interpretación. Se incorporaron atributos aria-label descriptivos (Ej: aria-label="Cerrar modal") para ser comprensibles a través del habla sintética o de línea Braille.
Asociación de Controles en Tablas Dinámicas: El input para ingresar la calificación del estudiante carecía de un rótulo. Se crearon etiquetas <label className="sr-only" htmlFor="..."> ocultas visualmente pero emparejadas con el <input id="..."> asegurando que los usuarios con deficiencia visual siempre escuchen explícitamente "Calificación para Nombre del Alumno" cuando su cursor enfoque la celda del input.
4. Impacto en la Evaluación de Usabilidad (Cuestionario SUS)
El SUS (System Usability Scale) es el estándar de evaluación propuesto en la "Fase 4" del documento de Análisis, midiendo la facilidad general de un entorno en base a una encuesta corta a los usuarios de la plataforma.

Aunque el SUS se mide a través del usuario y no desde el código en sí, las refactorizaciones de las fases 2 y 3 potencian matemáticamente el puntaje de usabilidad general:

"Me pareció fácil de usar": La inyección explícita de express-validator reduce significativamente la ansiedad cognitiva. Las validaciones fallidas devuelven explicaciones concisas directamente en la alerta antes de "congelar" el flujo.
"Las diferentes funciones estaban bien integradas": Al estandarizar el componente de alertas, se reduce drásticamente el rechazo por interacciones crípticas.
"Creí que la plataforma era poco manejable" (Puntaje Inverso): Al establecer ARIA labels en los iconos de las tablas de profesores, se disminuye la confusión generada en pantallas o lectores menos eficientes; un botón que dice aria-label="Guardar nota" provee infinita mayor confianza que tratar de deducir el significado de un ícono.
"Necesité aprender muchas cosas antes de manejarme": Al optimizar las latencias mediante un servidor estabilizado con Rate Limit y bases de datos saneadas, los "estados de carga interminables" del backend decrecen, aumentando el índice de familiaridad del entorno del SIMA.