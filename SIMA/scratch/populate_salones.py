import os
import sys
import django

# Add the project root to the sys.path
sys.path.append(r'c:\Users\Usuario\Music\SIMA')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academico.models import Salon

def populate_salones():
    print("Generando salones (A101 - J403)...")
    
    letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    pisos = [1, 2, 3, 4]
    habitaciones = [1, 2, 3] # Habitaciones por piso
    
    count = 0
    for letra in letras:
        for piso in pisos:
            for hab in habitaciones:
                numero_salon = f"{letra}{piso}0{hab}"
                # Evitar duplicados
                salon, created = Salon.objects.get_or_create(
                    numero=numero_salon,
                    defaults={'capacidad': 30 + (hab * 5)}
                )
                if created:
                    count += 1
                    
    print(f"Se han creado {count} nuevos salones exitosamente.")

if __name__ == "__main__":
    populate_salones()
