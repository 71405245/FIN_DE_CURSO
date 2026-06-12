# Documentación de Pruebas de Backend (Jest)

Este documento detalla el propósito técnico, los escenarios validados y la lógica de negocio detrás de las **50 pruebas automatizadas** implementadas con **Jest** en el backend del sistema SIMA. Estas pruebas garantizan que la API, los middlewares y el motor de IA funcionen de manera correcta y estable.

---

## 🚀 Cómo ejecutar las pruebas
Para ejecutar la suite completa de pruebas del backend, dirígete a la carpeta `backend` en tu terminal y corre el siguiente comando:

```bash
# Ejecutar todas las pruebas con Jest
npm test
```

---

## 📂 Estructura y Detalle de los Módulos de Prueba

### 1. Motor de Asignación y Recomendación de Horarios (`tests/scheduler.test.js`)
*Este módulo consta de **13 pruebas** enfocadas en validar matemáticamente los algoritmos aislados que alimentan al Agente de IA para la Recomendación de Horarios.*

*   **Lógica de Solapamientos (`checkOverlap`)**:
    *   **Prueba 1 (Días diferentes)**: Valida que dos secciones programadas en días distintos (ej. Lunes y Martes) no colisionen sin importar las horas.
    *   **Prueba 2 (Secuenciales)**: Comprueba que si una sección termina exactamente a las 10:00 y la otra inicia a las 10:00 del mismo día, se retorne `false` (sin cruce), facilitando la asistencia continua.
    *   **Prueba 3 (Solapamiento parcial)**: Asegura que si los rangos de horas se cruzan parcialmente (ej. 09:00-11:00 y 10:00-12:00) se detecte el conflicto (`true`).
    *   **Prueba 4 (Mismo horario)**: Valida colisión total ante secciones programadas a la misma hora y día.
    *   **Prueba 5 (Robustez ante datos nulos)**: Verifica que si la base de datos envía registros sin hora de inicio o corruptos, el motor devuelva `false` en lugar de fallar catastróficamente.
*   **Preferencias de Turnos (`checkTurno`)**:
    *   **Pruebas 6 y 7 (Mañana)**: Garantiza que se clasifiquen como "Mañana" solo los horarios que inician antes de las 13:00.
    *   **Pruebas 8 y 9 (Tarde)**: Asegura que la franja de tarde se ubique estrictamente entre las 13:00 y las 17:59.
    *   **Prueba 10 (Noche)**: Valida que los horarios que inician a partir de las 18:00 se mapeen correctamente al turno noche.
    *   **Prueba 11 (Cualquiera/Mixto)**: Comprueba que cuando la preferencia es abierta, el motor admita cualquier turno.
*   **Optimización de Viajes (`countUniqueDays`)**:
    *   **Prueba 12 (Días únicos)**: Valida que si un alumno asiste los días `[LU, MI]` y `[MI, VI]`, el sistema cuente solo 3 días únicos de viaje semanal usando un `Set`.
    *   **Prueba 13 (Arreglo vacío)**: Asegura que estudiantes no matriculados retornen 0 días de viaje.

---

### 2. Controlador de Autenticación (`tests/auth.test.js`)
*Contiene **4 pruebas** que utilizan simulación (Mocking) de Mongoose para proteger las vías de acceso a la aplicación.*

*   **Prueba 14 (Email inexistente)**: Comprueba que intentar loguearse con un correo no registrado devuelva un estado `HTTP 400`.
*   **Prueba 15 (Contraseña incorrecta)**: Asegura que si la clave no coincide con el hash en base de datos, `bcrypt` deniegue el paso devolviendo `HTTP 400`.
*   **Prueba 16 (Login exitoso)**: Verifica que al ingresar credenciales correctas se genere e inyecte un Token JWT válido con el rol y metadatos del usuario.
*   **Prueba 17 (Auto-Reparación de Admin)**: Algoritmo de resiliencia avanzada. Si un hash de administrador del sistema se corrompe en la BD, el endpoint detecta la contraseña por defecto de emergencia (`admin`) y reconstruye automáticamente un nuevo hash seguro guardándolo en la BD.

---

