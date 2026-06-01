const Seccion = require('../models/Seccion');
const User = require('../models/User');

const MAX_HORAS = 48;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Convierte "HH:MM" a número decimal de horas */
function horaADecimal(str) {
  if (!str) return 0;
  const [h, m] = str.split(':').map(Number);
  return h + (m || 0) / 60;
}

/**
 * Calcula las horas semanales que aporta una sección.
 * Fórmula: (horaFin - horaInicio) × cantidad_de_días_en_semana
 */
function calcularHorasSeccion(horaInicio, horaFin, dias) {
  const duracion = horaADecimal(horaFin) - horaADecimal(horaInicio);
  const numDias = Array.isArray(dias) ? dias.length : 0;
  return Math.max(0, duracion * numDias);
}

/** Verifica si dos secciones tienen conflicto horario */
function hayConflicto(s1, s2) {
  if (!s1.dias || !s2.dias || !s1.horaInicio || !s2.horaInicio) return false;
  const diasComunes = s1.dias.filter(d => s2.dias.includes(d));
  if (diasComunes.length === 0) return false;
  return s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin;
}

/** Clasifica el estado de carga de un docente */
function estadoCarga(horas) {
  if (horas > MAX_HORAS) return 'exceso';
  if (horas >= 40) return 'limite';
  return 'normal';
}

