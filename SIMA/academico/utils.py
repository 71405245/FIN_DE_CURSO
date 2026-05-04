from .models import Prerrequisito, Curso, HistorialAcademico


# 🎯 VALIDAR SI UN ESTUDIANTE PUEDE LLEVAR UN CURSO
def puede_llevar_curso(estudiante, curso):

    # 🚫 1. BLOQUEAR SI YA APROBÓ EL CURSO
    ya_aprobado = HistorialAcademico.objects.filter(
        estudiante=estudiante,
        curso=curso,
        estado='aprobado'
    ).exists()

    if ya_aprobado:
        return False, "Curso ya aprobado"

    # 📚 2. OBTENER PRERREQUISITOS
    prerrequisitos = Prerrequisito.objects.filter(curso=curso)

    for p in prerrequisitos:

        # 🔹 PRERREQUISITO POR CURSO
        if p.curso_requisito:
            aprobado = HistorialAcademico.objects.filter(
                estudiante=estudiante,
                curso=p.curso_requisito,
                estado='aprobado'
            ).exists()

            if not aprobado:
                return False, f"Falta aprobar {p.curso_requisito.nombre}"

        # 🔹 PRERREQUISITO POR CRÉDITOS
        if p.creditos_minimos:
            if estudiante.creditos_acumulados < p.creditos_minimos:
                return False, f"Requiere {p.creditos_minimos} créditos"

    # 🚫 3. BLOQUEAR SI ES DE UN CICLO SUPERIOR Y NO TIENE PRERREQUISITOS
    # Si el curso es de un ciclo mayor al del estudiante, y no hay ningún prerrequisito
    # que lo habilite "naturalmente", entonces no se puede llevar.
    # Si sí tiene prerrequisitos, la lógica anterior ya validó si los pasó o no.
    if curso.ciclo and estudiante.ciclo_actual:
        if curso.ciclo.numero > estudiante.ciclo_actual:
            if not prerrequisitos.exists():
                return False, f"Solo puedes llevar cursos hasta tu ciclo actual ({estudiante.ciclo_actual})"

    return True, "Puede llevar"


# 🤖 IA: RECOMENDAR CURSOS AUTOMÁTICAMENTE
def recomendar_cursos(estudiante, limite=5):

    cursos = Curso.objects.all()
    recomendaciones = []

    for curso in cursos:
        puede, _ = puede_llevar_curso(estudiante, curso)

        if puede:
            recomendaciones.append(curso)

    # 🎯 ORDENAR POR CICLO (DE MENOR A MAYOR)
    recomendaciones = sorted(
        recomendaciones,
        key=lambda x: x.ciclo.numero if x.ciclo else 0
    )

    return recomendaciones[:limite]


# 📊 (EXTRA PRO) CALCULAR PROMEDIO DEL ESTUDIANTE
def calcular_promedio(estudiante):

    historiales = HistorialAcademico.objects.filter(
        estudiante=estudiante,
        estado='aprobado'
    )

    total_notas = 0
    total_creditos = 0

    for h in historiales:
        total_notas += h.nota * h.curso.creditos
        total_creditos += h.curso.creditos

    if total_creditos == 0:
        return 0

    return round(total_notas / total_creditos, 2)

# 🚫 RESTRICCIÓN: LÍMITE DE CRÉDITOS DINÁMICO
def obtener_limite_creditos_personalizado(estudiante):
    """
    Si un estudiante tiene un curso desaprobado 3 o más veces y AÚN no lo aprueba,
    su límite se reduce a 15 créditos.
    """
    from django.db.models import Count
    # 1. Obtener cursos aprobados para excluirlos
    cursos_aprobados = HistorialAcademico.objects.filter(
        estudiante=estudiante, 
        estado='aprobado'
    ).values_list('curso_id', flat=True)
    
    # 2. Contar jales solo de cursos NO aprobados aún
    cursos_con_mas_de_3_jales_activos = HistorialAcademico.objects.filter(
        estudiante=estudiante, 
        estado='desaprobado'
    ).exclude(
        curso_id__in=cursos_aprobados
    ).values('curso').annotate(count=Count('curso')).filter(count__gte=3)
    
    if cursos_con_mas_de_3_jales_activos.exists():
        return 15
        
    return estudiante.limite_creditos

# 💰 RESTRICCIÓN: COSTO EXTRA POR JALAR
def obtener_costo_real_curso(estudiante, curso):
    """
    Si se jala un curso, la próxima vez cuesta más créditos para el límite.
    Penalidad: +1 crédito por cada vez que se jaló.
    Si ya se aprobó, el costo vuelve a ser el base.
    """
    # Si ya lo aprobó, no hay penalidad
    ya_aprobo = HistorialAcademico.objects.filter(
        estudiante=estudiante,
        curso=curso,
        estado='aprobado'
    ).exists()
    
    if ya_aprobo:
        return curso.creditos

    veces_desaprobado = HistorialAcademico.objects.filter(
        estudiante=estudiante,
        curso=curso,
        estado='desaprobado'
    ).count()
    
    return curso.creditos + veces_desaprobado

# 📈 HELPER PARA GRÁFICOS DE HISTORIAL
def obtener_datos_grafico_jale(estudiante):
    from django.db.models import Count
    jales = HistorialAcademico.objects.filter(
        estudiante=estudiante,
        estado='desaprobado'
    ).values('curso__nombre').annotate(cantidad=Count('id'))
    
    labels = [j['curso__nombre'] for j in jales]
    data = [j['cantidad'] for j in jales]
    
    return labels, data