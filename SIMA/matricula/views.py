from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse

from academico.utils import puede_llevar_curso
from academico.models import Curso, Seccion
from .models import Matricula
from .utils import hay_cruce, generar_horarios_validos

from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from xhtml2pdf import pisa
from django.template.loader import get_template

MAX_CREDITOS = 22


# 📝 MATRICULARSE
@login_required
def matricularse(request, seccion_id):

    seccion = get_object_or_404(Seccion, id=seccion_id)
    curso = seccion.curso
    estudiante = request.user

    # 🔥 validar prerrequisitos
    puede, motivo = puede_llevar_curso(estudiante, curso)

    if not puede:
        messages.error(request, motivo)
        return redirect('cursos')

    # 🔥 evitar duplicado
    ya = Matricula.objects.filter(
        estudiante=estudiante,
        seccion__curso=curso
    ).exists()

    if ya:
        messages.error(request, "Ya estás matriculado en este curso")
        return redirect('cursos')

    # 🔥 validar créditos
    matriculas_actuales = Matricula.objects.filter(estudiante=estudiante).select_related('seccion__curso')

    creditos_actuales = sum(m.seccion.curso.creditos for m in matriculas_actuales)
    
    if creditos_actuales == 0 and curso.creditos < 1:
        messages.error(request, "Tu primera matrícula debe ser en un curso de 1 o más créditos.")
        return redirect('cursos')

    if creditos_actuales + curso.creditos > MAX_CREDITOS:
        messages.error(request, "Excedes el límite de créditos")
        return redirect('cursos')

    # 🔥 validar cruce de horarios
    secciones_actuales = Seccion.objects.filter(
        matricula__estudiante=estudiante
    )

    if hay_cruce(seccion, secciones_actuales):
        messages.error(request, "Cruce de horarios")
        return redirect('cursos')

    # ✅ guardar matrícula
    Matricula.objects.create(
        estudiante=estudiante,
        seccion=seccion
    )

    messages.success(request, "Matriculado correctamente")

    return redirect('mis_matriculas')


# 📊 MIS MATRÍCULAS
@login_required
def mis_matriculas(request):
    matriculas = Matricula.objects.filter(
        estudiante=request.user
    ).select_related('seccion__curso')

    return render(request, 'mis_matriculas.html', {
        'matriculas': matriculas
    })


