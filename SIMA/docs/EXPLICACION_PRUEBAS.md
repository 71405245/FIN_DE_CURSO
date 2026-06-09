# Documentación de la Suite de Pruebas (Jest)

Este documento detalla el propósito técnico y la lógica de negocio validada detrás de cada una de las 20 pruebas automatizadas implementadas en el sistema SIMA. Estas pruebas actúan como "guardianes" para asegurar que futuras modificaciones no rompan los algoritmos principales.

---

## 1. Módulo del Motor de IA (`tests/scheduler.test.js`)
*Este archivo contiene 13 pruebas enfocadas en validar matemáticamente los hekpers aislados que alimentan al Agente de Recomendación de Horarios.*

### Lógica de Solapamientos (`checkOverlap`)
Esta función determina si dos horarios chocan entre sí, siendo crucial para generar un horario válido y libre de cruces.
- **Test 1:** *Verifica días dispares.* Si la sección A es Lunes y la B es Martes, garantiza que el algoritmo retorne `false` (no se cruzan) sin importar la hora.
- **Test 2:** *Horarios continuos/secuenciales.* Si la clase A termina exactamente a las 10:00 y la clase B empieza a las 10:00 del mismo día, asegura que retorne `false` porque el alumno puede asistir a una tras otra.
- **Test 3:** *Cruce Parcial.* Si la clase A es de 09:00 a 11:00 y la B de 10:00 a 12:00, valida que el algoritmo levante una bandera de colisión (`true`).
- **Test 4:** *Cruce Total.* Verifica que si dos horarios son matemáticamente idénticos retornen `true`.
- **Test 5:** *Robustez de Datos (Edge Cases).* Comprueba que si la base de datos envía datos nulos o corruptos (ej. sin hora de inicio), el motor no explote y simplemente los descarte (`false`).

### Preferencias de Turnos (`checkTurno`)
Asegura que el scoring del IA clasifique correctamente si una hora cae en la mañana, tarde o noche.
- **Test 6 y 7 (MAÑANA):** La regla estricta indica que pertenece a la "Mañana" solo si la hora de inicio es menor a las 13:00. El test 7 avisa que las 13:30 ya no son mañana.
- **Test 8 y 9 (TARDE):** La franja debe ubicarse exactamente entre las 13:00 y antes de las 18:00 (17:59). Descarta horarios marginales (ej. 12:30).
- **Test 10 (NOCHE):** Valida cualquier horario donde el bloque empiece pasadas las 18:00.
- **Test 11 (Flexibilidad):** Si el alumno escoge "Cualquiera" o "Mixto", el filtro se apaga y permite cualquier asignación devolviendo siempre `true`.

### Optimización de Días Libres (`countUniqueDays`)
Calcula cuántos viajes debe hacer el alumno a la universidad.
- **Test 12:** Agrupa eficientemente los días en común. Por ejemplo, [LU, MI] y [MI, VI] se procesan mediante un `Set` para indicar que son solo 3 días en total.
- **Test 13:** Valida que un array vacío de un alumno no matriculado no rompa el sistema y devuelva 0.

---

## 2. Módulo de Autenticación (`tests/auth.test.js`)
*Contiene 4 pruebas críticas utilizando Mocking (simulaciones) contra los Modelos de Mongoose, asegurando que las puertas de acceso estén blindadas.*

- **Test 14 (Email Inexistente):** Asegura que intentar loguearse con un correo no registrado devuelva HTTP 400 (Bad Request).
- **Test 15 (Contraseña Errónea):** Verifica que la librería Bcrypt intercepte correctamente intentos de intrusión y bloquee el acceso retornando 400.
- **Test 16 (Acceso Exitoso):** Comprueba que cuando Bcrypt valida el hash correctamente, el controlador responde inyectando el Token JWT codificado con el Rol y Datos del Usuario.
- **Test 17 (Auto-Repair del Administrador):** Un test de seguridad avanzado. Si por error humano se altera el Hash del Administrador del Sistema directo en la base de datos, el código es capaz de detectarlo y auto-recomponer la contraseña nativa (`admin`) reiniciando el hash automáticamente.

---

## 3. Módulo de Límite de Créditos Dinámico (`tests/estudiante.test.js`)
*Valida el complejo algoritmo de restricciones disciplinarias y de rendimiento sobre un total de 3 pruebas complejas.*

- **Test 18 (Carga Normal):** Inyecta historial académico "Limpio" (Cursos aprobados o cursos jalados 1 o 2 veces pero no de forma reiterativa mayor a 3). Valida que asigne un **tope de 22 Créditos** con éxito.
- **Test 19 (Restricción por Reiterancia - Penalidad):** Genera múltiples registros desaprobados en un MISMO curso (`c1`). Al sobrepasar el umbral de 3 veces sin haberlo aprobado luego, el test valida que una bandera `esRestringido` se asigne a `true` y el límite de créditos se desplome a **15**.
- **Test 20 (Rehabilitación Académica):** Evalúa un escenario dinámico donde el estudiante tiene 3 cursos desaprobados en `c1`, pero registra un 4to intento con estado "aprobado". Comprueba que el algoritmo entienda esto como "superación de materia" y elija liberarlo de la penalidad, restaurándole sus **22 créditos**. 
