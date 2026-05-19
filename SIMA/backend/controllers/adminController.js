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
  try {
    const estudiantes = await User.find({ rol: 'ESTUDIANTE' })
      .select('-password')
      .populate('carrera', 'nombre')
      .lean();
    res.json(estudiantes);
  } catch (error) { res.status(500).send('Error al obtener'); }
};

exports.importarEstudiantes = async (req, res) => {
  try {
    const { estudiantes } = req.body;
    if (!estudiantes || !Array.isArray(estudiantes)) {
      return res.status(400).json({ msg: 'Formato de importación inválido' });
    }

    // Obtener todas las carreras para mapear nombre -> id
    const carreras = await Carrera.find({});
    const carreraMap = {};
    carreras.forEach(c => {
      carreraMap[c.nombre.toLowerCase().trim()] = c._id;
    });

    let creados = 0;
    let duplicados = 0;
    let sinCarrera = 0;
    const errores = [];

    // Precalcular el hash de la contraseña por defecto para optimizar el tiempo de ejecución (bcrypt es muy costoso)
    const defaultPasswordHash = await bcrypt.hash('sima12345', 10);

    // Obtener todos los emails existentes para búsqueda ultra rápida en memoria O(1)
    const todosEmails = await User.find({}).select('email');
    const emailSet = new Set(todosEmails.map(u => u.email.toLowerCase().trim()));

    const aInsertar = [];

    for (const est of estudiantes) {
      const email = String(est.email || '').toLowerCase().trim();
      if (!email) continue;

      if (emailSet.has(email)) {
        duplicados++;
        continue;
      }

      // Nombre y apellidos
      const nombre = String(est.nombre || '').trim();
      const apellidos = String(est.apellidos || '').trim();
      if (!nombre || !apellidos) {
        errores.push(`El alumno con email "${email}" no contiene nombre o apellidos válidos.`);
        continue;
      }

      // Buscar carrera por coincidencia flexible (exacta o parcial)
      const carreraNombre = String(est.carrera || '').toLowerCase().trim();
      let carreraId = null;
      if (carreraNombre) {
        carreraId = carreraMap[carreraNombre];
        if (!carreraId) {
          // Intentar coincidencia parcial
          const matchedKey = Object.keys(carreraMap).find(key => key.includes(carreraNombre) || carreraNombre.includes(key));
          if (matchedKey) {
            carreraId = carreraMap[matchedKey];
          }
        }
      }

      if (!carreraId) {
        sinCarrera++;
        errores.push(`Carrera no encontrada: "${est.carrera}" (Alumno: ${nombre} ${apellidos})`);
        continue;
      }

      const cicloActual = parseInt(est.cicloActual || est.ciclo || 1) || 1;

      // Hash de la contraseña
      let passwordHash = defaultPasswordHash;
      if (est.password && String(est.password).trim() !== '') {
        passwordHash = await bcrypt.hash(String(est.password).trim(), 10);
      }

      aInsertar.push({
        nombre,
        apellidos,
        email,
        password: passwordHash,
        rol: 'ESTUDIANTE',
        carrera: carreraId,
        cicloActual
      });

      // Añadir al set para evitar duplicados en el mismo lote
      emailSet.add(email);
    }

    if (aInsertar.length > 0) {
      await User.insertMany(aInsertar);
      creados = aInsertar.length;
    }

    res.json({
      exito: true,
      creados,
      duplicados,
      sinCarrera,
      erroresCount: errores.length,
      errores: errores.slice(0, 50) // Retornar máximo 50 para no sobrecargar
    });

  } catch (error) {
    console.error('Error en importarEstudiantes:', error);
    res.status(500).send('Error en el servidor al realizar la importación masiva');
  }
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
  try {
    const docentes = await User.find({ rol: 'DOCENTE' })
      .select('-password')
      .populate('carrerasEnsenadas', 'nombre')
      .lean();
    res.json(docentes);
  } catch (error) { res.status(500).send('Error al obtener'); }
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
  try {
    const existe = await Curso.findOne({ codigo: req.body.codigo });
    if (existe) return res.status(400).json({ msg: `El código "${req.body.codigo}" ya está en uso.` });
    const curso = await new Curso(req.body).save();
    res.json(await Curso.findById(curso._id).populate('carrera', 'nombre'));
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear el curso', detail: error.message });
  }
};

exports.getCursos = async (req, res) => {
  try {
    const { carreraId } = req.query;
    const filtro = carreraId ? { carrera: carreraId } : {};
    const cursos = await Curso.find(filtro)
      .populate('carrera', 'nombre')
      .sort({ ciclo: 1, nombre: 1 })
      .lean();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener cursos' });
  }
};

exports.updateCurso = async (req, res) => {
  try {
    const curso = await Curso.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate('carrera', 'nombre');
    if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });
    res.json(curso);
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar', detail: error.message });
  }
};

exports.deleteCurso = async (req, res) => {
  try {
    const secciones = await Seccion.findOne({ curso: req.params.id });
    if (secciones) return res.status(400).json({ msg: 'No se puede eliminar: el curso tiene salones abiertos.' });
    await Curso.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Curso eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar' });
  }
};

// === SECCIONES ===
exports.createSeccion = async (req, res) => {
  try { res.json(await new Seccion(req.body).save()); } catch (error) { res.status(500).send('Error al crear'); }
};

exports.getSecciones = async (req, res) => {
  try {
    const secciones = await Seccion.find()
      .populate('curso', 'nombre codigo')
      .populate('docente', 'nombre apellidos')
      .lean();
    res.json(secciones);
  } catch (error) { res.status(500).send('Error al obtener'); }
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
