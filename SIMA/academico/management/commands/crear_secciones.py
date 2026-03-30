from django.core.management.base import BaseCommand
from academico.models import Curso, Seccion
from datetime import time


class Command(BaseCommand):
    help = 'Crear secciones para ciclo 1'

    def handle(self, *args, **kwargs):

        # 🔥 Limpiar secciones existentes
        Seccion.objects.all().delete()

        cursos = Curso.objects.filter(ciclo__numero=1)

        self.stdout.write(f"Cursos encontrados: {cursos.count()}")

        for curso in cursos:
            self.stdout.write(f"Creando secciones para: {curso.nombre}")

            Seccion.objects.create(
                curso=curso,
                dia="Lunes",
                hora_inicio=time(7, 0),
                hora_fin=time(9, 0),
                aula="A101",
                cupo=30
            )

            Seccion.objects.create(
                curso=curso,
                dia="Miércoles",
                hora_inicio=time(9, 0),
                hora_fin=time(11, 0),
                aula="A102",
                cupo=30
            )

        self.stdout.write(self.style.SUCCESS('✅ Secciones creadas correctamente'))