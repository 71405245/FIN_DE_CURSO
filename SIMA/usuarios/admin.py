from django.contrib import admin
from .models import Usuario

class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'rol', 'codigo', 'ciclo_actual', 'creditos_acumulados')
    list_filter = ('rol',)
    search_fields = ('username', 'codigo')

admin.site.register(Usuario, UsuarioAdmin)