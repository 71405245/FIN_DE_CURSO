from .models import Matricula
from datetime import time, datetime, date
import itertools
from academico.models import Seccion
from academico.utils import recomendar_cursos

# MAX_CREDITOS = 24  # Usado dinámicamente desde el objeto estudiante

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
    try:
        from matricula.models import PreferenciaHorario
        pref = PreferenciaHorario.objects.get(estudiante=estudiante)
        limite_cursos = pref.cantidad_cursos
        dias_maximos_pref = pref.dias_maximos
        turno_pref = pref.turno_preferido
    except:
        limite_cursos = 5
        dias_maximos_pref = 7
        turno_pref = 'cualquiera'

    cursos_recomendados = recomendar_cursos(estudiante, limite=limite_cursos)
    
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
        if total_creditos > estudiante.limite_creditos:
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
        
        # Criterio 3: Preferencia de Turno
        penalizacion_turno = 0
        if turno_pref != 'cualquiera':
            for sec in combinacion:
                hora = sec.hora_inicio.hour
                if turno_pref == 'mañana' and hora >= 14:
                    penalizacion_turno += 10
                elif turno_pref == 'tarde' and (hora < 14 or hora >= 18):
                    penalizacion_turno += 10
                elif turno_pref == 'noche' and hora < 18:
                    penalizacion_turno += 10
        
        # Guardar combinacion solo si cumple el máximo de días
        if dias_asistencia <= dias_maximos_pref:
            combinaciones_validas.append({
                'secciones': combinacion,
                'dias_asistencia': dias_asistencia,
                'huecos': huecos_minutos,
                'penalizacion_turno': penalizacion_turno,
                'total_creditos': total_creditos
            })

    # Ordenar por penalidad de turno, menor cantidad de días de asistencia, luego por menos huecos
    combinaciones_ordenadas = sorted(combinaciones_validas, key=lambda x: (x['penalizacion_turno'], x['dias_asistencia'], x['huecos']))
    
    # Devolver el top 5
    return combinaciones_ordenadas[:5]