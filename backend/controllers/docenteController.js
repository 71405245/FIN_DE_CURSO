const asyncWrapper = require('../middleware/asyncWrapper');
const Seccion = require('../models/Seccion');
const Calificacion = require('../models/Calificacion');
exports.misSecciones = asyncWrapper(async (req, res) => {
  const docenteId = req.user.id;
  // Buscar secciones donde el docente asignado es este usuario
  const secciones = await Seccion.find({
    docente: docenteId
  }).populate({
    path: 'curso',
    select: 'nombre codigo carrera',
    populate: {
      path: 'carrera',
      select: 'nombre'
    }
  }).populate('estudiantesMatriculados', 'nombre apellidos email').lean();
  res.json(secciones);
});
exports.calificar = asyncWrapper(async (req, res) => {
  const {
    estudianteId,
    seccionId,
    nota,
    comentarios
  } = req.body;
  const docenteId = req.user.id;

  // Validar nota
  const notaNum = Number(nota);
  if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
    return res.status(400).json({
      msg: 'La nota debe ser un número entre 0 y 20.'
    });
  }

  // Obtener la sección para extraer el curso
  const seccion = await Seccion.findById(seccionId);
  if (!seccion) {
    return res.status(404).json({
      msg: 'Sección no encontrada'
    });
  }
  if (!seccion.curso) {
    return res.status(400).json({
      msg: 'Esta sección está corrupta (no tiene curso asociado).'
    });
  }

  // Verificar si ya existe una calificación
  let calificacion = await Calificacion.findOne({
    estudiante: estudianteId,
    seccion: seccionId
  });
  if (calificacion) {
    // Actualizar
    calificacion.nota = notaNum;
    calificacion.comentarios = comentarios || '';
    calificacion.docente = docenteId; // Actualizar quién la modificó
    await calificacion.save();
    return res.json({
      msg: 'Calificación actualizada',
      calificacion
    });
  }

  // Crear nueva
  calificacion = new Calificacion({
    estudiante: estudianteId,
    seccion: seccionId,
    curso: seccion.curso,
    docente: docenteId,
    nota: notaNum,
    comentarios: comentarios || ''
  });
  await calificacion.save();
  res.json({
    msg: 'Calificación registrada',
    calificacion
  });
});
exports.getCalificacionesSeccion = asyncWrapper(async (req, res) => {
  const {
    seccionId
  } = req.params;
  const calificaciones = await Calificacion.find({
    seccion: seccionId
  }).lean();
  res.json(calificaciones);
});