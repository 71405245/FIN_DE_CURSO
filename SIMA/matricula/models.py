from django.db import models
from usuarios.models import Usuario
from academico.models import Seccion

class Matricula(models.Model):
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.estudiante.username} - {self.seccion}"

class PreferenciaHorario(models.Model):
    TURNOS = (
        ('cualquiera', 'Cualquier Turno'),
        ('mañana', 'Mañana (07:00 - 13:00)'),
        ('tarde', 'Tarde (14:00 - 18:00)'),
        ('noche', 'Noche (18:00 - 22:00)'),
    )

    estudiante = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='preferencia_horario')
    turno_preferido = models.CharField(max_length=20, choices=TURNOS, default='cualquiera')
    dias_maximos = models.IntegerField(default=5, help_text="Cantidad máxima de días que deseas asistir a la universidad.")
    cantidad_cursos = models.IntegerField(default=5, help_text="Cantidad de cursos que deseas llevar este ciclo.")

    def __str__(self):
        return f"Preferencias de {self.estudiante.username}"