// ── getStats ─────────────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    // [OPTIMIZACIÓN 1] Evitar descargar ObjectIds de estudiantesMatriculados usando Agregación y $size
    let secciones = await Seccion.aggregate([
      {
        $project: {
          codigoSeccion: 1,
          curso: 1,
          docente: 1,
          dias: 1,
          horaInicio: 1,
          horaFin: 1,
          aula: 1,
          cupoMaximo: 1,
          horario: 1,
          estudiantesMatriculadosCount: { $size: { $ifNull: ["$estudiantesMatriculados", []] } }
        }
      }
    ]);

    // [OPTIMIZACIÓN 1] Poblar referencias en memoria
    secciones = await Seccion.populate(secciones, [
      { path: 'curso', select: 'nombre codigo' },
      { path: 'docente', select: 'nombre apellidos' }
    ]);

    const totalSecciones = secciones.length;
    let totalMatriculados = 0;
    let totalCupos = 0;
    let salonesLlenos = 0;

    const cargaPorDia = { Lunes: 0, Martes: 0, Miércoles: 0, Jueves: 0, Viernes: 0, Sábado: 0, Domingo: 0 };
    const turnos = { Mañana: 0, Tarde: 0, Noche: 0 };
    const cargaDocente = {};
    const distOcupacion = { '0-24%': 0, '25-49%': 0, '50-74%': 0, '75-99%': 0, '100%': 0 };
    const docentesConSeccion = new Set();
    const seccionesSinAsignar = [];

    for (const s of secciones) {
      if (!s.docente) {
        seccionesSinAsignar.push({
          _id: s._id,
          codigoSeccion: s.codigoSeccion,
          curso: s.curso?.nombre,
          dias: s.dias,
          horaInicio: s.horaInicio,
          horaFin: s.horaFin,
          aula: s.aula,
          horario: s.horario
        });
      }

      const mat = s.estudiantesMatriculadosCount || 0;
      const cupo = s.cupoMaximo || 30;
      totalMatriculados += mat;
      totalCupos += cupo;
      if (mat >= cupo) salonesLlenos++;

      const pct = cupo > 0 ? (mat / cupo) * 100 : 0;
      if (pct < 25) distOcupacion['0-24%']++;
      else if (pct < 50) distOcupacion['25-49%']++;
      else if (pct < 75) distOcupacion['50-74%']++;
      else if (pct < 100) distOcupacion['75-99%']++;
      else distOcupacion['100%']++;

      if (s.dias) s.dias.forEach(d => { if (cargaPorDia[d] !== undefined) cargaPorDia[d]++; });

      if (s.horaInicio) {
        const h = parseInt(s.horaInicio.split(':')[0]);
        if (h < 13) turnos['Mañana']++;
        else if (h < 18) turnos['Tarde']++;
        else turnos['Noche']++;
      }

      if (s.docente) {
        const did = String(s.docente._id);
        docentesConSeccion.add(did);
        if (!cargaDocente[did]) {
          cargaDocente[did] = {
            nombre: `${s.docente.nombre} ${s.docente.apellidos}`,
            secciones: 0,
            horasSemanales: 0,
          };
        }
        cargaDocente[did].secciones++;
        cargaDocente[did].horasSemanales += calcularHorasSeccion(s.horaInicio, s.horaFin, s.dias);
      }
    }

    const histogramaCarga = {
      '0-10h': 0, '11-20h': 0, '21-30h': 0, '31-40h': 0, '41-48h': 0, '>48h': 0
    };

    // Redondear horas a 1 decimal y llenar histograma
    Object.values(cargaDocente).forEach(d => {
      d.horasSemanales = Math.round(d.horasSemanales * 10) / 10;
      if (d.horasSemanales <= 10) histogramaCarga['0-10h']++;
      else if (d.horasSemanales <= 20) histogramaCarga['11-20h']++;
      else if (d.horasSemanales <= 30) histogramaCarga['21-30h']++;
      else if (d.horasSemanales <= 40) histogramaCarga['31-40h']++;
      else if (d.horasSemanales <= MAX_HORAS) histogramaCarga['41-48h']++;
      else histogramaCarga['>48h']++;
    });

    // Top 10 docentes por horas semanales
    const topDocentes = Object.values(cargaDocente)
      .sort((a, b) => b.horasSemanales - a.horasSemanales)
      .slice(0, 10);

    // KPI: docentes en exceso (> 48h)
    const docentesEnExceso = Object.values(cargaDocente).filter(d => d.horasSemanales > MAX_HORAS).length;

    // Conflictos de horario
    const conflictosDocente = [];
    const conflictosAula = [];
    for (let i = 0; i < secciones.length; i++) {
      for (let j = i + 1; j < secciones.length; j++) {
        const a = secciones[i], b = secciones[j];
        if (!hayConflicto(a, b)) continue;
        if (a.docente && b.docente && String(a.docente._id) === String(b.docente._id)) {
          conflictosDocente.push({
            docente: `${a.docente.nombre} ${a.docente.apellidos}`,
            seccion1: { codigo: a.codigoSeccion, curso: a.curso?.nombre, horario: a.horario },
            seccion2: { codigo: b.codigoSeccion, curso: b.curso?.nombre, horario: b.horario },
          });
        }
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
        const pct = s.cupoMaximo > 0 ? (s.estudiantesMatriculadosCount || 0) / s.cupoMaximo : 0;
        return pct >= 0.8 && pct < 1;
      })
      .map(s => ({
        codigo: s.codigoSeccion,
        curso: s.curso?.nombre,
        matriculados: s.estudiantesMatriculadosCount || 0,
        cupo: s.cupoMaximo,
        pct: Math.round(((s.estudiantesMatriculadosCount || 0) / s.cupoMaximo) * 100),
      }))
      .sort((a, b) => b.pct - a.pct);

    // Docentes que superan las 48h (criterio real)
    const docentesSobrecargados = Object.values(cargaDocente)
      .filter(d => d.horasSemanales > MAX_HORAS)
      .sort((a, b) => b.horasSemanales - a.horasSemanales);

    res.json({
      kpis: {
        totalSecciones,
        porcentajeOcupacion: totalCupos > 0 ? Math.round((totalMatriculados / totalCupos) * 100) : 0,
        salonesLlenos,
        cuposDisponibles: totalCupos - totalMatriculados,
        docentesConSeccion: docentesConSeccion.size,
        docentesEnExceso,
      },
      graficos: {
        cargaPorDia,
        turnos,
        topDocentes,
        distOcupacion,
        histogramaCarga,
      },
      alertas: {
        conflictosDocente: conflictosDocente.slice(0, 20),
        conflictosAula: conflictosAula.slice(0, 20),
        casiLlenos: casiLlenos.slice(0, 20),
        docentesSobrecargados,
        seccionesSinAsignar,
      },
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
        matriculados: s.estudiantesMatriculadosCount || 0,
        cupoMaximo: s.cupoMaximo,
      })),
    });
  } catch (err) {
    console.error('Error en planificacion/stats:', err);
    res.status(500).json({ msg: 'Error al obtener estadísticas de planificación' });
  }
};

// ── getCargaHoraria ───────────────────────────────────────────────────────────

