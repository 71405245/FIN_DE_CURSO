from .models import Matricula
from datetime import time

def calcular_creditos_actuales(estudiante):
    matriculas = Matricula.objects.filter(estudiante=estudiante)

    total = 0
    for m in matriculas:
        total += m.curso.creditos

    return total


def hay_cruce(seccion, secciones_actuales):

    for s in secciones_actuales:

        if s.dia == seccion.dia:

            if (seccion.hora_inicio < s.hora_fin and seccion.hora_fin > s.hora_inicio):
                return True

    return False