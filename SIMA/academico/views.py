from django.shortcuts import render, redirect, get_object_or_404
from usuarios.models import Usuario
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Curso, Seccion, HistorialAcademico, Salon
from .utils import puede_llevar_curso
from .forms import RegistrarNotaForm, CursoForm, SeccionForm, SalonForm

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

@login_required
def historial_estudiante_admin(request, estudiante_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    estudiante = get_object_or_404(Usuario, id=estudiante_id)
    historial = HistorialAcademico.objects.filter(estudiante=estudiante).order_by('ciclo')
    
    return render(request, 'historial_estudiante_admin.html', {
        'estudiante': estudiante,
        'historial': historial
    })

# ==================== GESTIÓN DE CURSOS (ADMIN) ====================

@login_required
def gestionar_cursos_admin(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    cursos = Curso.objects.all().order_by('ciclo__numero', 'codigo')
    return render(request, 'gestionar_cursos_admin.html', {'cursos': cursos})

@login_required
def crear_curso_admin(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = CursoForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Curso creado exitosamente.")
            return redirect('gestionar_cursos_admin')
    else:
        form = CursoForm()
        
    return render(request, 'formulario_curso.html', {'form': form, 'accion': 'Crear Curso'})

@login_required
def editar_curso_admin(request, curso_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    curso = get_object_or_404(Curso, id=curso_id)
    if request.method == 'POST':
        form = CursoForm(request.POST, instance=curso)
        if form.is_valid():
            form.save()
            messages.success(request, "Curso actualizado exitosamente.")
            return redirect('gestionar_cursos_admin')
    else:
        form = CursoForm(instance=curso)
        
    return render(request, 'formulario_curso.html', {'form': form, 'accion': 'Editar Curso'})

@login_required
def eliminar_curso_admin(request, curso_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    curso = get_object_or_404(Curso, id=curso_id)
    if request.method == 'POST':
        curso.delete()
        messages.success(request, "Curso eliminado exitosamente.")
        return redirect('gestionar_cursos_admin')
    return render(request, 'confirmar_eliminar.html', {'objeto': curso, 'cancel_url': 'gestionar_cursos_admin'})

# ==================== GESTIÓN DE SECCIONES (ADMIN) ====================

@login_required
def gestionar_secciones_admin(request, curso_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    curso = get_object_or_404(Curso, id=curso_id)
    secciones = Seccion.objects.filter(curso=curso).order_by('dia', 'hora_inicio')
    
    return render(request, 'gestionar_secciones_admin.html', {'curso': curso, 'secciones': secciones})

@login_required
def crear_seccion_admin(request, curso_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    curso = get_object_or_404(Curso, id=curso_id)
    if request.method == 'POST':
        form = SeccionForm(request.POST)
        if form.is_valid():
            seccion = form.save(commit=False)
            seccion.curso = curso
            seccion.save()
            messages.success(request, "Sección creada exitosamente.")
            return redirect('gestionar_secciones_admin', curso_id=curso.id)
    else:
        form = SeccionForm(initial={'curso': curso})
        # Disable the course field since we are adding it to a specific course
        form.fields['curso'].widget.attrs['disabled'] = True
        
    return render(request, 'formulario_seccion.html', {'form': form, 'curso': curso, 'accion': 'Crear Sección'})

@login_required
def editar_seccion_admin(request, seccion_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    seccion = get_object_or_404(Seccion, id=seccion_id)
    curso = seccion.curso
    if request.method == 'POST':
        form = SeccionForm(request.POST, instance=seccion)
        if form.is_valid():
            form.save()
            messages.success(request, "Sección actualizada exitosamente.")
            return redirect('gestionar_secciones_admin', curso_id=curso.id)
    else:
        form = SeccionForm(instance=seccion)
        form.fields['curso'].widget.attrs['disabled'] = True
        
    return render(request, 'formulario_seccion.html', {'form': form, 'curso': curso, 'accion': 'Editar Sección'})

@login_required
def eliminar_seccion_admin(request, seccion_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
        
    seccion = get_object_or_404(Seccion, id=seccion_id)
    curso_id = seccion.curso.id
    if request.method == 'POST':
        seccion.delete()
        messages.success(request, "Sección eliminada exitosamente.")
        return redirect('gestionar_secciones_admin', curso_id=curso_id)
    return render(request, 'confirmar_eliminar.html', {'objeto': seccion, 'cancel_url': 'gestionar_secciones_admin', 'cancel_args': curso_id})

# ==================== GESTIÓN DE SALONES (ADMIN) ====================

@login_required
def gestionar_salones_admin(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    salones = Salon.objects.all().order_by('numero')
    return render(request, 'gestionar_salones_admin.html', {'salones': salones})

@login_required
def crear_salon_admin(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    if request.method == 'POST':
        form = SalonForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Salón creado exitosamente.")
            return redirect('gestionar_salones_admin')
    else:
        form = SalonForm()
    return render(request, 'formulario_salon.html', {'form': form, 'accion': 'Crear Salón'})

@login_required
def editar_salon_admin(request, salon_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    salon = get_object_or_404(Salon, id=salon_id)
    if request.method == 'POST':
        form = SalonForm(request.POST, instance=salon)
        if form.is_valid():
            form.save()
            messages.success(request, "Salón actualizado exitosamente.")
            return redirect('gestionar_salones_admin')
    else:
        form = SalonForm(instance=salon)
    return render(request, 'formulario_salon.html', {'form': form, 'accion': 'Editar Salón'})

@login_required
def eliminar_salon_admin(request, salon_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    salon = get_object_or_404(Salon, id=salon_id)
    if request.method == 'POST':
        salon.delete()
        messages.success(request, "Salón eliminado exitosamente.")
        return redirect('gestionar_salones_admin')
    return render(request, 'confirmar_eliminar.html', {'objeto': salon, 'cancel_url': 'gestionar_salones_admin'})

# ==================== GESTIÓN GLOBAL DE HORARIOS (ADMIN) ====================

@login_required
def gestionar_horarios_admin(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    secciones = Seccion.objects.all().select_related('curso', 'salon').order_by('curso__codigo', 'dia', 'hora_inicio')
    return render(request, 'gestionar_horarios_admin.html', {'secciones': secciones})

@login_required
def crear_horario_admin(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    if request.method == 'POST':
        form = SeccionForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Horario (Sección) creado exitosamente.")
            return redirect('gestionar_horarios_admin')
    else:
        form = SeccionForm()
    return render(request, 'formulario_seccion.html', {'form': form, 'accion': 'Crear Horario', 'global': True})

@login_required
def editar_horario_admin(request, seccion_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    seccion = get_object_or_404(Seccion, id=seccion_id)
    if request.method == 'POST':
        form = SeccionForm(request.POST, instance=seccion)
        if form.is_valid():
            form.save()
            messages.success(request, "Horario actualizado exitosamente.")
            return redirect('gestionar_horarios_admin')
    else:
        form = SeccionForm(instance=seccion)
    return render(request, 'formulario_seccion.html', {'form': form, 'accion': 'Editar Horario', 'global': True})

@login_required
def eliminar_horario_admin(request, seccion_id):
    if request.user.rol != 'admin':
        return redirect('dashboard')
    seccion = get_object_or_404(Seccion, id=seccion_id)
    if request.method == 'POST':
        seccion.delete()
        messages.success(request, "Horario eliminado exitosamente.")
        return redirect('gestionar_horarios_admin')
    return render(request, 'confirmar_eliminar.html', {'objeto': seccion, 'cancel_url': 'gestionar_horarios_admin'})