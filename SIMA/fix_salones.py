import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academico.models import Seccion, Salon

def fix():
    secciones_sin_salon = Seccion.objects.filter(salon__isnull=True)
    if not secciones_sin_salon.exists():
        print("No hay secciones sin salón.")
        return

    salones = list(Salon.objects.all())
    if not salones:
        print("Error: No hay salones disponibles en la base de datos para asignar.")
        return

    print(f"Encontradas {secciones_sin_salon.count()} secciones sin salón.")
    
    for sec in secciones_sin_salon:
        nuevo_salon = random.choice(salones)
        sec.salon = nuevo_salon
        sec.save()
        print(f"Sección {sec.id} ({sec.curso.nombre}) asignada al salón {nuevo_salon.numero}")

    print("¡Reparación completada!")

if __name__ == "__main__":
    fix()
