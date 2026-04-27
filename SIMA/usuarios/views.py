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


import datetime
import calendar
from matricula.models import Matricula
from academico.models import Seccion

# 🏠 DASHBOARD
@login_required
def dashboard(request):
    user = request.user
    recomendaciones = []
    matriz = []
    calendario_semanas = []
    hoy_clases = []
    clase_actual = None
    proxima_clase = None
    
    # Datos básicos para el calendario
    now = datetime.datetime.now()
    hoy_num = now.day
    mes_num = now.month
    anio = now.year
    mes_nombre = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mes_num-1]

    if user.rol == 'estudiante':
        recomendaciones = recomendar_cursos(user)
        
        # 1. Obtener Matrículas
        matriculas = Matricula.objects.filter(estudiante=user).select_related('seccion__curso', 'seccion__salon')
        
        # 2. Lógica de Clases por Día (para el calendario)
        # Mapeo de días de la semana (0=Lunes, 6=Domingo)
        dias_semana_map = {
            "Lunes": 0, "Martes": 1, "Miércoles": 2, "Jueves": 3, 
            "Viernes": 4, "Sábado": 5, "Domingo": 6
        }
        
        clases_por_dia_semana = {}
        for m in matriculas:
            d_name = m.seccion.dia
            d_idx = dias_semana_map.get(d_name)
            if d_idx is not None:
                clases_por_dia_semana[d_idx] = clases_por_dia_semana.get(d_idx, 0) + 1

        # 3. Construir Calendario del Mes
        cal = calendar.Calendar(firstweekday=6) # Empieza en Domingo
        month_days = cal.monthdayscalendar(anio, mes_num)
        
        for week in month_days:
            semana_data = []
            for d in week:
                if d == 0:
                    semana_data.append(None)
                else:
                    # Determinar día de la semana para este número de día
                    dt = datetime.date(anio, mes_num, d)
                    weekday_idx = dt.weekday() # 0=Lunes, 6=Domingo
                    
                    count = clases_por_dia_semana.get(weekday_idx, 0)
                    
                    semana_data.append({
                        "numero": d,
                        "es_hoy": (d == hoy_num),
                        "clases_count": count
                    })
            calendario_semanas.append(semana_data)

        # 4. Clases de Hoy y Horario Visual
        dias_nombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        horas_slots = ["07:00 - 09:00", "09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"]
        dia_hoy_nombre = dias_nombres[now.weekday()]
        
        colores = ["#D1E9F5", "#FDE2E2", "#E2FDF2", "#FFF4E2", "#F2E2FD", "#FDFAE2", "#E2F2FD"]

        for h_slot in horas_slots:
            fila = {"hora": h_slot, "dias": []}
            h_start_str = h_slot.split(" - ")[0]
            h_start_time = datetime.datetime.strptime(h_start_str, "%H:%M").time()

            for d_name in dias_nombres:
                contenido = None
                for m in matriculas:
                    sec = m.seccion
                    rango = f"{sec.hora_inicio.strftime('%H:%M')} - {sec.hora_fin.strftime('%H:%M')}"
                    if sec.dia == d_name and rango == h_slot:
                        contenido = {
                            "curso": sec.curso.nombre,
                            "salon": sec.salon.numero if sec.salon else "Sin asignar",
                            "color": colores[sec.curso.id % len(colores)],
                            "rango": rango
                        }
                        # Si es hoy, agregar a hoy_clases
                        if d_name == dia_hoy_nombre:
                            hoy_clases.append(contenido)
                            
                            # Determinar clase actual o próxima
                            current_time = now.time()
                            if sec.hora_inicio <= current_time <= sec.hora_fin:
                                clase_actual = contenido
                            elif sec.hora_inicio > current_time:
                                if not proxima_clase or sec.hora_inicio < datetime.datetime.strptime(proxima_clase['rango'].split(" - ")[0], "%H:%M").time():
                                    proxima_clase = contenido

                fila["dias"].append(contenido)
            matriz.append(fila)

    return render(request, 'dashboard.html', {
        'recomendaciones': recomendaciones,
        'matriz': matriz,
        'dias': ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
        'calendario_semanas': calendario_semanas,
        'mes_nombre': mes_nombre,
        'anio': anio,
        'hoy_clases': hoy_clases,
        'clase_actual': clase_actual,
        'proxima_clase': proxima_clase
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
