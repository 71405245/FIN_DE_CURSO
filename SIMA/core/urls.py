from django.contrib import admin
from django.urls import path


from academico import views as acad_views

from usuarios import views as user_views
from matricula import views as mat_views

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Auth
    path('', user_views.login_view, name='login'),
    path('logout/', user_views.logout_view, name='logout'),

    # Dashboard
    path('dashboard/', user_views.dashboard, name='dashboard'),

    # Panel admin personalizado
    path('panel-admin/', user_views.panel_admin, name='panel_admin'),

    # Cursos
    path('cursos/', acad_views.lista_cursos, name='cursos'),

    # Matrícula
    
    path('mis-matriculas/', mat_views.mis_matriculas, name='mis_matriculas'),

    # Historial
    path('historial/', acad_views.historial_academico, name='historial'),

    path('crear-estudiante/', user_views.crear_estudiante, name='crear_estudiante'),

    path('registrar-nota/<int:estudiante_id>/', acad_views.registrar_nota, name='registrar_nota'),

    path('descargar-horario/', mat_views.descargar_horario, name='descargar_horario'),

    path('secciones/<int:curso_id>/', mat_views.ver_secciones, name='ver_secciones'),

    path('matricular/<int:seccion_id>/', mat_views.matricularse, name='matricular'),

    path('horario/', mat_views.horario_visual, name='horario_visual'),
]