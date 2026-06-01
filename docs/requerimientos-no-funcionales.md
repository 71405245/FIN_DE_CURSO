# 📋 Requerimientos No Funcionales (RNF)

| ID | Nombre | Descripción |
|----|---------|-------------|
| RNF-01 | Compresión de red | Todas las respuestas de la API deben comprimirse mediante GZIP, reduciendo hasta un 90% el tamaño de las respuestas masivas y optimizando el consumo de ancho de banda. |
| RNF-02 | Consultas eficientes | Las consultas masivas realizadas con Mongoose deben utilizar `.lean()` para retornar objetos JavaScript planos, mejorando el rendimiento entre 3x y 5x. |
| RNF-03 | Indexación de base de datos | Los campos de búsqueda frecuente como rol, carrera, curso y docente deben contar con índices en MongoDB para optimizar las búsquedas y reducir tiempos de respuesta. |
| RNF-04 | Escalabilidad | El sistema debe soportar al menos 3,000 estudiantes, 80 docentes y 1,000 secciones activas sin degradación perceptible del rendimiento. |
| RNF-05 | Seguridad | Las contraseñas deben almacenarse utilizando bcrypt con costo 10 y los tokens JWT tendrán una vigencia máxima de 10 horas. |
| RNF-06 | Disponibilidad local | Durante el desarrollo, el sistema debe ejecutarse localmente en `http://localhost:5173` para el frontend y `http://localhost:5000` para la API backend. |
| RNF-07 | Rendimiento | El tiempo de respuesta promedio de las consultas críticas no debe superar los 2 segundos bajo carga normal del sistema. |
| RNF-08 | Mantenibilidad | El código debe seguir una arquitectura modular basada en componentes y separación por capas, facilitando futuras mejoras y mantenimiento del sistema. |
