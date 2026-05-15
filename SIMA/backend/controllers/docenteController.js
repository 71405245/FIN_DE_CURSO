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

    // Crear nueva
    calificacion = new Calificacion({
      estudiante: estudianteId,
      seccion: seccionId,
      docente: docenteId,
      nota,
      comentarios
    });

    await calificacion.save();
    res.json({ msg: 'Calificación registrada', calificacion });
  } catch (err) {
    res.status(500).send('Error al registrar calificación');
  }
};
