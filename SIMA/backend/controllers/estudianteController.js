const User    = require('../models/User');
const Curso   = require('../models/Curso');
const Seccion = require('../models/Seccion');
const Calificacion = require('../models/Calificacion');

// ── Secciones disponibles para un estudiante ─────────────────────────────────
exports.getSeccionesDisponibles = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    const estudiante   = await User.findById(estudianteId);

    if (!estudiante || estudiante.rol !== 'ESTUDIANTE') {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // Cursos del ciclo actual en su carrera
    const cursos    = await Curso.find({ carrera: estudiante.carrera, ciclo: estudiante.cicloActual });
    const cursosIds = cursos.map(c => c._id);

    // Secciones disponibles de esos cursos
    let secciones = await Seccion.find({ curso: { $in: cursosIds } })
      .populate('curso', 'nombre codigo creditos ciclo prerrequisitos area tipo')
      .populate('docente', 'nombre apellidos')
      .lean();

    // Filtrar: sin cupo lleno y no matriculado ya
    secciones = secciones.filter(s => {
      const isEnrolled = s.estudiantesMatriculados.map(String).includes(String(estudianteId));
      const hasSpace   = s.estudiantesMatriculados.length < s.cupoMaximo;
      return !isEnrolled && hasSpace;
    });

    res.json(secciones);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};

// ── Mis secciones matriculadas ────────────────────────────────────────────────
exports.misSecciones = async (req, res) => {
  try {
    const secciones = await Seccion.find({ estudiantesMatriculados: req.user.id })
      .populate('curso', 'nombre codigo creditos ciclo area tipo')
      .populate('docente', 'nombre apellidos')
      .lean();
    res.json(secciones);
  } catch (err) {
    res.status(500).send('Error en el servidor');
  }
};

// ── Matricular en una sección (con validación de prerrequisitos) ──────────────
exports.matricular = async (req, res) => {
  try {
    const { seccionId }  = req.body;
    const estudianteId   = req.user.id;

    const seccion = await Seccion.findById(seccionId).populate('curso');
    if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });

    // Cupo
    if (seccion.estudiantesMatriculados.length >= seccion.cupoMaximo) {
      return res.status(400).json({ msg: 'El salón no tiene cupos disponibles' });
    }

    // Ya matriculado
    if (seccion.estudiantesMatriculados.map(String).includes(String(estudianteId))) {
      return res.status(400).json({ msg: 'Ya estás matriculado en esta sección' });
    }

    // Validar prerrequisitos si el curso los tiene
    const curso = seccion.curso;
    if (curso.prerrequisitos && curso.prerrequisitos.length > 0) {
      // Obtener calificaciones aprobadas del estudiante
      const calificaciones = await Calificacion.find({
        estudiante: estudianteId,
        aprobado: true,
      }).populate('curso', 'codigo');

      const codigosAprobados = calificaciones.map(cal => cal.curso?.codigo).filter(Boolean);

      const faltantes = curso.prerrequisitos.filter(pre => !codigosAprobados.includes(pre));
      if (faltantes.length > 0) {
        return res.status(400).json({
          msg: `No cumples los prerrequisitos: ${faltantes.join(', ')}`,
          prerrequisitosFaltantes: faltantes,
        });
      }
    }

    // Inscribir
    seccion.estudiantesMatriculados.push(estudianteId);
    await seccion.save();

    res.json({ msg: 'Matrícula exitosa', seccion });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};

