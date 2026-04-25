from .models import Matricula
from datetime import time, datetime, date
import itertools
from academico.models import Seccion
from academico.utils import recomendar_cursos

MAX_CREDITOS = 22

def calcular_creditos_actuales(estudiante):
    matriculas = Matricula.objects.filter(estudiante=estudiante)

    total = 0
    for m in matriculas:
        total += m.seccion.curso.creditos

    return total


def hay_cruce(seccion, secciones_actuales):

    for s in secciones_actuales:

        if s.dia == seccion.dia:

            if (seccion.hora_inicio < s.hora_fin and seccion.hora_fin > s.hora_inicio):
                return True

    return False

def generar_horarios_validos(estudiante):
    cursos_recomendados = recomendar_cursos(estudiante)
    
    if not cursos_recomendados:
        return []
        
    secciones_por_curso = []
    for curso in cursos_recomendados:
        secciones = list(Seccion.objects.filter(curso=curso))
        if secciones:
            secciones_por_curso.append(secciones)
            
    if not secciones_por_curso:
        return []

    combinaciones_validas = []
    
    # Generar el producto cartesiano para tomar exactamente una sección de cada curso recomendado
    for combinacion in itertools.product(*secciones_por_curso):
        # 1. Validar límite de créditos
        total_creditos = sum(sec.curso.creditos for sec in combinacion)
        if total_creditos > MAX_CREDITOS:
            continue
            
        # 2. Validar cruces de horarios
        tiene_cruce = False
        secciones_actuales = []
        for sec in combinacion:
            if hay_cruce(sec, secciones_actuales):
                tiene_cruce = True
                break
            secciones_actuales.append(sec)
            
        if tiene_cruce:
            continue
            
        # 3. Puntuar el horario
        # Criterio 1: Menos días de asistencia a clases es mejor (compacto)
        dias_asistencia = len(set(sec.dia for sec in combinacion))
        
        # Criterio 2: Calcular huecos (minutos libres entre clases el mismo dia)
        huecos_minutos = 0
        secciones_por_dia = {}
        for sec in combinacion:
            secciones_por_dia.setdefault(sec.dia, []).append(sec)
            
        for dia, seccs in secciones_por_dia.items():
            if len(seccs) > 1:
                # Ordenar por hora_inicio
                seccs_ordenadas = sorted(seccs, key=lambda x: x.hora_inicio)
                for i in range(len(seccs_ordenadas) - 1):
                    # Diferencia entre fin del actual y inicio del siguiente
                    fin_actual = seccs_ordenadas[i].hora_fin
                    inicio_siguiente = seccs_ordenadas[i+1].hora_inicio
                    
                    # Convertir a datetime para restar de forma segura
                    dt_fin = datetime.combine(date.today(), fin_actual)
                    dt_inicio = datetime.combine(date.today(), inicio_siguiente)
                    
                    if dt_inicio > dt_fin:
                        diff = dt_inicio - dt_fin
                        huecos_minutos += diff.total_seconds() / 60
        
        # Guardar combinacion
        combinaciones_validas.append({
            'secciones': combinacion,
            'dias_asistencia': dias_asistencia,
            'huecos': huecos_minutos,
            'total_creditos': total_creditos
        })

    # Ordenar por menor cantidad de días de asistencia, luego por menos huecos
    combinaciones_ordenadas = sorted(combinaciones_validas, key=lambda x: (x['dias_asistencia'], x['huecos']))
    
    # Devolver el top 5
    return combinaciones_ordenadas[:5]