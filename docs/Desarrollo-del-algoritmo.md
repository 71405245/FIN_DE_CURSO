# Documentación Técnica: Algoritmos de IA y Restricciones (SIMA)

Este documento detalla a nivel técnico los algoritmos principales encargados de la generación de horarios (IA) y de la validación dinámica de créditos por reiterancia de desaprobación.

---

## 1. Algoritmo de Generación de Horarios (Motor IA)

El núcleo de la recomendación de horarios utiliza un enfoque de **Búsqueda en Profundidad (DFS - Depth First Search)** combinado con técnicas de **Backtracking** y **Poda (Pruning)**. Este algoritmo explora el árbol de posibles combinaciones de secciones para los cursos recomendados, descartando tempranamente las ramas inválidas.

### 1.1 Lógica Central (DFS con Poda)
El algoritmo toma las secciones disponibles de los cursos permitidos para el alumno y busca combinaciones que cumplan con los filtros duros: sin cruces y sin exceder el límite de créditos.

```python
# Ubicación: matricula/utils.py (Extracto de generar_horarios_validos)

def dfs(curso_idx, comb_actual, creditos_acum, secc_actuales):
    # Caso base: se ha evaluado una sección para cada curso requerido
    if curso_idx == len(secciones_por_curso):
        dias_asistencia = len(set(s.dia for s in comb_actual))
        
        # Filtro de días máximos configurados por el usuario
        if dias_asistencia <= dias_maximos:
            # 1. Cálculo de "Huecos" (tiempos muertos entre clases)
            huecos = 0
            secciones_por_dia = {}
            for sec in comb_actual:
                secciones_por_dia.setdefault(sec.dia, []).append(sec)
                
            for dia, seccs in secciones_por_dia.items():
                if len(seccs) > 1:
                    seccs.sort(key=lambda x: x.hora_inicio)
                    for i in range(len(seccs) - 1):
                        f = seccs[i].hora_fin
                        inic = seccs[i+1].hora_inicio
                        # Lógica para sumar minutos de "hueco"
                        dt_f = datetime.combine(date.today(), f)
                        dt_i = datetime.combine(date.today(), inic)
                        if dt_i > dt_f:
                            huecos += (dt_i - dt_f).total_seconds() / 60
                            
            # 2. Cálculo de Penalización por Turno (Mañana, Tarde, Noche)
            penal_turno = 0
            if turno_pref != 'cualquiera':
                for sec in comb_actual:
                    h = sec.hora_inicio.hour
                    if turno_pref == 'mañana' and h >= 14: penal_turno += 10
                    elif turno_pref == 'tarde' and (h < 14 or h >= 18): penal_turno += 10
                    elif turno_pref == 'noche' and h < 18: penal_turno += 10
                    
            # Se guarda la combinación con sus métricas para ordenar luego
            combinaciones_validas.append({
                'secciones': comb_actual,
                'dias_asistencia': dias_asistencia,
                'huecos': huecos,
                'penalizacion_turno': penal_turno,
                'total_creditos': creditos_acum
            })
        return

    # Exploración de ramas (Ramas representan secciones posibles de un curso)
    for sec in secciones_por_curso[curso_idx]:
        costo = obtener_costo_real_curso(estudiante, sec.curso)
        
        # PODA 1: Se excede el límite de créditos? Cortar rama.
        if creditos_acum + costo > limite_actual_estudiante: continue
        
        # PODA 2: Hay cruce de horarios? Cortar rama.
        if hay_cruce(sec, secc_actuales): continue
        
        # Llamada recursiva (avanzar en profundidad)
        dfs(curso_idx + 1, comb_actual + [sec], creditos_acum + costo, secc_actuales + [sec])
```

### 1.2 Sistema de Ordenamiento (Ranking de Resultados)
Una vez halladas todas las combinaciones posibles, el motor ordena (rankea) las soluciones para priorizar la "mejor":
```python
# Se ordenan primando: 1. El turno preferido, 2. Menor cantidad de días de ida a la U, 3. Menos huecos (horas muertas).
return sorted(combinaciones_validas, key=lambda x: (x['penalizacion_turno'], x['dias_asistencia'], x['huecos']))[:5]
```

### 1.3 Sistema de Flexibilización Adaptativa
Si las preferencias del usuario son tan estrictas que no hay combinaciones válidas, la IA comienza a "relajar" progresivamente los criterios:
1. **Intento 1**: Relajar la cantidad de días de asistencia.
2. **Intento 2**: Relajar el turno preferido (pasar a "cualquiera").
3. **Intento 3**: Reducir la cantidad de cursos solicitados (-1 curso).

---

## 2. Algoritmo de Límite de Créditos Dinámico (Restricción por 4ta Vez)

Este algoritmo es una restricción dura (Hard Constraint). Se evalúa en tiempo real antes de sugerir cursos y bloquea al estudiante limitándolo a un máximo de **15 créditos** si tiene cursos desaprobados 3 o más veces sin haberlos aprobado aún.

### 2.1 Código Implementado
```python
# Ubicación: academico/utils.py (obtener_limite_creditos_personalizado)

def obtener_limite_creditos_personalizado(estudiante):
    from django.db.models import Count
    
    # 1. Obtener los IDs de los cursos que el estudiante YA APROBÓ
    # Esto es crucial para no penalizar si en el pasado jaló 3 veces pero en la 4ta pasó.
    cursos_aprobados = HistorialAcademico.objects.filter(
        estudiante=estudiante, 
        estado='aprobado'
    ).values_list('curso_id', flat=True)
    
    # 2. Contar desaprobados solo de cursos NO aprobados aún
    # Se utiliza Django ORM para agrupar (annotate) y filtrar a nivel de base de datos.
    cursos_con_mas_de_3_jales_activos = HistorialAcademico.objects.filter(
        estudiante=estudiante, 
        estado='desaprobado'
    ).exclude(
        curso_id__in=cursos_aprobados
    ).values('curso').annotate(count=Count('curso')).filter(count__gte=3)
    
    # 3. Aplicar restricción dura
    if cursos_con_mas_de_3_jales_activos.exists():
        return 15  # Límite máximo de créditos para estado crítico
        
    return estudiante.limite_creditos # Devuelve límite normal (24/28)
```

### 2.2 Penalidad por Costo de Curso
Como complemento, el sistema tiene una función `obtener_costo_real_curso` que aumenta el "peso" (costo en créditos) de un curso en base a cuántas veces se ha jalado (`curso.creditos + veces_desaprobado`). Esto obliga al motor DFS a priorizar que el estudiante lleve solo lo necesario.
