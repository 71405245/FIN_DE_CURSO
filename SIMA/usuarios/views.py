from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Usuario
from .forms import CrearEstudianteForm
from academico.utils import recomendar_cursos

# 🔐 LOGIN
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)

            # 🔥 REDIRECCIÓN INTELIGENTE
            if user.rol == 'admin':
                return redirect('panel_admin')
            else:
                return redirect('dashboard')

        else:
            messages.error(request, "Usuario o contraseña incorrectos")

    return render(request, 'login.html')

# 🚪 LOGOUT
def logout_view(request):
    logout(request)
    return redirect('login')


# 🏠 DASHBOARD
@login_required
def dashboard(request):

    recomendaciones = []

    if request.user.rol == 'estudiante':
        recomendaciones = recomendar_cursos(request.user)

    return render(request, 'dashboard.html', {
        'recomendaciones': recomendaciones
    })

def crear_estudiante(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')

    if request.method == 'POST':
        form = CrearEstudianteForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Estudiante creado correctamente")
            return redirect('panel_admin')
    else:
        form = CrearEstudianteForm()

    return render(request, 'crear_estudiante.html', {
        'form': form
    })

# 🛠️ PANEL ADMIN PERSONALIZADO
@login_required
def panel_admin(request):
    if request.user.rol != 'admin':
        return redirect('dashboard')

    usuarios = Usuario.objects.filter(rol='estudiante')

    return render(request, 'panel_admin.html', {
        'usuarios': usuarios
    })