### 3. Límite de Créditos de Estudiantes (`tests/estudiante.test.js`)
*Valida las restricciones académicas dinámicas de los alumnos ante cursos reprobados.*

*   **Prueba 18 (Carga Normal)**: Estudiantes con historial académico óptimo reciben el límite máximo estándar de **22 créditos**.
*   **Prueba 19 (Penalización por triplica)**: Si un alumno reprueba un mismo curso 3 o más veces, su estado pasa a `esRestringido` y su límite de créditos máximo se reduce a **15 créditos** por seguridad.
*   **Prueba 20 (Rehabilitación)**: Comprueba que en cuanto el alumno aprueba el curso que causó la penalidad, el sistema le restaura automáticamente su límite normal de **22 créditos**.

---

### 4. Controlador de Docentes (`tests/docente.test.js`)
*Conjunto de **7 pruebas** enfocadas en las actividades del profesor (calificaciones y secciones).*

*   **Prueba 21 (Listar secciones)**: Comprueba el retorno de clases asignadas con `populate` de cursos y formateo `lean`.
*   **Prueba 22 (Rango de nota inválido)**: Asegura que el backend rechace notas fuera del rango estándar (menores a 0 o mayores a 20) o valores no numéricos.
*   **Prueba 23 (Sección inexistente)**: Valida el retorno de un error `HTTP 404` al calificar en una sección inexistente.
*   **Prueba 24 (Sección corrupta)**: Verifica la robustez si una sección no posee un curso de base de datos asignado.
*   **Prueba 25 (Nueva calificación)**: Confirma la inserción correcta de una calificación con comentarios cuando no existía previo registro.
*   **Prueba 26 (Actualización de nota)**: Valida que al re-calificar se sobrescriba la nota y comentarios del estudiante en el registro existente.
*   **Prueba 27 (Listar notas)**: Mapea las calificaciones de un aula específica.

---

### 5. Planificación y Gestión Horaria (`tests/planificacion.test.js`)
*Consta de **10 pruebas** que validan la creación y asignación inteligente de recursos docentes y horarios.*

*   **Helpers de Planificación (Pruebas 28 a 31)**:
    *   Mapeo de strings horarios a decimales (ej. `'08:30'` a `8.5`).
    *   Cálculo de carga horaria acumulada de secciones.
    *   Clasificación de estados de carga (`normal`, `limite`, `exceso`).
*   **Controladores y Asignación (Pruebas 32 a 37)**:
    *   Obtención de KPIs de ocupación y cupos máximos de aulas.
    *   Carga horaria actual de profesores y recomendación inteligente de docentes sin traslapes para cubrir cursos libres.
    *   Liberación y edición interactiva de horarios en secciones del sistema.

---

### 6. Controlador del Administrador (`tests/admin.test.js`)
*Módulo de **8 pruebas** enfocadas en CRUDs y métricas de impacto de infraestructura.*

*   **Prueba 38 (Conteos generales)**: Mapeo exacto de la base de datos (alumnos, docentes, secciones, cursos, carreras).
*   **Prueba 39 (Métricas APM)**: Comprueba el correcto almacenamiento de latencias de red y carga en memoria empleando el **buffer circular O(1)** implementado.
*   **Prueba 40 (Cálculo de emisiones de CO₂)**: Valida la fórmula ecológica de Green Code que mide gramos de CO₂ según los bytes transferidos.
*   **Prueba 41 y 42 (Importación masiva)**: Prueba la importación de alumnos desde formato JSON estructurado, mapeo de nombres de carrera a IDs y descarte de duplicados.
*   **Pruebas 43 a 45 (CRUDs)**: Validaciones del ciclo de vida de Cursos, Carreras y Estudiantes en el backend.

---

### 7. Middleware de Autenticación (`tests/middleware.test.js`)
*Valida las políticas de seguridad en las cabeceras de la API.*

*   **Prueba 46 (Sin token)**: Deniega el acceso (`HTTP 401`) si la petición carece del header `x-auth-token`.
*   **Prueba 47 (Token corrupto)**: Retorna error `HTTP 401` si la firma del token JWT es incorrecta o expiró.
*   **Prueba 48 (Paso exitoso)**: Verifica que un token verídico agregue el objeto `req.user` al flujo y llame a la función `next()` con éxito.
