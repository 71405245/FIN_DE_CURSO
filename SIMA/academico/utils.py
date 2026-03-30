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

    return True, "Puede llevar"


# 🤖 IA: RECOMENDAR CURSOS AUTOMÁTICAMENTE
def recomendar_cursos(estudiante):

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

    return recomendaciones[:5]  # TOP 5


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