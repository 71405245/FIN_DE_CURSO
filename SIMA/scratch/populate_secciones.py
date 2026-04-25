import os
import sys
import django
import random
from datetime import time

# Add the project root to the sys.path
sys.path.append(r'c:\Users\Usuario\Music\SIMA')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academico.models import Curso, Seccion, Salon

def populate():
    print("Iniciando generación de horarios de prueba...")
    
    cursos = Curso.objects.all()
    if not cursos.exists():
        print("No hay cursos creados. Por favor crea algunos cursos primero.")
        return
        
    salones = list(Salon.objects.all())
    if not salones:
        print("No hay salones creados. Por favor crea algunos salones primero.")
        return

    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    horas_bloques = [
        (time(7, 0), time(9, 0)),
        (time(9, 0), time(11, 0)),
        (time(11, 0), time(13, 0)),
        (time(14, 0), time(16, 0)),
        (time(16, 0), time(18, 0)),
        (time(18, 0), time(20, 0)),
    ]

    secciones_creadas = 0

    # Crear entre 2 y 5 secciones variadas por curso
    for curso in cursos:
        # Avoid exact duplicates
        combinaciones_usadas = set()
        
        num_secciones = random.randint(2, 5)
        for _ in range(num_secciones):
            dia = random.choice(dias)
            hora_inicio, hora_fin = random.choice(horas_bloques)
            salon = random.choice(salones)
            
            combo = (dia, hora_inicio)
            if combo in combinaciones_usadas:
                continue
            combinaciones_usadas.add(combo)
            
            Seccion.objects.create(
                curso=curso,
                dia=dia,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                salon=salon,
                cupo=random.randint(15, 40)
            )
            secciones_creadas += 1

    print(f"Generacion exitosa! Se han creado {secciones_creadas} nuevas secciones/horarios, incluyendo fines de semana.")

if __name__ == "__main__":
    populate()
