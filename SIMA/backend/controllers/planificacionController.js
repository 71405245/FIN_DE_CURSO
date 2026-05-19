const Seccion = require('../models/Seccion');
const User = require('../models/User');

// Verifica si dos bloques horarios se solapan
function hayConflicto(s1, s2) {
  if (!s1.dias || !s2.dias || !s1.horaInicio || !s2.horaInicio) return false;
  const diasComunes = s1.dias.filter(d => s2.dias.includes(d));
  if (diasComunes.length === 0) return false;
  return s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin;
}

exports.getStats = async (req, res) => {
  try {
    const secciones = await Seccion.find()
      .populate('curso', 'nombre codigo')
      .populate('docente', 'nombre apellidos')
      .lean();

    const totalSecciones = secciones.length;
    let totalMatriculados = 0;
    let totalCupos = 0;
    let salonesLlenos = 0;

    // Carga por día
    const cargaPorDia = { Lunes: 0, Martes: 0, Miércoles: 0, Jueves: 0, Viernes: 0, Sábado: 0, Domingo: 0 };

    // Carga por turno
    const turnos = { Mañana: 0, Tarde: 0, Noche: 0 };

    // Carga por docente { docenteId: { nombre, secciones } }
    const cargaDocente = {};

    // Distribución de ocupación
    const distOcupacion = { '0-24%': 0, '25-49%': 0, '50-74%': 0, '75-99%': 0, '100%': 0 };

    // Docentes únicos con sección
    const docentesConSeccion = new Set();

    for (const s of secciones) {
      const mat = s.estudiantesMatriculados?.length || 0;
      const cupo = s.cupoMaximo || 30;
      totalMatriculados += mat;
      totalCupos += cupo;
      if (mat >= cupo) salonesLlenos++;

      // Pct ocupación por salón
      const pct = cupo > 0 ? (mat / cupo) * 100 : 0;
      if (pct < 25) distOcupacion['0-24%']++;
      else if (pct < 50) distOcupacion['25-49%']++;
      else if (pct < 75) distOcupacion['50-74%']++;
      else if (pct < 100) distOcupacion['75-99%']++;
      else distOcupacion['100%']++;

      // Días
      if (s.dias) {
        s.dias.forEach(d => {
          if (cargaPorDia[d] !== undefined) cargaPorDia[d]++;
        });
      }

      // Turno
      if (s.horaInicio) {
        const h = parseInt(s.horaInicio.split(':')[0]);
        if (h < 13) turnos['Mañana']++;
        else if (h < 18) turnos['Tarde']++;
        else turnos['Noche']++;
      }

      // Docente
      if (s.docente) {
        const did = String(s.docente._id);
        docentesConSeccion.add(did);
        if (!cargaDocente[did]) {
          cargaDocente[did] = { nombre: `${s.docente.nombre} ${s.docente.apellidos}`, secciones: 0 };
        }
        cargaDocente[did].secciones++;
      }
    }

    // Top 10 docentes por carga
    const topDocentes = Object.values(cargaDocente)
      .sort((a, b) => b.secciones - a.secciones)
      .slice(0, 10);

    // Detección de conflictos
    const conflictosDocente = [];
    const conflictosAula = [];

    for (let i = 0; i < secciones.length; i++) {
      for (let j = i + 1; j < secciones.length; j++) {
        const a = secciones[i];
        const b = secciones[j];
        if (!hayConflicto(a, b)) continue;

        // Conflicto de docente
        if (a.docente && b.docente && String(a.docente._id) === String(b.docente._id)) {
          conflictosDocente.push({
            docente: `${a.docente.nombre} ${a.docente.apellidos}`,
            seccion1: { codigo: a.codigoSeccion, curso: a.curso?.nombre, horario: a.horario },
            seccion2: { codigo: b.codigoSeccion, curso: b.curso?.nombre, horario: b.horario },
          });
        }

        // Conflicto de aula
        if (a.aula && b.aula && a.aula.trim().toLowerCase() === b.aula.trim().toLowerCase()) {
          conflictosAula.push({
            aula: a.aula,
            seccion1: { codigo: a.codigoSeccion, curso: a.curso?.nombre, horario: a.horario },
            seccion2: { codigo: b.codigoSeccion, curso: b.curso?.nombre, horario: b.horario },
          });
        }
      }
    }

    // Salones casi llenos (≥80%)
    const casiLlenos = secciones
      .filter(s => {
        const pct = s.cupoMaximo > 0 ? (s.estudiantesMatriculados?.length || 0) / s.cupoMaximo : 0;
        return pct >= 0.8 && pct < 1;
      })
      .map(s => ({
        codigo: s.codigoSeccion,
        curso: s.curso?.nombre,
        matriculados: s.estudiantesMatriculados?.length || 0,
        cupo: s.cupoMaximo,
        pct: Math.round(((s.estudiantesMatriculados?.length || 0) / s.cupoMaximo) * 100)
      }))
      .sort((a, b) => b.pct - a.pct);

    // Docentes sobrecargados (>5 secciones)
    const docentesSobrecargados = Object.values(cargaDocente)
      .filter(d => d.secciones > 5)
      .sort((a, b) => b.secciones - a.secciones);

    res.json({
      kpis: {
        totalSecciones,
        porcentajeOcupacion: totalCupos > 0 ? Math.round((totalMatriculados / totalCupos) * 100) : 0,
        salonesLlenos,
        cuposDisponibles: totalCupos - totalMatriculados,
        docentesConSeccion: docentesConSeccion.size,
      },
      graficos: {
        cargaPorDia,
        turnos,
        topDocentes,
        distOcupacion,
      },
      alertas: {
        conflictosDocente: conflictosDocente.slice(0, 20),
        conflictosAula: conflictosAula.slice(0, 20),
        casiLlenos: casiLlenos.slice(0, 20),
        docentesSobrecargados,
      },
      // Secciones completas para el calendario
      secciones: secciones.map(s => ({
        _id: s._id,
        codigoSeccion: s.codigoSeccion,
        curso: s.curso,
        docente: s.docente,
        dias: s.dias,
        horaInicio: s.horaInicio,
        horaFin: s.horaFin,
        aula: s.aula,
        horario: s.horario,
        matriculados: s.estudiantesMatriculados?.length || 0,
        cupoMaximo: s.cupoMaximo,
      })),
    });
  } catch (err) {
    console.error('Error en planificacion/stats:', err);
    res.status(500).json({ msg: 'Error al obtener estadísticas de planificación' });
  }
};
