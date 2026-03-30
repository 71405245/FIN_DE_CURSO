from django.db import models
from usuarios.models import Usuario
from academico.models import Seccion

class Matricula(models.Model):
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.estudiante.username} - {self.seccion}"