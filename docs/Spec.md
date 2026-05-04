# Especificación Formal del Sistema SIMA (Spec.md)

Este documento detalla la especificación técnica, flujos de datos y reglas de negocio del sistema de gestión académica SIMA.

## 1. Especificación del Sistema

SIMA es una aplicación web basada en Django diseñada para gestionar el ciclo de vida académico de una institución educativa, desde la gestión de mallas curriculares hasta el proceso de matrícula y seguimiento de alumnos.

## 2. Definiciones de Entradas y Salidas

### 2.1 Módulo de Matrícula
*   **Entradas:**
    *   ID del Alumno (Extraído del Token JWT).
    *   Lista de IDs de Secciones seleccionadas.
    *   Confirmación de ampliación de créditos (opcional, requiere autorización).
*   **Salidas:**
    *   Ficha de Matrícula (PDF).
    *   Resumen de créditos matriculados.
    *   Mensajes de error detallados (en caso de fallar restricciones).

### 2.2 Módulo Académico (Administración)
*   **Entradas:**
    *   Datos del curso (Nombre, código, créditos, prerequisitos).
    *   Horarios de secciones (Día, hora inicio/fin, aula).
    *   Carga de notas (CSV o formulario manual).
*   **Salidas:**
    *   Reporte de actas consolidadas.
    *   Disponibilidad de aulas por pabellón.

## 3. Reglas de Negocio (Business Rules)

### BR-01: Cálculo de Promedio Ponderado
El promedio ponderado se calcula multiplicando la nota final de cada curso por sus créditos, sumando estos resultados y dividiéndolos por el total de créditos cursados.

### BR-02: Prioridad de Matrícula
El sistema asigna turnos de matrícula basados en el promedio ponderado del ciclo anterior. A mayor promedio, el alumno tiene un turno más temprano para asegurar cupo en sus secciones preferidas.

### BR-03: Validación de Prerequisitos
Un curso $C_2$ tiene como prerequisito $C_1$. El sistema solo permitirá la matrícula en $C_2$ si el estado de $C_1$ en el historial del alumno es "Aprobado" (Nota $\ge 13$).

### BR-04: Gestión de Créditos
1.  Todo alumno inicia con un máximo de 24 créditos.
2.  Si el alumno tiene un promedio superior a 16, el sistema habilita automáticamente la opción de solicitar hasta 28 créditos.
3.  La aprobación final de los créditos extra la realiza el Administrador en el módulo de "Solicitudes Especiales".

### BR-05: Control de Inasistencias
Si un alumno supera el 30% de inasistencias en un curso, el sistema marcará automáticamente su estado como "DPI" (Desaprobado por Inasistencias) y no podrá rendir el examen final.

## 4. Flujo de Datos Principal (Matrícula)

1.  **Validación de Sesión**: El sistema verifica el JWT.
2.  **Consulta de Elegibilidad**: El sistema verifica si el alumno tiene deudas o sanciones.
3.  **Filtrado de Cursos**: Se muestran solo los cursos cuyos prerequisitos se cumplen.
4.  **Selección y Validación**: El alumno elige secciones; el sistema valida cruces de horario y capacidad en tiempo real.
5.  **Persistencia**: Se crea el registro de matrícula y se actualizan los cupos de las secciones.
