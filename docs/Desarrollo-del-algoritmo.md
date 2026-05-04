 ## Desarrollo del Algoritmo 

1. Introducción
El módulo de matrícula inteligente del sistema SIMA resuelve el problema clásico de asignación de horarios y satisfacción de restricciones (CSP - Constraint Satisfaction Problem). El objetivo principal del algoritmo es generar combinaciones de secciones de cursos que no presenten cruces, respeten los requisitos académicos y optimicen las preferencias de tiempo del estudiante.

2. Enfoque Algorítmico Principal
El algoritmo base está implementado en la función generar_horarios_validos (ubicada en matricula/utils.py). Utiliza una estrategia de Búsqueda en Profundidad (DFS - Depth First Search) combinada con técnicas agresivas de Poda (Pruning).

2.1. Recolección de Datos y Restricciones Generales
Antes de iniciar la búsqueda, el algoritmo recopila:

Preferencias del estudiante: Cantidad de cursos deseada, límite de días de asistencia y turno preferido (Mañana, Tarde, Noche).
Límites Académicos: Límite máximo de créditos permitidos para el estudiante (considerando penalidades por cursos desaprobados previamente).
Cursos Candidatos: Lista de cursos recomendados que el estudiante ya está habilitado para llevar (prerrequisitos cumplidos).

2.2. Árbol de Búsqueda (DFS)
El algoritmo construye un árbol implícito donde cada nivel representa un curso a matricular y cada nodo (rama) representa una sección disponible de ese curso.

python
# Pseudocódigo de la exploración
def dfs(curso_idx, combinacion_actual, creditos_acumulados, secciones_actuales):
    if curso_idx == total_cursos:
        guardar_y_evaluar_combinacion()
        return
        
    para cada seccion en secciones_del_curso[curso_idx]:
        si pasa_podas(seccion):
            dfs(curso_idx + 1, nueva_combinacion, ...)
            
3. Condiciones de Poda (Pruning)
Para evitar la explosión combinatoria (evaluar millones de horarios imposibles), el algoritmo corta ramas enteras del árbol de búsqueda mediante dos validaciones en tiempo real:

Poda por Créditos: Si al intentar agregar una sección, la suma de los créditos supera el limite_actual_estudiante, la rama se descarta inmediatamente.
Poda por Cruce de Horario: La función hay_cruce(seccion, secciones_actuales) detecta si los intervalos de tiempo (hora_inicio, hora_fin) de la nueva sección se solapan con cualquier sección ya incluida en la combinación actual en el mismo día.
4. Métricas de Optimización y "Scoring"
Cuando el DFS alcanza una "hoja" (una combinación válida y completa), no la acepta ciegamente. Se calculan tres métricas de calidad:

Días de Asistencia: Cuenta en cuántos días distintos el estudiante tendría que ir a la universidad. Si supera el límite de su preferencia, se descarta.
Huecos (Tiempo Muerto): Calcula los minutos inactivos entre clases del mismo día.
Penalización de Turno: Aplica puntos de castigo (+10) por cada curso que inicie fuera del turno preferido. Ejemplo: Si prefiere "mañana" y una clase inicia a las 15:00 hrs.
Ordenamiento: Las combinaciones exitosas se ordenan dando máxima prioridad a la menor penalización de turno, luego a los menores días de asistencia y finalmente a los menores "huecos" de tiempo. Se devuelven solo las 5 mejores opciones.

5. Estrategia de Flexibilización Inteligente
Un problema común en estos sistemas es devolver "0 resultados" si las preferencias son muy estrictas. SIMA implementa una degradación elegante:

Intento 1 (Estricto): Busca con las preferencias exactas.
Intento 2 (Relajar Días): Si falla, ignora el límite de días y permite hasta 7 días de asistencia.
Intento 3 (Relajar Turno): Si falla, busca en cualquier turno disponible.
Intento 4 (Reducir Carga): Si es imposible evitar cruces, reduce la cantidad de cursos solicitados en 1 y repite el proceso, maximizando la carga posible. El sistema notifica al estudiante mediante un mensaje_flex si alguna de sus preferencias tuvo que ser sacrificada.
