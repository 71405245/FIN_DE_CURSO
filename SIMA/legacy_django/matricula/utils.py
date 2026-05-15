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
        pref_limite_cursos = pref.cantidad_cursos
        pref_dias_maximos = pref.dias_maximos
        pref_turno = pref.turno_preferido
        es_estricto = True
    except:
        pref_limite_cursos = 5
        pref_dias_maximos = 7
        pref_turno = 'cualquiera'
        es_estricto = False

    from academico.utils import obtener_limite_creditos_personalizado, obtener_costo_real_curso
    limite_actual_estudiante = obtener_limite_creditos_personalizado(estudiante)

    # 1. Función interna de DFS con Poda
    def buscar_combinaciones(limite_cursos, dias_maximos, turno_pref):
        cursos_recomendados = recomendar_cursos(estudiante, limite=limite_cursos)
        if not cursos_recomendados: return []
            
        secciones_por_curso = []
        for curso in cursos_recomendados:
            secciones = list(Seccion.objects.filter(curso=curso))
            if secciones: secciones_por_curso.append(secciones)
                
        if not secciones_por_curso: return []

        combinaciones_validas = []

        def dfs(curso_idx, comb_actual, creditos_acum, secc_actuales):
            if curso_idx == len(secciones_por_curso):
                dias_asistencia = len(set(s.dia for s in comb_actual))
                if dias_asistencia <= dias_maximos:
                    # Calcular métricas
                    huecos = 0
                    secciones_por_dia = {}
                    for sec in comb_actual:
                        secciones_por_dia.setdefault(sec.dia, []).append(sec)
                        
                    for dia, seccs in secciones_por_dia.items():
                        if len(seccs) > 1:
                            seccs.sort(key=lambda x: x.hora_inicio)
                            for i in range(len(seccs) - 1):
                                f = seccs[i].hora_fin
                                inic = seccs[i+1].hora_inicio
                                dt_f = datetime.combine(date.today(), f)
                                dt_i = datetime.combine(date.today(), inic)
                                if dt_i > dt_f:
                                    huecos += (dt_i - dt_f).total_seconds() / 60
                                    
                    penal_turno = 0
                    if turno_pref != 'cualquiera':
                        for sec in comb_actual:
                            h = sec.hora_inicio.hour
                            if turno_pref == 'mañana' and h >= 14: penal_turno += 10
                            elif turno_pref == 'tarde' and (h < 14 or h >= 18): penal_turno += 10
                            elif turno_pref == 'noche' and h < 18: penal_turno += 10
                            
                    combinaciones_validas.append({
                        'secciones': comb_actual,
                        'dias_asistencia': dias_asistencia,
                        'huecos': huecos,
                        'penalizacion_turno': penal_turno,
                        'total_creditos': creditos_acum
                    })
                return

            for sec in secciones_por_curso[curso_idx]:
                costo = obtener_costo_real_curso(estudiante, sec.curso)
                if creditos_acum + costo > limite_actual_estudiante: continue
                if hay_cruce(sec, secc_actuales): continue
                
                dfs(curso_idx + 1, comb_actual + [sec], creditos_acum + costo, secc_actuales + [sec])

        dfs(0, [], 0, [])
        return sorted(combinaciones_validas, key=lambda x: (x['penalizacion_turno'], x['dias_asistencia'], x['huecos']))[:5]

    # 2. Lógica de Flexibilización
    mensaje_flex = None
    horarios = buscar_combinaciones(pref_limite_cursos, pref_dias_maximos, pref_turno)
    
    if not horarios and es_estricto:
        # Intento 1: Relajar días máximos
        horarios = buscar_combinaciones(pref_limite_cursos, 7, pref_turno)
        if horarios:
            mensaje_flex = "No encontramos horarios para tus días preferidos, pero relajamos la cantidad de días de asistencia para sugerirte estas opciones."
        else:
            # Intento 2: Relajar turno y días
            horarios = buscar_combinaciones(pref_limite_cursos, 7, 'cualquiera')
            if horarios:
                mensaje_flex = "Tus preferencias de turno y días eran muy restrictivas. Aquí tienes las mejores combinaciones disponibles en otros horarios."
            else:
                # Intento 3: Reducir cantidad de cursos
                if pref_limite_cursos > 1:
                    horarios = buscar_combinaciones(pref_limite_cursos - 1, 7, 'cualquiera')
                    if horarios:
                        mensaje_flex = "No fue posible matricularte en todos los cursos solicitados sin cruces. Hemos reducido la carga de cursos para sugerirte opciones válidas."

    return {
        "horarios": horarios,
        "mensaje": mensaje_flex
    }