// ── Rectificar Matrícula (Retirarse de un curso) ──────────────────────────────
exports.rectificar = async (req, res) => {
  try {
    const { seccionId } = req.body;
    const estudianteId = req.user.id;

    const seccion = await Seccion.findById(seccionId);
    if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });

    const index = seccion.estudiantesMatriculados.indexOf(estudianteId);
    if (index === -1) {
      return res.status(400).json({ msg: 'No estás matriculado en esta sección' });
    }

    seccion.estudiantesMatriculados.splice(index, 1);
    await seccion.save();

    res.json({ msg: 'Rectificación exitosa, te has retirado del curso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};

// Perfil de estudiante completo con estadísticas
exports.getPerfil = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    const estudiante = await User.findById(estudianteId).populate('carrera', 'nombre');

    if (!estudiante || estudiante.rol !== 'ESTUDIANTE') {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // 1. Obtener calificaciones para créditos aprobados
    const calificaciones = await Calificacion.find({ estudiante: estudianteId }).populate('curso', 'creditos');

    // ── [OPTIMIZACIÓN] Lógica de Reiterancia de Desaprobación ───────────────
    // Solo penalizamos con 15 CR si el alumno ha jalado un mismo curso 3+ veces 
    // y aún no lo ha aprobado.
    const historialPorCurso = {};
    calificaciones.forEach(c => {
      const cursoId = String(c.curso?._id);
      if (!historialPorCurso[cursoId]) {
        historialPorCurso[cursoId] = { aprobado: false, jales: 0 };
      }
      if (c.aprobado) historialPorCurso[cursoId].aprobado = true;
      else historialPorCurso[cursoId].jales++;
    });

    let creditosAprobados = 0;
    calificaciones.forEach(c => { if (c.aprobado) creditosAprobados += c.curso?.creditos || 0; });

    // Cursos con 3 o más jales activos (sin haber aprobado el curso aún)
    const cursosCriticos = Object.values(historialPorCurso).filter(h => h.jales >= 3 && !h.aprobado);
    const esRestringido = cursosCriticos.length > 0;
    const limiteCreditos = esRestringido ? 15 : 22;

    // 2. Obtener créditos matriculados actuales
    const misSecciones = await Seccion.find({ estudiantesMatriculados: estudianteId }).populate('curso', 'creditos');
    let creditosMatriculados = 0;
    misSecciones.forEach(s => {
      creditosMatriculados += s.curso?.creditos || 0;
    });

    res.json({
      estudiante: {
        nombre: estudiante.nombre,
        apellidos: estudiante.apellidos,
        email: estudiante.email,
        cicloActual: estudiante.cicloActual,
        carreraNombre: estudiante.carrera?.nombre || 'General'
      },
      creditosAprobados,
      creditosMatriculados,
      esRestringido,
      limiteCreditos
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};

// ── Plan de estudios (cursos del ciclo con créditos) ──────────────────────────
exports.getPlanEstudios = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    const estudiante = await User.findById(estudianteId);
    if (!estudiante) return res.status(404).json({ msg: 'Estudiante no encontrado' });

    // Todos los cursos de la carrera del estudiante, agrupados por ciclo
    const cursos = await Curso.find({ carrera: estudiante.carrera })
      .sort({ ciclo: 1, nombre: 1 })
      .lean();

    // Calificaciones para saber cuáles están aprobados/jalados
    const calificaciones = await Calificacion.find({ estudiante: estudianteId }).lean();
    const calMap = {};
    calificaciones.forEach(c => {
      calMap[String(c.curso)] = { nota: c.nota, aprobado: c.aprobado };
    });

    // Secciones matriculadas actualmente
    const seccionesActuales = await Seccion.find({ estudiantesMatriculados: estudianteId }).select('curso').lean();
    const matriculadosSet = new Set(seccionesActuales.map(s => String(s.curso)));

    const cursosConEstado = cursos.map(c => {
      const idStr = String(c._id);
      const cal = calMap[idStr];
      let estado = 'pendiente';
      if (cal) estado = cal.aprobado ? 'aprobado' : 'jalado';
      else if (matriculadosSet.has(idStr)) estado = 'matriculado';

      return {
        _id: c._id,
        nombre: c.nombre,
        codigo: c.codigo,
        creditos: c.creditos,
        ciclo: c.ciclo,
        estado,
        nota: cal?.nota ?? null
      };
    });

    res.json({ cursos: cursosConEstado, totalCursos: cursosConEstado.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};

// ── Historial académico con datos para gráficos ───────────────────────────────
exports.getHistorial = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    const calificaciones = await Calificacion.find({ estudiante: estudianteId })
      .populate('curso', 'nombre codigo creditos ciclo')
      .lean();

    // Estadísticas generales
    let aprobados = 0, jalados = 0, creditosAcumulados = 0;
    const porCiclo = {};

    calificaciones.forEach(c => {
      const ciclo = c.curso?.ciclo ?? 0;
      if (!porCiclo[ciclo]) porCiclo[ciclo] = { aprobados: 0, jalados: 0, total: 0 };
      porCiclo[ciclo].total++;

      if (c.aprobado) {
        aprobados++;
        creditosAcumulados += c.curso?.creditos || 0;
        porCiclo[ciclo].aprobados++;
      } else {
        jalados++;
        porCiclo[ciclo].jalados++;
      }
    });

    // Preparar data para Chart.js (ordenada por ciclo)
    const ciclosOrdenados = Object.keys(porCiclo).sort((a, b) => Number(a) - Number(b));
    const chartData = {
      labels: ciclosOrdenados.map(c => `Ciclo ${c}`),
      aprobados: ciclosOrdenados.map(c => porCiclo[c].aprobados),
      jalados: ciclosOrdenados.map(c => porCiclo[c].jalados)
    };

    res.json({
      resumen: { aprobados, jalados, creditosAcumulados, totalCursos: calificaciones.length },
      chartData,
      detalle: calificaciones.map(c => ({
        curso: c.curso?.nombre,
        codigo: c.curso?.codigo,
        creditos: c.curso?.creditos,
        ciclo: c.curso?.ciclo,
        nota: c.nota,
        aprobado: c.aprobado,
        periodo: c.periodo
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};

// [RESTRICCIÓN] Cálculo de costo real (Créditos + Penalidad por jales)
async function obtenerCostoRealCurso(estudianteId, cursoId, creditosBase) {
  const jales = await Calificacion.countDocuments({ 
    estudiante: estudianteId, 
    curso: cursoId, 
    aprobado: false 
  });
  return creditosBase + jales;
}

// ── Helper functions for AI Scheduler ──────────────────────────────
function checkOverlap(s1, s2) {
  if (!s1 || !s2 || !s1.dias || !s2.dias) return false;
  const commonDays = s1.dias.filter(d => s2.dias.includes(d));
  if (commonDays.length === 0) return false;
  if (!s1.horaInicio || !s2.horaInicio || !s1.horaFin || !s2.horaFin) return false;
  return (s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin);
}

function checkTurno(s, turno) {
  if (!s || !s.horaInicio) return true;
  if (turno === 'MAÑANA') return s.horaInicio < '13:00';
  if (turno === 'TARDE') return s.horaInicio >= '13:00' && s.horaInicio < '18:00';
  if (turno === 'NOCHE') return s.horaInicio >= '18:00';
  return true; // MIXTO o vacio
}

function countUniqueDays(schedule) {
  const days = new Set();
  schedule.forEach(s => {
    if (s && s.dias) {
      s.dias.forEach(d => days.add(d));
    }
  });
  return days.size;
}

// ── Generador de Horario "IA" (heurístico inteligente optimizado) ────────────────────────
exports.generarHorarioIA = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    // Preferencias recibidas del frontend
    const { turno = 'MIXTO', cantidadCursos = 5, diasPorSemana = 6 } = req.body;

    const estudiante = await User.findById(estudianteId);
    if (!estudiante) return res.status(404).json({ msg: 'Estudiante no encontrado' });

    // 1. Cursos pendientes del ciclo actual
    const cursosCiclo = await Curso.find({ carrera: estudiante.carrera, ciclo: estudiante.cicloActual }).lean();
    const calificaciones = await Calificacion.find({ estudiante: estudianteId, aprobado: true }).select('curso').lean();
    const aprobadosSet = new Set(calificaciones.map(c => String(c.curso)));

    const seccionesActuales = await Seccion.find({ estudiantesMatriculados: estudianteId }).select('curso').lean();
    const matriculadosSet = new Set(seccionesActuales.map(s => String(s.curso)));

    const cursosPendientes = cursosCiclo.filter(c =>
      !aprobadosSet.has(String(c._id)) && !matriculadosSet.has(String(c._id))
    );

    if (cursosPendientes.length === 0) {
      return res.json({ success: true, message: 'No tienes cursos pendientes este ciclo.', alternativas: [] });
    }

    const cursosIds = cursosPendientes.map(c => c._id);
    
    // Optimización: 1 sola consulta masiva a la BD para todas las secciones
    const todasSecciones = await Seccion.find({ curso: { $in: cursosIds } })
      .populate('docente', 'nombre apellidos')
      .populate('curso', 'nombre creditos')
      .lean();

    // Agrupar secciones por curso y filtrar llenas
    const seccionesPorCurso = {};
    cursosPendientes.forEach(c => { seccionesPorCurso[c._id] = []; });
    
    todasSecciones.forEach(s => {
      if (s.estudiantesMatriculados.length < s.cupoMaximo) {
        seccionesPorCurso[s.curso._id].push(s);
      }
    });

    // Ordenar cursos por los que tienen menos secciones (para optimizar backtracking)
    cursosPendientes.sort((a, b) => seccionesPorCurso[a._id].length - seccionesPorCurso[b._id].length);
    
    // Limitar iteración a cantidad de cursos pedidos
    const cursosAProcesar = cursosPendientes.slice(0, cantidadCursos);

    // Motor Backtracking Exacto (DFS con Heurística MRV y Forward Checking)
    const todasLasAlternativas = [];

    function backtrack(cursoIndex, horarioActual) {
      // PODA: Si ya exploramos suficientes combinaciones exitosas, cortamos para evitar latencia (O(2^n) limit)
      if (todasLasAlternativas.length >= 150) return;

      // Condición base: Se han intentado asignar todos los cursos solicitados
      if (cursoIndex === cursosAProcesar.length) {
        todasLasAlternativas.push([...horarioActual]);
        return;
      }

      const cursoActual = cursosAProcesar[cursoIndex];
      const opcionesSeccion = seccionesPorCurso[cursoActual._id];

      // PODA: Si este curso no tiene opciones disponibles, forzamos intentar armar horario parcial sin él
      if (!opcionesSeccion || opcionesSeccion.length === 0) {
        backtrack(cursoIndex + 1, horarioActual);
        return;
      }

      // Intentar colocar cada sección de este curso
      for (const seccion of opcionesSeccion) {
        // Forward Checking: No solapamiento de horario (Hard Constraint)
        let cruza = false;
        for (const asignada of horarioActual) {
          if (checkOverlap(seccion, asignada)) {
            cruza = true;
            break;
          }
        }

        if (!cruza) {
          horarioActual.push(seccion);
          backtrack(cursoIndex + 1, horarioActual);
          horarioActual.pop(); // Backtrack (deshacer el paso y probar la siguiente sección)
        }
      }
      
      // Permitir horarios parciales (por si es matemáticamente imposible llevar los N cursos juntos)
      backtrack(cursoIndex + 1, horarioActual);
    }

    // Iniciar Backtracking desde el curso más restrictivo
    backtrack(0, []);

    // Limpiar duplicados generados por combinaciones vacías
    const hashesVistos = new Set();
    const alternativasUnicas = [];
    for (const alt of todasLasAlternativas) {
      if (alt.length === 0) continue;
      const hash = alt.map(s => String(s._id)).sort().join('-');
      if (!hashesVistos.has(hash)) {
        hashesVistos.add(hash);
        alternativasUnicas.push(alt);
      }
    }

    // Evaluar y Puntuar (Soft Constraints de Optimización)
    alternativasUnicas.forEach(alt => {
      let score = alt.length * 1000; // Prioridad 1: Maximizar cantidad de cursos matriculados
      
      const cumpleTurno = alt.every(s => checkTurno(s, turno));
      if (cumpleTurno) score += 500; // Prioridad 2: Cumplir turno preferido

      const diasUnicos = countUniqueDays(alt);
      if (diasUnicos <= diasPorSemana) score += 200; // Prioridad 3: Respetar días libres
      
      // Minimizar días asistidos para evitar ir a la universidad por 1 sola clase
      score -= (diasUnicos * 50);

      alt._score = score;
      alt._cumpleTurno = cumpleTurno;
      alt._diasUnicos = diasUnicos;
    });

    // Ordenar alternativas de mayor a menor puntaje
    alternativasUnicas.sort((a, b) => b._score - a._score);
    
    // Retornar solo las top 5 opciones
    const mejoresAlternativas = alternativasUnicas.slice(0, 5);

    if (mejoresAlternativas.length === 0) {
       return res.json({ success: false, message: 'Imposible generar horario. Tus cursos obligatorios se cruzan en todos sus horarios.', alternativas: [] });
    }

    // Flag de éxito absoluto
    const isStrictSuccess = mejoresAlternativas[0].length === cursosAProcesar.length && mejoresAlternativas[0]._cumpleTurno && mejoresAlternativas[0]._diasUnicos <= diasPorSemana;

    const respuestaAlternativas = mejoresAlternativas.map((alt, i) => {
      let desc = '';
      if (alt.length === cursosAProcesar.length && alt._cumpleTurno && alt._diasUnicos <= diasPorSemana) {
        desc = `Alternativa ${i+1} (Óptima): Cumple al 100% tu configuración de Turno y Días. (${alt.length} cursos).`;
      } else {
        const turnosVistos = new Set(alt.map(s => {
          if (checkTurno(s, 'MAÑANA')) return 'Mañana';
          if (checkTurno(s, 'TARDE')) return 'Tarde';
          return 'Noche';
        }));
        desc = `Alternativa ${i+1}: Logra agrupar ${alt.length} cursos, requiere asistir en turnos ${Array.from(turnosVistos).join('/')} durante ${alt._diasUnicos} días de la semana.`;
      }

      const horarioGenerado = alt.map(s => ({
        curso: s.curso,
        seccion: { ...s, curso: s.curso._id }
      }));

      return { descripcion: desc, horarioGenerado };
    });

    res.json({
      success: isStrictSuccess,
      message: isStrictSuccess ? '¡Horario matemático óptimo generado de acuerdo a tus preferencias!' : 'No se pudo generar un horario perfecto a tus reglas, pero se calcularon estas combinaciones óptimas parciales:',
      alternativas: respuestaAlternativas
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al generar el horario');
  }
};

// ── Descarga del horario actual como PDF ─────────────────────────────────────
exports.downloadHorarioPDF = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const estudianteId = req.user.id;

    const estudiante = await User.findById(estudianteId).populate('carrera', 'nombre');
    const secciones = await Seccion.find({ estudiantesMatriculados: estudianteId })
      .populate('curso', 'nombre codigo creditos')
      .populate('docente', 'nombre apellidos');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="horario_${estudiante.nombre}_${estudiante.apellidos}.pdf"`);
    doc.pipe(res);

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill('#4f46e5');
    doc.fillColor('white')
      .fontSize(24).font('Helvetica-Bold')
      .text('SIMA — Horario Académico', 50, 25, { align: 'center' });
    doc.fontSize(12).font('Helvetica')
      .text(`${estudiante.nombre} ${estudiante.apellidos}  |  ${estudiante.carrera?.nombre || 'General'}  |  Ciclo ${estudiante.cicloActual}`, 50, 58, { align: 'center' });

    doc.moveDown(4);

    // ── Tabla de secciones ───────────────────────────────────────────────────
    const colWidths = [160, 70, 150, 75, 70];
    const headers = ['Curso', 'Sección', 'Horario', 'Aula', 'Créditos'];
    const startX = 50;
    let y = 110;

    // Cabecera de tabla
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 22).fill('#6366f1');
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((h, i) => {
      doc.text(h, x + 5, y + 6, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    y += 22;

    // Filas
    secciones.forEach((s, idx) => {
      const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 22).fill(bg);
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica');
      x = startX;
      const row = [
        s.curso?.nombre || '-',
        s.codigoSeccion || '-',
        s.horario || '-',
        s.aula || '-',
        String(s.curso?.creditos ?? '-')
      ];
      row.forEach((cell, i) => {
        doc.text(cell, x + 5, y + 7, { width: colWidths[i] - 8, align: 'left', lineBreak: false });
        x += colWidths[i];
      });
      y += 22;
    });

    // Total créditos
    const totalCr = secciones.reduce((acc, s) => acc + (s.curso?.creditos || 0), 0);
    doc.moveDown(1);
    doc.fillColor('#4f46e5').fontSize(11).font('Helvetica-Bold')
      .text(`Total de créditos matriculados: ${totalCr} CR`, startX, y + 10);

    // Pie
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
      .text(`Generado el ${new Date().toLocaleDateString('es-PE', { dateStyle: 'full' })}  —  Sistema SIMA`, 50, doc.page.height - 40, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send('Error al generar el PDF');
  }
};

// ── Export helpers for Testing ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'test') {
  exports._helpers = {
    checkOverlap,
    checkTurno,
    countUniqueDays,
    obtenerCostoRealCurso
  };
}
