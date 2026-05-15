const User = require('../models/User');
const Curso = require('../models/Curso');
const Seccion = require('../models/Seccion');
const Carrera = require('../models/Carrera');
const bcrypt = require('bcryptjs');

// === CARRERAS ===
exports.createCarrera = async (req, res) => {
  try {
    const carrera = await new Carrera(req.body).save();
    res.json(carrera);
  } catch (error) { res.status(500).send('Error al crear carrera'); }
};

exports.getCarreras = async (req, res) => {
  try { res.json(await Carrera.find()); } catch (error) { res.status(500).send('Error al obtener'); }
};

exports.updateCarrera = async (req, res) => {
  try {
    const carrera = await Carrera.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(carrera);
  } catch (error) { res.status(500).send('Error al actualizar'); }
};

exports.deleteCarrera = async (req, res) => {
  try {
    const cursos = await Curso.findOne({ carrera: req.params.id });
    const alumnos = await User.findOne({ carrera: req.params.id });
    if (cursos || alumnos) return res.status(400).json({ msg: 'No se puede eliminar la carrera porque tiene cursos o alumnos asignados.' });
    await Carrera.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Carrera eliminada' });
  } catch (error) { res.status(500).send('Error al eliminar'); }
};

// === ESTUDIANTES ===
exports.createEstudiante = async (req, res) => {
  try {
    const { email, password, nombre, apellidos, carrera, cicloActual } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'El usuario ya existe' });
    const user = new User({ nombre, apellidos, email, password, rol: 'ESTUDIANTE', carrera, cicloActual });
    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    res.json(await user.save());
  } catch (error) { res.status(500).send('Error al crear estudiante'); }
};

exports.getEstudiantes = async (req, res) => {
  try { res.json(await User.find({ rol: 'ESTUDIANTE' }).select('-password').populate('carrera', 'nombre')); } catch (error) { res.status(500).send('Error al obtener'); }
};

exports.updateEstudiante = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
    } else {
      delete req.body.password;
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) { res.status(500).send('Error al actualizar'); }
};

exports.deleteEstudiante = async (req, res) => {
  try {
    // Buscar si está matriculado en alguna sección
    const secciones = await Seccion.findOne({ estudiantesMatriculados: req.params.id });
    if (secciones) return res.status(400).json({ msg: 'No se puede eliminar: el alumno está matriculado en un salón.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Estudiante eliminado' });
  } catch (error) { res.status(500).send('Error al eliminar'); }
};

// === DOCENTES ===
exports.createDocente = async (req, res) => {
  try {
    const { email, password, nombre, apellidos, carrerasEnsenadas } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'El usuario ya existe' });
    const user = new User({ nombre, apellidos, email, password, rol: 'DOCENTE', carrerasEnsenadas });
    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    res.json(await user.save());
  } catch (error) { res.status(500).send('Error al crear docente'); }
};

exports.getDocentes = async (req, res) => {
  try { res.json(await User.find({ rol: 'DOCENTE' }).select('-password').populate('carrerasEnsenadas', 'nombre')); } catch (error) { res.status(500).send('Error al obtener'); }
};

exports.updateDocente = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
    } else {
      delete req.body.password;
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('carrerasEnsenadas', 'nombre');
    res.json(user);
  } catch (error) { res.status(500).send('Error al actualizar'); }
};

exports.deleteDocente = async (req, res) => {
  try {
    const secciones = await Seccion.findOne({ docente: req.params.id });
    if (secciones) return res.status(400).json({ msg: 'No se puede eliminar: el docente tiene secciones asignadas.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Docente eliminado' });
  } catch (error) { res.status(500).send('Error al eliminar'); }
};

// === CURSOS ===
exports.createCurso = async (req, res) => {
  try { res.json(await new Curso(req.body).save()); } catch (error) { res.status(500).send('Error al crear'); }
};

exports.getCursos = async (req, res) => {
  try { res.json(await Curso.find().populate('carrera', 'nombre')); } catch (error) { res.status(500).send('Error al obtener'); }
};

exports.updateCurso = async (req, res) => {
  try { res.json(await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (error) { res.status(500).send('Error al actualizar'); }
};

exports.deleteCurso = async (req, res) => {
  try {
    const secciones = await Seccion.findOne({ curso: req.params.id });
    if (secciones) return res.status(400).json({ msg: 'No se puede eliminar: el curso tiene salones abiertos.' });
    await Curso.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Curso eliminado' });
  } catch (error) { res.status(500).send('Error al eliminar'); }
};

// === SECCIONES ===
exports.createSeccion = async (req, res) => {
  try { res.json(await new Seccion(req.body).save()); } catch (error) { res.status(500).send('Error al crear'); }
};

exports.getSecciones = async (req, res) => {
  try { res.json(await Seccion.find().populate('curso', 'nombre codigo').populate('docente', 'nombre apellidos')); } catch (error) { res.status(500).send('Error al obtener'); }
};

exports.updateSeccion = async (req, res) => {
  try { res.json(await Seccion.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (error) { res.status(500).send('Error al actualizar'); }
};

exports.deleteSeccion = async (req, res) => {
  try {
    const seccion = await Seccion.findById(req.params.id);
    if (seccion && seccion.estudiantesMatriculados.length > 0) {
      return res.status(400).json({ msg: 'No se puede eliminar: el salón ya tiene estudiantes matriculados.' });
    }
    await Seccion.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Sección eliminada' });
  } catch (error) { res.status(500).send('Error al eliminar'); }
};