# 📄 DESCARGAR HORARIO PDF
@login_required
def descargar_horario(request):

    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

    horas = [
        "07:00 - 09:00",
        "09:00 - 11:00",
        "11:00 - 13:00",
        "14:00 - 16:00",
        "16:00 - 18:00",
        "18:00 - 20:00",
    ]

    matriz = []

    matriculas = Matricula.objects.filter(estudiante=request.user).select_related('seccion__curso', 'seccion__salon')

    for hora in horas:
        fila = {
            "hora": hora,
            "dias": []
        }

        for dia in dias:
            contenido = None

            for m in matriculas:
                sec = m.seccion
                rango = f"{sec.hora_inicio.strftime('%H:%M')} - {sec.hora_fin.strftime('%H:%M')}"

                if sec.dia == dia and rango == hora:
                    contenido = {
                        "curso": sec.curso.nombre,
                        "salon": sec.salon.numero if sec.salon else "Sin asignar"
                    }

            fila["dias"].append(contenido)

        matriz.append(fila)

    template = get_template("horario_pdf.html")

    html = template.render({
        "dias": dias,
        "matriz": matriz
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="horario.pdf"'

    pisa.CreatePDF(html, dest=response)

    return response


# 📚 VER SECCIONES
@login_required
def ver_secciones(request, curso_id):

    curso = get_object_or_404(Curso, id=curso_id)
    secciones = Seccion.objects.filter(curso=curso)

    return render(request, 'ver_secciones.html', {
        'curso': curso,
        'secciones': secciones
    })


# 📅 HORARIO VISUAL WEB (PRO)
@login_required
def horario_visual(request):

    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

    horas = [
        "07:00 - 09:00",
        "09:00 - 11:00",
        "11:00 - 13:00",
        "14:00 - 16:00",
        "16:00 - 18:00",
        "18:00 - 20:00",
    ]

    matriz = []

    matriculas = Matricula.objects.filter(
        estudiante=request.user
    ).select_related('seccion__curso', 'seccion__salon')

    colores = ["#0d6efd", "#198754", "#dc3545", "#ffc107", "#6f42c1"]

    for hora in horas:
        fila = {
            "hora": hora,
            "dias": []
        }

        for dia in dias:
            contenido = None

            for m in matriculas:
                sec = m.seccion
                rango = f"{sec.hora_inicio.strftime('%H:%M')} - {sec.hora_fin.strftime('%H:%M')}"

                if sec.dia == dia and rango == hora:
                    contenido = {
                        "curso": sec.curso.nombre,
                        "salon": sec.salon.numero if sec.salon else "Sin asignar",
                        "color": colores[sec.id % len(colores)]
                    }

            fila["dias"].append(contenido)

        matriz.append(fila)

    return render(request, "horario_visual.html", {
        "dias": dias,
        "matriz": matriz
    })


# 🤖 HORARIOS RECOMENDADOS POR IA
@login_required
def horarios_recomendados(request):
    estudiante = request.user
    
    # Check if student already has enrollments, maybe block or warn?
    matriculas_actuales = Matricula.objects.filter(estudiante=estudiante)
    if matriculas_actuales.exists():
        messages.warning(request, "Ya tienes cursos matriculados. Generar un horario completo no reemplazará los actuales, pero podría causar cruces si te matriculas.")

    horarios_generados = generar_horarios_validos(estudiante)

    return render(request, "horarios_recomendados.html", {
        "horarios_generados": horarios_generados
    })


# ⚡ MATRICULAR HORARIO COMPLETO (IA)
@login_required
def matricular_horario_completo(request):
    if request.method == "POST":
        secciones_ids = request.POST.getlist("secciones_ids")
        estudiante = request.user
        
        if not secciones_ids:
            messages.error(request, "No se recibieron secciones válidas.")
            return redirect('horarios_recomendados')
            
        # Get actual objects
        secciones = Seccion.objects.filter(id__in=secciones_ids)
        
        # Validar creditos (incluyendo matriculas actuales)
        matriculas_actuales = Matricula.objects.filter(estudiante=estudiante).select_related('seccion__curso')
        creditos_actuales = sum(m.seccion.curso.creditos for m in matriculas_actuales)
        
        nuevos_creditos = sum(sec.curso.creditos for sec in secciones)
        
        if creditos_actuales == 0 and nuevos_creditos < 1:
            messages.error(request, "Debes matricularte en al menos un curso de 1 o más créditos.")
            return redirect('horarios_recomendados')
            
        if creditos_actuales + nuevos_creditos > MAX_CREDITOS:
            messages.error(request, "Excedes el límite de créditos.")
            return redirect('horarios_recomendados')
            
        # Matricular iterando
        matriculados_count = 0
        for seccion in secciones:
            # Check overlap with existing ones individually
            secciones_matriculadas_ahora = Seccion.objects.filter(matricula__estudiante=estudiante)
            if not hay_cruce(seccion, secciones_matriculadas_ahora):
                # Avoid duplicates
                ya = Matricula.objects.filter(estudiante=estudiante, seccion__curso=seccion.curso).exists()
                if not ya:
                    Matricula.objects.create(estudiante=estudiante, seccion=seccion)
                    matriculados_count += 1
                    
        if matriculados_count > 0:
            messages.success(request, f"¡Te has matriculado exitosamente en {matriculados_count} cursos del horario recomendado!")
        else:
            messages.error(request, "No se pudo realizar la matrícula (posibles cruces o ya estabas matriculado).")
            
        return redirect('mis_matriculas')

    return redirect('horarios_recomendados')

# 📝 RECTIFICAR MATRÍCULA
@login_required
def rectificar_matricula(request, matricula_id):
    matricula = get_object_or_404(Matricula, id=matricula_id, estudiante=request.user)
    
    if request.method == 'POST':
        # Validar si al eliminar se queda con menos de 1 crédito en total, pero si tiene 0 no pasa nada.
        # En muchos sistemas la rectificación permite retirarse de todo, pero si queremos forzar 
        # que siempre tenga 1 crédito, podríamos añadirlo. Por ahora permitimos retirarse libremente.
        matricula.delete()
        messages.success(request, f"Se ha rectificado (eliminado) tu matrícula del curso {matricula.seccion.curso.nombre} exitosamente.")
    
    return redirect('mis_matriculas')