# 📋 Requerimientos Funcionales


| ID | Nombre | Descripción  | Entradas | Salidas |
|----|--------|----------------------|----------|---------|
| RF-01 | Registro de preferencias | El sistema permitirá al estudiante registrar sus preferencias académicas, como cursos deseados, horarios disponibles, cantidad máxima de cursos y restricciones personales, con la finalidad de personalizar la generación de horarios de acuerdo con sus necesidades. | Preferencias del usuario | Datos almacenados en la base de datos |
| RF-02 | Visualización de cursos | El sistema mostrará la oferta académica disponible obtenida desde la base de datos institucional, incluyendo nombre del curso, sección, docente asignado, créditos y horarios disponibles. | Consulta de cursos | Lista de cursos disponibles |
| RF-03 | Detección de cruces | El sistema analizará automáticamente los cursos seleccionados para identificar conflictos de horario entre secciones, evitando combinaciones inválidas. | Cursos seleccionados | Alertas de conflicto |
| RF-04 | Generación de horarios | El sistema generará múltiples combinaciones de horarios válidos en base a las preferencias del estudiante y sin presentar cruces detectados. | Cursos + preferencias | Opciones de horario |
| RF-05 | Recomendación inteligente | El sistema priorizará y sugerirá los mejores horarios según criterios definidos, como menor cantidad de huecos, mejor distribución horaria o menor carga diaria. | Horarios generados | Ranking de horarios recomendados |
| RF-06 | Edición de preferencias | El usuario podrá modificar sus preferencias en cualquier momento antes de generar nuevamente los horarios. | Nuevos criterios | Datos actualizados |
| RF-07 | Visualización gráfica | El sistema mostrará el horario seleccionado en formato visual tipo calendario semanal para facilitar la comprensión del estudiante. | Horario elegido | Vista gráfica semanal |
| RF-08 | Exportación | El usuario podrá descargar o imprimir el horario generado en formato PDF para su uso personal. | Solicitud de exportación | Archivo PDF |
| RF-09 | Autenticación | El sistema permitirá a los usuarios iniciar sesión mediante credenciales seguras para guardar preferencias e historial. | Usuario y contraseña | Acceso autorizado |
| RF-10 | Historial | El sistema almacenará las consultas previas del usuario para reutilizar configuraciones anteriores y mejorar la experiencia. | Usuario autenticado | Historial mostrado |
