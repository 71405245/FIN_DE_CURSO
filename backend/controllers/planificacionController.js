const Seccion = require('../models/Seccion');
const User = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');

// ── Helpers de Cálculo ──────────────────────────────────────────────────────

function horaADecimal(horaStr) {
  if (!horaStr) return 0;
  const [h, m] = horaStr.split(':').map(Number);
  return h + m / 60;
}

function calcularHorasSeccion(horaInicioOrObj, horaFin, dias) {
  let hI_str, hF_str, dias_arr;
  if (typeof horaInicioOrObj === 'object' && horaInicioOrObj !== null) {
    hI_str = horaInicioOrObj.horaInicio;
    hF_str = horaInicioOrObj.horaFin;
    dias_arr = horaInicioOrObj.dias;
  } else {
    hI_str = horaInicioOrObj;
    hF_str = horaFin;
    dias_arr = dias;
  }
  if (!hI_str || !hF_str || !dias_arr) return 0;
  const [hI, mI] = hI_str.split(':').map(Number);
  const [hF, mF] = hF_str.split(':').map(Number);
  const horasPorSesion = (hF * 60 + mF - (hI * 60 + mI)) / 60;
  return Math.max(0, horasPorSesion * dias_arr.length);
}

function hayConflicto(s1, s2) {
  if (!s1 || !s2 || !s1.dias || !s2.dias || !s1.horaInicio || !s2.horaInicio || !s1.horaFin || !s2.horaFin) return false;
  const diasComunes = s1.dias.filter(d => s2.dias.includes(d));
  if (diasComunes.length === 0) return false;
  return s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin;
}

function clasificarEstadoDocente(totalHoras) {
  if (totalHoras > 48) return 'exceso';
  if (totalHoras >= 40) return 'limite';
  return 'normal';
}

function detectarConflictos(secciones) {
  const conflictosDocente = [];
  const conflictosAula = [];

  for (let i = 0; i < secciones.length; i++) {
    for (let j = i + 1; j < secciones.length; j++) {
      const s1 = secciones[i];
      const s2 = secciones[j];
      if (!s1.dias || !s2.dias || !s1.horaInicio || !s2.horaInicio) continue;

      if (!hayConflicto(s1, s2)) continue;

      const horario1 = `${s1.dias.join('/')} ${s1.horaInicio}-${s1.horaFin}`;
      const horario2 = `${s2.dias.join('/')} ${s2.horaInicio}-${s2.horaFin}`;
      const curso1 = s1.curso?.nombre || s1.curso;
      const curso2 = s2.curso?.nombre || s2.curso;

      const mismoDocente = s1.docente && s2.docente &&
        String(s1.docente._id || s1.docente) === String(s2.docente._id || s2.docente);
      if (mismoDocente) {
        const nombreDocente = s1.docente.nombre && s1.docente.apellidos
          ? `${s1.docente.nombre} ${s1.docente.apellidos}`
          : String(s1.docente);
        conflictosDocente.push({
          docente: nombreDocente,
          seccion1: { curso: curso1, horario: horario1 },
          seccion2: { curso: curso2, horario: horario2 }
        });
      }

      const mismaAula = s1.aula && s2.aula && s1.aula === s2.aula;
      if (mismaAula) {
        conflictosAula.push({
          aula: s1.aula,
          seccion1: { curso: curso1, horario: horario1 },
          seccion2: { curso: curso2, horario: horario2 }
        });
      }
    }
  }
  return { conflictosDocente, conflictosAula };
}

function calcularHistogramaCarga(docentes) {
  const hist = { '0-10h': 0, '11-20h': 0, '21-30h': 0, '31-40h': 0, '41-48h': 0, '>48h': 0 };
  docentes.forEach(d => {
    const h = d.totalHoras;
    if (h <= 10) hist['0-10h']++;
    else if (h <= 20) hist['11-20h']++;
    else if (h <= 30) hist['21-30h']++;
    else if (h <= 40) hist['31-40h']++;
    else if (h <= 48) hist['41-48h']++;
    else hist['>48h']++;
  });
  return hist;
}

function calcularCargaPorDia(secciones) {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const carga = {};
  dias.forEach(d => { carga[d] = 0; });
  secciones.forEach(s => {
    (s.dias || []).forEach(d => { if (carga[d] !== undefined) carga[d]++; });
  });
  return carga;
}

