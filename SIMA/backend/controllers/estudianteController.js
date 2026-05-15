const User = require('../models/User');
const Curso = require('../models/Curso');
const Seccion = require('../models/Seccion');

exports.getSeccionesDisponibles = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    const estudiante = await User.findById(estudianteId);

    if (!estudiante || estudiante.rol !== 'ESTUDIANTE') {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // Buscar cursos que coincidan con la carrera y ciclo del estudiante
    const cursos = await Curso.find({ 
      carrera: estudiante.carrera,
      ciclo: estudiante.cicloActual 
    });
    const cursosIds = cursos.map(c => c._id);

    // Buscar secciones de esos cursos
    let secciones = await Seccion.find({ curso: { $in: cursosIds } })
      .populate('curso', 'nombre codigo creditos ciclo')
      .populate('docente', 'nombre apellidos');

    // Filtrar secciones que aún tengan cupo (y donde el estudiante no esté ya matriculado)
    secciones = secciones.filter(s => {
      const isEnrolled = s.estudiantesMatriculados.includes(estudianteId);
      const hasSpace = s.estudiantesMatriculados.length < s.cupoMaximo;
      return !isEnrolled && hasSpace;
    });

    res.json(secciones);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};

exports.misSecciones = async (req, res) => {
  try {
    const secciones = await Seccion.find({ estudiantesMatriculados: req.user.id })
      .populate('curso', 'nombre codigo')
      .populate('docente', 'nombre apellidos');
    res.json(secciones);
  } catch (err) {
    res.status(500).send('Error en el servidor');
  }
};

exports.matricular = async (req, res) => {
  try {
    const { seccionId } = req.body;
    const estudianteId = req.user.id;

    const seccion = await Seccion.findById(seccionId);
    if (!seccion) return res.status(404).json({ msg: 'Sección no encontrada' });

    // Validar cupos
    if (seccion.estudiantesMatriculados.length >= seccion.cupoMaximo) {
      return res.status(400).json({ msg: 'El salón no tiene cupos disponibles (máximo alcanzado)' });
    }

    // Validar si ya está matriculado
    if (seccion.estudiantesMatriculados.includes(estudianteId)) {
      return res.status(400).json({ msg: 'Ya estás matriculado en esta sección' });
    }

    // Inscribir
    seccion.estudiantesMatriculados.push(estudianteId);
    await seccion.save();

    res.json({ msg: 'Matrícula exitosa', seccion });
  } catch (err) {
    res.status(500).send('Error en el servidor');
  }
};
