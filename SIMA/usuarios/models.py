from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROLES = (
        ('admin', 'Administrador'),
        ('estudiante', 'Estudiante'),
    )

    rol = models.CharField(max_length=20, choices=ROLES)
    codigo = models.CharField(max_length=10, unique=True, null=True, blank=True)
    ciclo_actual = models.IntegerField(null=True, blank=True)
    creditos_acumulados = models.IntegerField(default=0)

    def __str__(self):
        return self.username