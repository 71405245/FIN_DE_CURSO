# Constitución del Sistema SIMA (Sistema Académico)

Este documento define los principios fundamentales, reglas globales y restricciones que rigen el comportamiento y la lógica del sistema SIMA.

## 1. Principios del Sistema

1.  **Integridad Académica**: El sistema debe garantizar que toda la información académica (notas, cursos, prerequisitos) sea veraz y coherente.
2.  **Seguridad de Acceso**: Solo usuarios autenticados y con los roles adecuados (Administrador, Docente, Alumno) pueden acceder a funciones específicas.
3.  **Transparencia**: El proceso de matrícula debe ser claro para el alumno, indicando siempre por qué un curso puede o no ser tomado.
4.  **Escalabilidad**: El diseño debe permitir la adición de nuevos ciclos, facultades y carreras sin comprometer el rendimiento.

## 2. Reglas Globales

1.  **Autenticación Obligatoria**: Ninguna operación de escritura o consulta de datos sensibles puede realizarse sin un token JWT válido.
2.  **Trazabilidad**: Toda acción crítica (cambio de notas, aprobación de matrículas extraordinarias) debe quedar registrada (Audit Log).
3.  **Consistencia de Datos**: No se permiten registros huérfanos. Por ejemplo, una sección no puede existir sin un curso asignado.

## 3. Restricciones

### 3.1 Restricciones Duras (Hard Constraints)
*No pueden ser violadas bajo ninguna circunstancia por la lógica del sistema.*

1.  **Prerequisitos**: Un alumno no puede matricularse en un curso si no ha aprobado los prerequisitos definidos en su plan de estudios.
2.  **Cruce de Horarios**: El sistema debe impedir la matrícula en dos cursos cuyos horarios se traslapen, incluso por un minuto.
3.  **Capacidad de Aula**: No se puede matricular a más alumnos de los que permite el aforo físico (o virtual) definido para la sección.
4.  **Estado de Alumno**: Solo los alumnos con estado "Activo" pueden realizar procesos de matrícula.

### 3.2 Restricciones Blandas (Soft Constraints)
*Pueden ser flexibilizadas mediante autorización administrativa.*

1.  **Límite de Créditos**: El límite estándar es de **24 créditos** por ciclo.
    *   *Excepción*: Se puede ampliar hasta **28 créditos** con aprobación explícita de un Administrador/Director de Carrera.
2.  **Deuda Pendiente**: Los alumnos con deudas financieras menores a un umbral definido pueden matricularse si se les otorga una prórroga temporal.
3.  **Carga Docente**: Se recomienda un límite de horas para los docentes, pero el sistema permitirá sobrepasarlo si el Administrador lo justifica.