exports.getCargaHoraria = async (req, res) => {
  try {
    const secciones = await Seccion.find()
      .populate('curso', 'nombre codigo')
      .populate('docente', 'nombre apellidos email')
      .lean();

    // Agrupar secciones por docente
    const porDocente = {};
    for (const s of secciones) {
      if (!s.docente) continue;
      const did = String(s.docente._id);
      if (!porDocente[did]) {
        porDocente[did] = {
          _id: did,
          nombre: `${s.docente.nombre} ${s.docente.apellidos}`,
          email: s.docente.email || '',
          secciones: [],
          totalHoras: 0,
        };
      }
      const horas = calcularHorasSeccion(s.horaInicio, s.horaFin, s.dias);
      porDocente[did].totalHoras += horas;
      porDocente[did].secciones.push({
        _id: s._id,
        codigoSeccion: s.codigoSeccion,
        curso: s.curso?.nombre || 'Sin curso',
        dias: s.dias || [],
        horaInicio: s.horaInicio,
        horaFin: s.horaFin,
        aula: s.aula,
        horario: s.horario,
        horas: Math.round(horas * 10) / 10,
      });
    }

    const resultado = Object.values(porDocente)
      .map(d => ({
        ...d,
        totalHoras: Math.round(d.totalHoras * 10) / 10,
        estado: estadoCarga(d.totalHoras),
        pctCarga: Math.min(Math.round((d.totalHoras / MAX_HORAS) * 100), 999),
      }))
      .sort((a, b) => b.totalHoras - a.totalHoras);

    res.json({ maxHoras: MAX_HORAS, docentes: resultado });
  } catch (err) {
    console.error('Error en carga-horaria:', err);
    res.status(500).json({ msg: 'Error al calcular carga horaria' });
  }
};

// ── Reasignación Inteligente ────────────────────────────────────────────────

exports.getDocentesDisponibles = async (req, res) => {
  try {
    const { horaInicio, horaFin, dias } = req.query;
    if (!horaInicio || !horaFin || !dias) {
      return res.status(400).json({ msg: 'horaInicio, horaFin y dias son requeridos' });
    }
    
    const diasArray = dias.split(',');
    const horasNuevas = calcularHorasSeccion(horaInicio, horaFin, diasArray);

    const docentes = await User.find({ rol: 'DOCENTE' }).lean();
    const todasSecciones = await Seccion.find().lean();
    
    const docentesSugeridos = [];

    for (const doc of docentes) {
      const idDocente = String(doc._id);
      const secDocente = todasSecciones.filter(s => s.docente && String(s.docente) === idDocente);
      
      let horasActuales = 0;
      let tieneConflicto = false;
      
      for (const s of secDocente) {
        horasActuales += calcularHorasSeccion(s.horaInicio, s.horaFin, s.dias);
        if (hayConflicto(s, { horaInicio, horaFin, dias: diasArray })) {
          tieneConflicto = true;
        }
      }
      
      if (!tieneConflicto && (horasActuales + horasNuevas <= MAX_HORAS)) {
        docentesSugeridos.push({
          _id: doc._id,
          nombre: `${doc.nombre} ${doc.apellidos}`,
          horasActuales: Math.round(horasActuales * 10) / 10,
          horasProyectadas: Math.round((horasActuales + horasNuevas) * 10) / 10,
          seccionesActuales: secDocente.length
        });
      }
    }

    docentesSugeridos.sort((a, b) => a.horasProyectadas - b.horasProyectadas);
    res.json(docentesSugeridos);
  } catch (err) {
    console.error('Error buscando docentes disponibles:', err);
    res.status(500).json({ msg: 'Error al buscar docentes' });
  }
};

exports.reasignarDocente = async (req, res) => {
  try {
    const { id } = req.params;
    const { docenteId } = req.body;
    
    const seccion = await Seccion.findById(id);
    if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });
    
    seccion.docente = docenteId;
    await seccion.save();
    
    res.json({ msg: 'Docente reasignado correctamente' });
  } catch (err) {
    console.error('Error reasignando docente:', err);
    res.status(500).json({ msg: 'Error al reasignar docente' });
  }
};

exports.liberarSeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const seccion = await Seccion.findById(id);
    if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });
    
    seccion.docente = null; // Quitar docente
    await seccion.save();
    
    res.json({ msg: 'Sección liberada correctamente' });
  } catch (err) {
    console.error('Error liberando sección:', err);
    res.status(500).json({ msg: 'Error al liberar sección' });
  }
};

exports.editarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { dias, horaInicio, horaFin, aula } = req.body;
    
    const seccion = await Seccion.findById(id);
    if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });
    
    if (dias) seccion.dias = dias;
    if (horaInicio) seccion.horaInicio = horaInicio;
    if (horaFin) seccion.horaFin = horaFin;
    if (aula) seccion.aula = aula;
    
    seccion.horario = `${(dias || seccion.dias).join(', ')} ${horaInicio || seccion.horaInicio} - ${horaFin || seccion.horaFin}`;
    
    await seccion.save();
    
    res.json({ msg: 'Horario actualizado correctamente', seccion });
  } catch (err) {
    console.error('Error editando horario:', err);
    res.status(500).json({ msg: 'Error al editar horario' });
  }
};

