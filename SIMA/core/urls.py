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
    path('historial-estudiante/<int:estudiante_id>/', acad_views.historial_estudiante_admin, name='historial_estudiante_admin'),

    path('crear-estudiante/', user_views.crear_estudiante, name='crear_estudiante'),

    path('registrar-nota/<int:estudiante_id>/', acad_views.registrar_nota, name='registrar_nota'),

    # Admin: Gestión de Cursos
    path('admin-cursos/', acad_views.gestionar_cursos_admin, name='gestionar_cursos_admin'),
    path('admin-cursos/crear/', acad_views.crear_curso_admin, name='crear_curso_admin'),
    path('admin-cursos/editar/<int:curso_id>/', acad_views.editar_curso_admin, name='editar_curso_admin'),
    path('admin-cursos/eliminar/<int:curso_id>/', acad_views.eliminar_curso_admin, name='eliminar_curso_admin'),

    # Admin: Gestión de Secciones (Horarios)
    path('admin-cursos/<int:curso_id>/secciones/', acad_views.gestionar_secciones_admin, name='gestionar_secciones_admin'),
    path('admin-cursos/<int:curso_id>/secciones/crear/', acad_views.crear_seccion_admin, name='crear_seccion_admin'),
    path('admin-secciones/editar/<int:seccion_id>/', acad_views.editar_seccion_admin, name='editar_seccion_admin'),
    path('admin-secciones/eliminar/<int:seccion_id>/', acad_views.eliminar_seccion_admin, name='eliminar_seccion_admin'),

    # Admin: Gestión de Salones
    path('admin-salones/', acad_views.gestionar_salones_admin, name='gestionar_salones_admin'),
    path('admin-salones/crear/', acad_views.crear_salon_admin, name='crear_salon_admin'),
    path('admin-salones/editar/<int:salon_id>/', acad_views.editar_salon_admin, name='editar_salon_admin'),
    path('admin-salones/eliminar/<int:salon_id>/', acad_views.eliminar_salon_admin, name='eliminar_salon_admin'),

    # Admin: Gestión Global de Horarios (Secciones)
    path('admin-horarios/', acad_views.gestionar_horarios_admin, name='gestionar_horarios_admin'),
    path('admin-horarios/crear/', acad_views.crear_horario_admin, name='crear_horario_admin'),
    path('admin-horarios/editar/<int:seccion_id>/', acad_views.editar_horario_admin, name='editar_horario_admin'),
    path('admin-horarios/eliminar/<int:seccion_id>/', acad_views.eliminar_horario_admin, name='eliminar_horario_admin'),

    path('descargar-horario/', mat_views.descargar_horario, name='descargar_horario'),

    path('secciones/<int:curso_id>/', mat_views.ver_secciones, name='ver_secciones'),

    path('matricular/<int:seccion_id>/', mat_views.matricularse, name='matricular'),
    path('rectificar-matricula/<int:matricula_id>/', mat_views.rectificar_matricula, name='rectificar_matricula'),

    path('horario/', mat_views.horario_visual, name='horario_visual'),
    
    # IA Horarios
    path('horarios-recomendados/', mat_views.horarios_recomendados, name='horarios_recomendados'),
    path('matricular-horario/', mat_views.matricular_horario_completo, name='matricular_horario_completo'),
]