function calcularDistOcupacion(secciones) {
  const dist = { '0-24%': 0, '25-49%': 0, '50-74%': 0, '75-99%': 0, '100%': 0 };
  secciones.forEach(s => {
    if (!s.cupoMaximo) return;
    const pct = (s.estudiantesMatriculados.length / s.cupoMaximo) * 100;
    if (pct < 25) dist['0-24%']++;
    else if (pct < 50) dist['25-49%']++;
    else if (pct < 75) dist['50-74%']++;
    else if (pct < 100) dist['75-99%']++;
    else dist['100%']++;
  });
  return dist;
}

// ── Controladores ─────────────────────────────────────────────────────────────

exports.getPlanificacionStats = asyncWrapper(async (req, res) => {
  const [secciones, docentes] = await Promise.all([
    Seccion.find().populate('curso', 'nombre creditos').populate('docente', 'nombre apellidos').lean(),
    User.find({ rol: 'DOCENTE' }).lean()
  ]);

  const seccionesSinAsignar = secciones
    .filter(s => !s.docente)
    .map(s => ({
      _id: s._id,
      codigoSeccion: s.codigoSeccion,
      curso: s.curso?.nombre || 'N/A',
      dias: s.dias,
      horaInicio: s.horaInicio,
      horaFin: s.horaFin,
      aula: s.aula
    }));

  const salonesLlenos = secciones.filter(s => s.estudiantesMatriculados.length >= s.cupoMaximo).length;
  const ocupTotal = secciones.reduce((a, s) => a + s.estudiantesMatriculados.length, 0);
  const capTotal = secciones.reduce((a, s) => a + (s.cupoMaximo || 0), 0);
  const pctOcup = capTotal > 0 ? Math.round((ocupTotal / capTotal) * 100) : 0;

  const docentesSecciones = {};
  secciones.forEach(s => {
    if (!s.docente) return;
    const id = String(s.docente._id || s.docente);
    if (!docentesSecciones[id]) docentesSecciones[id] = { horas: 0, count: 0 };
    docentesSecciones[id].horas += calcularHorasSeccion(s);
    docentesSecciones[id].count++;
  });

  const totalDocentes = docentes.length;
  const docentesConSeccion = Object.keys(docentesSecciones).length;
  const docentesEnExceso = Object.values(docentesSecciones).filter(d => d.horas > 48).length;

  const { conflictosDocente, conflictosAula } = detectarConflictos(secciones);

  const casiLlenos = secciones
    .filter(s => s.cupoMaximo > 0 && (s.estudiantesMatriculados.length / s.cupoMaximo) >= 0.8 && s.estudiantesMatriculados.length < s.cupoMaximo)
    .map(s => ({
      _id: s._id,
      codigo: s.codigoSeccion,
      curso: s.curso?.nombre || 'N/A',
      pct: Math.round((s.estudiantesMatriculados.length / s.cupoMaximo) * 100)
    }))
    .sort((a, b) => b.pct - a.pct);

  const docentesArr = docentes.map(d => ({
    horas: docentesSecciones[String(d._id)]?.horas || 0
  }));

  res.json({
    kpis: {
      totalSecciones: secciones.length,
      porcentajeOcupacion: pctOcup,
      salonesLlenos,
      totalDocentes,
      docentesConSeccion,
      docentesEnExceso
    },
    graficos: {
      histogramaCarga: calcularHistogramaCarga(docentesArr),
      cargaPorDia: calcularCargaPorDia(secciones),
      distOcupacion: calcularDistOcupacion(secciones)
    },
    alertas: {
      seccionesSinAsignar,
      conflictosDocente,
      conflictosAula,
      casiLlenos
    }
  });
});

