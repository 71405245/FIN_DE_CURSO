# Requerimientos No Funcionales (RNF)

| ID | Nombre | Descripción |
|---|---|---|
| RNF-01 | Eficiencia en Transferencia de Datos | Las respuestas HTTP del sistema deben utilizar mecanismos de compresión como GZIP cuando el tamaño de la respuesta lo justifique, reduciendo consumo de red y mejorando tiempos de comunicación entre frontend y backend. |
| RNF-02 | Optimización de Consultas a Base de Datos | Las operaciones de consulta sobre MongoDB deben aplicar estrategias de optimización como uso de índices, proyección de campos y consultas eficientes mediante Mongoose para reducir tiempos de respuesta. |
| RNF-03 | Indexación y Rendimiento de Datos Académicos | Los datos consultados frecuentemente como usuarios, carreras, cursos, docentes y secciones deben contar con estructuras de búsqueda optimizadas para evitar degradación del sistema. |
| RNF-04 | Escalabilidad del Sistema | El sistema debe soportar crecimiento progresivo de estudiantes, docentes, cursos, secciones y matrículas manteniendo tiempos de respuesta aceptables. |
| RNF-05 | Rendimiento de Operaciones Críticas | Las operaciones principales como autenticación, consulta académica, matrícula y generación de horarios deben ejecutarse en tiempos aceptables bajo carga normal. |
| RNF-06 | Arquitectura Modular y Mantenibilidad | El software debe mantener separación de responsabilidades mediante capas y módulos independientes que faciliten mantenimiento, correcciones y futuras ampliaciones. |
| RNF-07 | Seguridad de Credenciales | Las contraseñas deben almacenarse utilizando mecanismos seguros de hashing con salt, evitando almacenar información sensible en texto plano. |
| RNF-08 | Gestión Segura de Sesiones | La autenticación debe utilizar tokens seguros con expiración definida y validación constante para evitar accesos mediante sesiones manipuladas. |
| RNF-09 | Control de Acceso Basado en Roles (RBAC) | El sistema debe restringir funcionalidades según permisos del usuario (ADMIN, DOCENTE y ESTUDIANTE), evitando accesos no autorizados a información académica. |
| RNF-10 | Protección contra Vulnerabilidades OWASP | El sistema debe prevenir vulnerabilidades críticas relacionadas con control de acceso, inyección, configuraciones inseguras, fallos criptográficos y exposición de información sensible. |
| RNF-11 | Validación y Sanitización de Datos | Toda información ingresada por usuarios debe ser validada y sanitizada antes de procesarse para evitar datos corruptos o ataques mediante entradas maliciosas. |
| RNF-12 | Protección contra Ataques Automatizados | Los servicios sensibles como autenticación deben implementar mecanismos de limitación de solicitudes para reducir riesgos de fuerza bruta. |
| RNF-13 | Manejo Seguro de Errores | El sistema debe controlar errores internos sin exponer información sensible del servidor, estructura interna o detalles técnicos al usuario final. |
| RNF-14 | Observabilidad del Sistema | El sistema debe permitir monitorear métricas de rendimiento, consumo de recursos, errores y tiempos de respuesta sin afectar significativamente el funcionamiento de la aplicación. |
| RNF-15 | Uso Eficiente de Recursos Computacionales | Los procesos internos deben minimizar consumo innecesario de CPU, memoria y red mediante técnicas como caché, buffers eficientes y reducción de solicitudes repetitivas. |
| RNF-16 | Sostenibilidad del Software (Green Code) | El sistema debe aplicar prácticas de desarrollo sostenible reduciendo procesamiento innecesario, tráfico de red y consumo energético durante su operación. |
| RNF-17 | Calidad del Motor de Recomendación Inteligente | El generador de horarios debe producir alternativas válidas respetando restricciones académicas, disponibilidad docente, capacidad de aulas y preferencias del estudiante. |
| RNF-18 | Tiempo Controlado de Ejecución del Algoritmo IA | El algoritmo de planificación debe evitar ejecuciones indefinidas mediante límites de búsqueda y estrategias de optimización que permitan entregar resultados en tiempos razonables. |
| RNF-19 | Precisión de Recomendaciones Académicas | Las recomendaciones generadas deben cumplir correctamente reglas como prerrequisitos, créditos máximos, cruces horarios y disponibilidad de recursos. |
| RNF-20 | Accesibilidad Web (WCAG 2.1 Nivel AA) | La interfaz debe permitir interacción accesible mediante navegación por teclado, etiquetas semánticas, atributos ARIA y compatibilidad con herramientas asistivas. |
| RNF-21 | Usabilidad del Sistema | La plataforma debe ofrecer una experiencia clara e intuitiva para estudiantes, docentes y administradores, permitiendo completar sus tareas principales con facilidad. |
| RNF-22 | Compatibilidad Multiplataforma | La aplicación debe funcionar correctamente en navegadores modernos y diferentes resoluciones de pantalla. |
| RNF-23 | Integridad de Información Académica | Los datos de estudiantes, docentes, cursos, notas, matrículas y horarios deben mantenerse consistentes durante las operaciones del sistema. |
| RNF-24 | Disponibilidad del Sistema | La plataforma debe permanecer disponible durante los periodos académicos permitiendo acceso continuo a los diferentes actores del sistema. |
| RNF-25 | Recuperación ante Fallos | El sistema debe permitir recuperar información mediante respaldos y mecanismos que reduzcan pérdida de datos ante errores inesperados. |
| RNF-26 | Trazabilidad de Operaciones | Las acciones críticas realizadas por usuarios administrativos deben poder ser identificadas para mantener control y seguimiento de cambios académicos. |
| RNF-27 | Generación de Reportes Académicos | El sistema debe generar documentos académicos como horarios en PDF manteniendo exactitud e integridad de la información mostrada. |
