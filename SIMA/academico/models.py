from django.db import models

class Ciclo(models.Model):
    numero = models.IntegerField()

    def __str__(self):
        return f"Ciclo {self.numero}"


class Curso(models.Model):
    TIPO = (
        ('obligatorio', 'Obligatorio'),
        ('electivo', 'Electivo'),
    )

    codigo = models.CharField(max_length=20)
    nombre = models.CharField(max_length=200)
    creditos = models.IntegerField()
    ciclo = models.ForeignKey(Ciclo, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
class Prerrequisito(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='curso_objetivo')
    curso_requisito = models.ForeignKey(Curso, on_delete=models.CASCADE, null=True, blank=True)
    creditos_minimos = models.IntegerField(null=True, blank=True)

    def __str__(self):
        if self.curso_requisito:
            return f"{self.curso} requiere {self.curso_requisito}"
        return f"{self.curso} requiere {self.creditos_minimos} créditos"

from usuarios.models import Usuario

class HistorialAcademico(models.Model):
    ESTADOS = (
        ('aprobado', 'Aprobado'),
        ('desaprobado', 'Desaprobado'),
        ('en_curso', 'En curso'),
    )

    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    nota = models.IntegerField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADOS)
    ciclo = models.IntegerField()

    def __str__(self):
        return f"{self.estudiante} - {self.curso} - {self.estado}"

class Seccion(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    dia = models.CharField(max_length=20)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    aula = models.CharField(max_length=50)
    cupo = models.IntegerField()