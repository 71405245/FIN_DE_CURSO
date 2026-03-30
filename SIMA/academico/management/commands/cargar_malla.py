from django.core.management.base import BaseCommand
from academico.models import Ciclo, Curso, Prerrequisito


class Command(BaseCommand):
    help = 'Carga la malla curricular completa'

    def handle(self, *args, **kwargs):

        # Crear ciclos
        ciclos = {}
        for i in range(1, 11):
            ciclo, _ = Ciclo.objects.get_or_create(numero=i)
            ciclos[i] = ciclo

        # ===============================
        # CURSOS
        # ===============================
        cursos_data = [

            # CICLO 1
            ("ASUC01113", "Matemática Superior", 5, 1),
            ("ASUC01083", "Habilidades Comunicativas", 4, 1),
            ("ASUC01082", "Gestión del Aprendizaje", 3, 1),
            ("ASUC00512", "Intro Ing Sistemas", 3, 1),
            ("ASUC01117", "Química I", 3, 1),
            ("ASUC01086", "Lab Liderazgo", 2, 1),
            ("ASUC01700", "Herramientas Virtuales", 1, 1),

            # CICLO 2
            ("ASUC01108", "Álgebra Matricial", 4, 2),
            ("ASUC01110", "Fundamentos del Cálculo", 4, 2),
            ("ASUC00562", "Matemática Discreta", 4, 2),
            ("ASUC01075", "Comunicación Efectiva", 3, 2),
            ("ASUC01079", "Ética y Ciudadanía", 3, 2),
            ("ASUC01112", "Gestión por Procesos", 3, 2),

            # CICLO 3
            ("ASUC01160", "Cálculo Diferencial", 5, 3),
            ("ASUC01296", "Física I", 4, 3),
            ("ASUC01312", "Fundamentos de Programación", 4, 3),
            ("ASUC00798", "Sistemas de Información", 4, 3),
            ("ASUC01275", "Estadística General", 3, 3),
            ("ASUC01389", "Lab Innovación", 1, 3),

            # CICLO 4
            ("ASUC01161", "Cálculo Integral", 5, 4),
            ("ASUC01297", "Física II", 4, 4),
            ("ASUC01482", "POO", 4, 4),
            ("ASUC01183", "Comunicación y Argumentación", 3, 4),
            ("ASUC01273", "Estadística Aplicada", 3, 4),
            ("ASUC00316", "Estructura de Datos", 3, 4),
            ("ASUC01255", "Ecuaciones Diferenciales", 5, 5),

            # CICLO 5
            ("ASUC01136", "Análisis Software", 4, 5),
            ("ASUC00051", "Base de Datos", 4, 5),
            ("ASUC01541", "Sistemas Digitales", 4, 5),
            ("ASUC01658", "Medio Ambiente", 3, 5),
            ("ASUC01388", "Lab Innovación Avanzado", 1, 5),

            # CICLO 6
            ("ASUC01140", "Arquitectura Computador", 4, 6),
            ("ASUC00957", "Diseño Software", 4, 6),
            ("ASUC01386", "Investigación Operativa", 4, 6),
            ("ASUC00006", "Admin Base Datos", 3, 6),
            ("ASUC01532", "Seminario Investigación", 3, 6),
            ("ASUC01061", "Sistemas Operativos", 3, 6),

            # CICLO 7
            ("ASUC01141", "Arquitectura Empresarial", 5, 7),
            ("ASUC00947", "Construcción Software", 5, 7),
            ("ASUC00754", "Redes", 4, 7),
            ("ASUC00466", "Ing Económica", 3, 7),
            ("ASUC01365", "Innovación Social", 2, 7),
            ("ASUC01341", "Gestión Profesional", 1, 7),

            # CICLO 8
            ("ASUC00123", "Conmutación", 4, 8),
            ("ASUC01235", "Dirección Proyectos", 4, 8),
            ("ASUC01006", "Calidad Software", 4, 8),
            ("ASUC01534", "Simulación", 4, 8),
            ("ASUC01203", "Conversation Class", 3, 8),
            ("ASUC01545", "Prácticas", 1, 8),

            # CICLO 9
            ("ASUC01228", "Apps Móviles", 4, 9),
            ("ASUC00469", "Ingeniería Web", 4, 9),
            ("ASUC01580", "Taller Investigación 1", 4, 9),
            ("ASUC01584", "Taller Proyectos 1", 4, 9),
            ("ASUC00413", "Servicios TI", 3, 9),
            ("ASUC00769", "Seguridad Info", 3, 9),

            # CICLO 10
            ("ASUC00941", "Auditoría Sistemas", 4, 10),
            ("ASUC01581", "Taller Investigación 2", 4, 10),
            ("ASUC01585", "Taller Proyectos 2", 4, 10),
            ("ASUC00097", "Cloud Computing", 3, 10),
            ("ASUC00490", "Inteligencia Negocios", 3, 10),
            ("ASUC00210", "Videojuegos", 3, 10),
        ]

        cursos = {}

        for codigo, nombre, creditos, ciclo_num in cursos_data:
            curso, _ = Curso.objects.get_or_create(
                codigo=codigo,
                defaults={
                    'nombre': nombre,
                    'creditos': creditos,
                    'ciclo': ciclos[ciclo_num],
                    'tipo': 'obligatorio'
                }
            )
            cursos[codigo] = curso

        # ===============================
        # PRERREQUISITOS (BASE)
        # ===============================

        Prerrequisito.objects.get_or_create(
            curso=cursos["ASUC01108"],
            curso_requisito=cursos["ASUC01113"]
        )

        Prerrequisito.objects.get_or_create(
            curso=cursos["ASUC01110"],
            curso_requisito=cursos["ASUC01113"]
        )

        Prerrequisito.objects.get_or_create(
            curso=cursos["ASUC00562"],
            creditos_minimos=20
        )

        self.stdout.write(self.style.SUCCESS('✅ Malla completa cargada correctamente'))