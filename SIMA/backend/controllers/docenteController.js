const Seccion = require('../models/Seccion');
const Calificacion = require('../models/Calificacion');

exports.misSecciones = async (req, res) => {
  try {
    const docenteId = req.user.id;
    // Buscar secciones donde el docente asignado es este usuario
    const secciones = await Seccion.find({ docente: docenteId })
      .populate('curso', 'nombre codigo')
      .populate('estudiantesMatriculados', 'nombre apellidos email');
    res.json(secciones);
  } catch (err) {
    res.status(500).send('Error en el servidor');
  }
};

exports.calificar = async (req, res) => {
  try {
    const { estudianteId, seccionId, nota, comentarios } = req.body;
    const docenteId = req.user.id;

    // Verificar si ya existe una calificación
    let calificacion = await Calificacion.findOne({ estudiante: estudianteId, seccion: seccionId });

    if (calificacion) {
      // Actualizar
      calificacion.nota = nota;
      calificacion.comentarios = comentarios;
      await calificacion.save();
      return res.json({ msg: 'Calificación actualizada', calificacion });
    }

    // Obtener la sección para extraer el curso obligatorio
    const seccion = await Seccion.findById(seccionId);
    if (!seccion) {
      return res.status(404).json({ msg: 'Sección no encontrada' });
    }

    // Crear nueva
    calificacion = new Calificacion({
      estudiante: estudianteId,
      seccion: seccionId,
      curso: seccion.curso,
      docente: docenteId,
      nota,
      comentarios
    });

    await calificacion.save();
    res.json({ msg: 'Calificación registrada', calificacion });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al registrar calificación');
  }
};

exports.getCalificacionesSeccion = async (req, res) => {
  try {
    const { seccionId } = req.params;
    const calificaciones = await Calificacion.find({ seccion: seccionId });
    res.json(calificaciones);
  } catch (err) {
    res.status(500).send('Error al obtener calificaciones');
  }
};
