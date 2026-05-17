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
      .populate('docente', 'nombre apellidos');

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
      .populate('docente', 'nombre apellidos');
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

    let creditosAprobados = 0;
    let haJaladoCursos = false;

    calificaciones.forEach(c => {
      if (c.aprobado) {
        creditosAprobados += c.curso?.creditos || 0;
      } else {
        haJaladoCursos = true;
      }
    });

    // 2. Obtener créditos matriculados actuales
    const misSecciones = await Seccion.find({ estudiantesMatriculados: estudianteId }).populate('curso', 'creditos');
    let creditosMatriculados = 0;
    misSecciones.forEach(s => {
      creditosMatriculados += s.curso?.creditos || 0;
    });

    // 3. Determinar si tiene restricción de créditos (15 CR si ha jalado, 22 CR normal)
    const esRestringido = haJaladoCursos;
    const limiteCreditos = esRestringido ? 15 : 22;

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
      .sort({ ciclo: 1, nombre: 1 });

    // Calificaciones para saber cuáles están aprobados/jalados
    const calificaciones = await Calificacion.find({ estudiante: estudianteId });
    const calMap = {};
    calificaciones.forEach(c => {
      calMap[String(c.curso)] = { nota: c.nota, aprobado: c.aprobado };
    });

    // Secciones matriculadas actualmente
    const seccionesActuales = await Seccion.find({ estudiantesMatriculados: estudianteId }).select('curso');
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
      .populate('curso', 'nombre codigo creditos ciclo');

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

// ── Generador de Horario "IA" (heurístico inteligente) ────────────────────────
exports.generarHorarioIA = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    const { diasLibre = [], horariosPreferidos = [] } = req.body;

    const estudiante = await User.findById(estudianteId);
    if (!estudiante) return res.status(404).json({ msg: 'Estudiante no encontrado' });

    // 1. Cursos pendientes del ciclo actual (no aprobados, no matriculados aún)
    const cursosCiclo = await Curso.find({ carrera: estudiante.carrera, ciclo: estudiante.cicloActual });
    const calificaciones = await Calificacion.find({ estudiante: estudianteId, aprobado: true }).select('curso');
    const aprobadosSet = new Set(calificaciones.map(c => String(c.curso)));

    const seccionesActuales = await Seccion.find({ estudiantesMatriculados: estudianteId }).select('curso');
    const matriculadosSet = new Set(seccionesActuales.map(s => String(s.curso)));

    const cursosPendientes = cursosCiclo.filter(c =>
      !aprobadosSet.has(String(c._id)) && !matriculadosSet.has(String(c._id))
    );

    // 2. Para cada curso pendiente, buscar la mejor sección
    const horarioGenerado = [];
    const bloqueados = new Set(); // "Lunes-07:00" para evitar colisiones

    for (const curso of cursosPendientes) {
      // Secciones disponibles del curso con cupo
      const secciones = await Seccion.find({ curso: curso._id })
        .populate('docente', 'nombre apellidos')
        .lean();

      const disponibles = secciones.filter(s =>
        s.estudiantesMatriculados.length < s.cupoMaximo &&
        !diasLibre.includes(s.dias[0])
      );
      if (disponibles.length === 0) continue;

      // Priorizar bloques en horarios preferidos
      let elegida = null;
      if (horariosPreferidos.length > 0) {
        elegida = disponibles.find(s =>
          horariosPreferidos.some(h => s.horaInicio >= h.split('-')[0] && s.horaInicio < h.split('-')[1])
          && !bloqueados.has(`${s.dias[0]}-${s.horaInicio}`)
        );
      }
      if (!elegida) {
        elegida = disponibles.find(s => !bloqueados.has(`${s.dias[0]}-${s.horaInicio}`));
      }
      if (!elegida) continue;

      // Bloquear el slot para evitar colisión
      elegida.dias.forEach(d => bloqueados.add(`${d}-${elegida.horaInicio}`));

      horarioGenerado.push({
        curso: { _id: curso._id, nombre: curso.nombre, creditos: curso.creditos },
        seccion: {
          _id: elegida._id,
          codigoSeccion: elegida.codigoSeccion,
          horario: elegida.horario,
          dias: elegida.dias,
          horaInicio: elegida.horaInicio,
          horaFin: elegida.horaFin,
          aula: elegida.aula,
          docente: elegida.docente
        }
      });
    }

    res.json({ horarioGenerado, totalSugeridas: horarioGenerado.length });
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
