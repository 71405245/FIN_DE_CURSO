from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Curso
from .utils import puede_llevar_curso
from .models import HistorialAcademico
from .forms import RegistrarNotaForm

@login_required
def lista_cursos(request):
    cursos = Curso.objects.all().order_by('ciclo__numero')

    resultado = []

    for curso in cursos:
        puede, motivo = puede_llevar_curso(request.user, curso)

        resultado.append({
            'curso': curso,
            'puede': puede,
            'motivo': motivo
        })

    return render(request, 'cursos.html', {
        'cursos': resultado
    })

def historial_academico(request):
    historial = HistorialAcademico.objects.filter(
        estudiante=request.user
    ).order_by('ciclo')

    return render(request, 'historial.html', {
        'historial': historial
    })

def registrar_nota(request, estudiante_id):

    if request.user.rol != 'admin':
        return redirect('dashboard')

    estudiante = get_object_or_404(Usuario, id=estudiante_id)

    if request.method == 'POST':
        form = RegistrarNotaForm(request.POST)

        if form.is_valid():
            historial = form.save(commit=False)
            historial.estudiante = estudiante
            historial.save()

            # 🔥 ACTUALIZAR CRÉDITOS AUTOMÁTICAMENTE
            if historial.estado == 'aprobado':
                estudiante.creditos_acumulados += historial.curso.creditos
                estudiante.save()

            return redirect('panel_admin')
    else:
        form = RegistrarNotaForm()

    return render(request, 'registrar_nota.html', {
        'form': form,
        'estudiante': estudiante
    })