exports.getCargaHoraria = asyncWrapper(async (req, res) => {
  const [docentes, secciones] = await Promise.all([
    User.find({ rol: 'DOCENTE' }).select('nombre apellidos email turnoDisponibilidad').lean(),
    Seccion.find({ docente: { $ne: null } })
      .populate('curso', 'nombre creditos')
      .populate('docente', '_id')
      .lean()
  ]);

  const secsByDocente = {};
  secciones.forEach(s => {
    const id = String(s.docente?._id);
    if (!secsByDocente[id]) secsByDocente[id] = [];
    secsByDocente[id].push(s);
  });

  const result = docentes.map(d => {
    const secsDoc = secsByDocente[String(d._id)] || [];
    const totalHoras = secsDoc.reduce((acc, s) => acc + calcularHorasSeccion(s), 0);
    return {
      _id: d._id,
      nombre: `${d.nombre} ${d.apellidos}`,
      email: d.email,
      turnoDisponibilidad: d.turnoDisponibilidad,
      totalHoras: Math.round(totalHoras * 10) / 10,
      estado: clasificarEstadoDocente(totalHoras),
      secciones: secsDoc.map(s => ({
        _id: s._id,
        codigoSeccion: s.codigoSeccion,
        curso: s.curso?.nombre || 'N/A',
        dias: s.dias || [],
        horaInicio: s.horaInicio,
        horaFin: s.horaFin,
        aula: s.aula,
        horas: Math.round(calcularHorasSeccion(s) * 10) / 10
      }))
    };
  });

  res.json({ maxHoras: 48, docentes: result });
});

exports.getDocentesDisponibles = asyncWrapper(async (req, res) => {
  const { horaInicio, horaFin, dias } = req.query;
  const diasArr = dias ? dias.split(',') : [];

  const docentes = await User.find({ rol: 'DOCENTE' }).select('nombre apellidos turnoDisponibilidad').lean();
  const secciones = await Seccion.find({ docente: { $ne: null } }).lean();

  const secsByDocente = {};
  secciones.forEach(s => {
    const id = String(s.docente);
    if (!secsByDocente[id]) secsByDocente[id] = [];
    secsByDocente[id].push(s);
  });

  const disponibles = docentes
    .map(d => {
      const secsDoc = secsByDocente[String(d._id)] || [];
      const horasActuales = secsDoc.reduce((acc, s) => acc + calcularHorasSeccion(s), 0);
      const [hI, mI] = horaInicio.split(':').map(Number);
      const [hF, mF] = horaFin.split(':').map(Number);
      const horasNuevas = ((hF * 60 + mF) - (hI * 60 + mI)) / 60 * diasArr.length;
      const horasProyectadas = Math.round((horasActuales + horasNuevas) * 10) / 10;

      const tieneCruce = secsDoc.some(s => {
        if (!s.dias || !s.horaInicio || !s.horaFin) return false;
        const diasComunes = s.dias.filter(d => diasArr.includes(d));
        if (diasComunes.length === 0) return false;
        return s.horaInicio < horaFin && horaInicio < s.horaFin;
      });

      return { _id: d._id, nombre: `${d.nombre} ${d.apellidos}`, horasActuales: Math.round(horasActuales * 10) / 10, horasProyectadas, tieneCruce };
    })
    .filter(d => !d.tieneCruce && d.horasProyectadas <= 48)
    .sort((a, b) => a.horasProyectadas - b.horasProyectadas);

  res.json(disponibles);
});

exports.reasignarDocente = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { docenteId } = req.body;
  const seccion = await Seccion.findById(id);
  if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });
  seccion.docente = docenteId;
  await seccion.save();
  res.json({ msg: 'Docente reasignado correctamente' });
});

exports.liberarSeccion = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const seccion = await Seccion.findById(id);
  if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });
  seccion.docente = null;
  await seccion.save();
  res.json({ msg: 'Sección liberada correctamente' });
});

exports.editarHorarioSeccion = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { dias, horaInicio, horaFin, aula } = req.body;
  const seccion = await Seccion.findById(id);
  if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });

  if (dias) seccion.dias = dias;
  if (horaInicio) seccion.horaInicio = horaInicio;
  if (horaFin) seccion.horaFin = horaFin;
  if (aula) seccion.aula = aula;

  if (seccion.dias && seccion.horaInicio && seccion.horaFin) {
    seccion.horario = `${seccion.dias.join('/')} ${seccion.horaInicio} - ${seccion.horaFin}`;
  }

  await seccion.save();
  res.json({ msg: 'Horario actualizado correctamente', seccion });
});

exports.getServerStats = asyncWrapper(async (req, res) => {
  const os = require('os');
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const uptimeSecs = process.uptime();

  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;

  res.json({
    cpu: Math.round(cpuUsage),
    ramUsada: Math.round(usedMem / 1024 / 1024),
    ramTotal: Math.round(totalMem / 1024 / 1024),
    uptime: uptimeSecs
  });
});

module.exports._helpers = {
  horaADecimal,
  calcularHorasSeccion,
  hayConflicto,
  estadoCarga: clasificarEstadoDocente
};