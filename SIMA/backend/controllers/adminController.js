const User = require('../models/User');
const Curso = require('../models/Curso');
const Seccion = require('../models/Seccion');
const Carrera = require('../models/Carrera');
const bcrypt = require('bcryptjs');
const os = require('os');

// [OPTIMIZACIÓN 7] Caché en memoria para recursos del sistema
let recursosCache = null;
let recursosCacheTime = 0;
const RECURSOS_CACHE_TTL = 2000; // 2 segundos TTL

// === ENDPOINT CONSOLIDADO DE ESTADÍSTICAS ===
// [OPTIMIZACIÓN 1 + 6] Un solo endpoint en vez de 5 — usa countDocuments() en vez de cargar colecciones enteras
exports.getStatsCounts = async (req, res) => {
  try {
    const [carreras, cursos, alumnos, docentes, secciones] = await Promise.all([
      Carrera.countDocuments(),
      Curso.countDocuments(),
      User.countDocuments({ rol: 'ESTUDIANTE' }),
      User.countDocuments({ rol: 'DOCENTE' }),
      Seccion.countDocuments()
    ]);

    // [OPTIMIZACIÓN 7] Cache-Control: los conteos no cambian cada segundo
    res.set('Cache-Control', 'private, max-age=30');
    res.json({ carreras, cursos, alumnos, docentes, secciones });
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener estadísticas' });
  }
};

// === RECURSOS DEL SISTEMA ===
// [OPTIMIZACIÓN 8 + 9 GREEN CODE] Lectura eficiente del buffer circular + caché
exports.getRecursos = async (req, res) => {
  try {
    const now = Date.now();

    // [GREEN CODE] Si el cliente envía If-Modified-Since y los datos no cambiaron, retornar 304
    const sinceHeader = req.headers['if-modified-since'];
    if (sinceHeader && recursosCache && (now - recursosCacheTime) < RECURSOS_CACHE_TTL) {
      return res.status(304).end();
    }

    // Reutilizar caché si aún es válido
    if (recursosCache && (now - recursosCacheTime) < RECURSOS_CACHE_TTL) {
      res.set('Cache-Control', 'private, max-age=2');
      res.set('Last-Modified', new Date(recursosCacheTime).toUTCString());
      return res.json(recursosCache);
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const cpuInfo = os.cpus();
    const cpuModel = cpuInfo.length > 0 ? cpuInfo[0].model : 'Desconocido';
    
    // [OPTIMIZACIÓN 8] Leer métricas del buffer circular eficientemente
    const metrics = [];
    const count = global.apiMetricsCount || 0;
    const buffer = global.apiMetrics || [];
    const bufSize = buffer.length;
    const idx = global.apiMetricsIndex || 0;

    for (let i = 0; i < count; i++) {
      const pos = (idx - count + i + bufSize) % bufSize;
      if (buffer[pos]) metrics.push(buffer[pos]);
    }
    
    // Top Rutas Más Frecuentes
    const frequencyMap = {};
    metrics.forEach(m => {
      const key = `${m.method} ${m.route}`;
      frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    });
    const topRutas = Object.entries(frequencyMap)
      .map(([ruta, count]) => ({ ruta, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Consultas Más Lentas (ordenadas por duración)
    const lentas = [...metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(m => ({
        ruta: `${m.method} ${m.route}`,
        duracion: m.duration,
        time: m.time
      }));

    // [GREEN CODE] Métricas de eficiencia energética
    const avgResponseTime = metrics.length > 0 
      ? Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length) 
      : 0;
    
    const requestsPerMinute = metrics.length > 0 
      ? (() => {
          const oldest = metrics[0]?.time ? new Date(metrics[0].time).getTime() : now;
          const elapsed = Math.max((now - oldest) / 60000, 1);
          return Math.round(metrics.length / elapsed);
        })()
      : 0;

    const resultado = {
      uptime: os.uptime(),
      platform: os.platform(),
      architecture: os.arch(),
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usedPercentage: ((usedMem / totalMem) * 100).toFixed(2)
      },
      cpu: {
        cores: cpuInfo.length,
        model: cpuModel,
        speed: cpuInfo.length > 0 ? cpuInfo[0].speed : 0
      },
      apm: {
        topRutas,
        topLentas: lentas,
        totalRequests: count
      },
      // [GREEN CODE] Métricas de sostenibilidad
      greenMetrics: {
        avgResponseTime,
        requestsPerMinute,
        cacheHitRate: recursosCache ? 'active' : 'cold',
        bufferEfficiency: `${count}/${bufSize} slots`,
        pollInterval: 15,
        compressionEnabled: true
      }
    };

    // Actualizar caché
    recursosCache = resultado;
    recursosCacheTime = now;

    res.set('Cache-Control', 'private, max-age=2');
    res.set('Last-Modified', new Date(now).toUTCString());
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener recursos del sistema' });
  }
};
// === IMPACTO AMBIENTAL (Environmental Impact Dashboard) ===
// Factor: Sustainable Web Design Model 2023 — 0.0000000318 g CO₂/byte
const CO2_G_PER_BYTE = 0.0000000318;

exports.getEnvironmentalImpact = (req, res) => {
  try {
    const count  = global.apiMetricsCount || 0;
    const buffer = global.apiMetrics     || [];
    const bufSize = buffer.length;
    const idx    = global.apiMetricsIndex || 0;

    // Leer buffer circular en orden cronológico (más reciente al final)
    const requests = [];
    for (let i = 0; i < count; i++) {
      const pos = (idx - count + i + bufSize) % bufSize;
      if (buffer[pos]) requests.push(buffer[pos]);
    }

    // CO₂ en mg por petición
    const withCo2 = requests.map(r => ({
      time:            r.time,
      method:          r.method,
      route:           r.route,
      status:          r.status,
      duration:        r.duration,
      bytes:           r.bytes,           // JSON crudo pre-GZIP
      compressedBytes: r.compressedBytes, // bytes enviados al cliente
      encoding:        r.encoding || 'identity',
      co2mg:           parseFloat((r.compressedBytes * CO2_G_PER_BYTE * 1000).toFixed(7))
    }));

    // Totales
    const totalRequests  = withCo2.length;
    const totalCo2g      = withCo2.reduce((s, r) => s + r.co2mg * 0.001, 0); // mg → g
    const avgCo2g        = totalRequests > 0 ? totalCo2g / totalRequests : 0;

    // Peor endpoint por CO₂ total acumulado por ruta
    const byRoute = {};
    withCo2.forEach(r => {
      const key = `${r.method} ${r.route}`;
      if (!byRoute[key]) byRoute[key] = { route: key, totalCo2mg: 0, count: 0 };
      byRoute[key].totalCo2mg += r.co2mg;
      byRoute[key].count++;
    });
    const worstEndpoint = Object.values(byRoute)
      .sort((a, b) => b.totalCo2mg - a.totalCo2mg)[0]?.route || '-';
    const mostUsed = Object.values(byRoute)
      .sort((a, b) => b.count - a.count)[0]?.route || '-';

    res.json({
      totalRequests,
      totalCo2g:    parseFloat(totalCo2g.toFixed(7)),
      avgCo2g:      parseFloat(avgCo2g.toFixed(7)),
      worstEndpoint,
      mostUsed,
      requests:     [...withCo2].reverse() // Más reciente primero
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener impacto ambiental' });
  }
};

// === CARRERAS ===
exports.createCarrera = async (req, res) => {
  try {
    const carrera = await new Carrera(req.body).save();
    res.json(carrera);
  } catch (error) { res.status(500).send('Error al crear carrera'); }
};

exports.getCarreras = async (req, res) => {
  try {
    // [OPTIMIZACIÓN 7] Las carreras cambian raramente — cachear 60s
    res.set('Cache-Control', 'private, max-age=60');
    res.json(await Carrera.find().lean());
  } catch (error) { res.status(500).send('Error al obtener'); }
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

// [OPTIMIZACIÓN 1 + 2] Paginación server-side + proyección selectiva
exports.getEstudiantes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0; // 0 = sin límite (backward compatible)
    const skip = limit > 0 ? (page - 1) * limit : 0;

    let query = User.find({ rol: 'ESTUDIANTE' })
      .select('-password')
      .populate('carrera', 'nombre')
      .lean();

    if (limit > 0) {
      const total = await User.countDocuments({ rol: 'ESTUDIANTE' });
      const estudiantes = await query.skip(skip).limit(limit);
      return res.json({ data: estudiantes, total, page, totalPages: Math.ceil(total / limit) });
    }

    // Sin paginación (backward compatible para otros consumers)
    const estudiantes = await query;
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
    const { email, password, nombre, apellidos, carrerasEnsenadas, turnoDisponibilidad } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'El usuario ya existe' });
    const user = new User({ nombre, apellidos, email, password, rol: 'DOCENTE', carrerasEnsenadas, turnoDisponibilidad });
    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    res.json(await user.save());
  } catch (error) { res.status(500).send('Error al crear docente'); }
};

// [OPTIMIZACIÓN 1 + 2] Paginación server-side para docentes
exports.getDocentes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    let query = User.find({ rol: 'DOCENTE' })
      .select('-password')
      .populate('carrerasEnsenadas', 'nombre')
      .lean();

    if (limit > 0) {
      const total = await User.countDocuments({ rol: 'DOCENTE' });
      const docentes = await query.skip(skip).limit(limit);
      return res.json({ data: docentes, total, page, totalPages: Math.ceil(total / limit) });
    }

    const docentes = await query;
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

// [OPTIMIZACIÓN 1 + 7] Cursos con caché + .lean()
exports.getCursos = async (req, res) => {
  try {
    const { carreraId } = req.query;
    const filtro = carreraId ? { carrera: carreraId } : {};
    const cursos = await Curso.find(filtro)
      .populate('carrera', 'nombre')
      .sort({ ciclo: 1, nombre: 1 })
      .lean();
    // [OPTIMIZACIÓN 7] Cache-Control para cursos
    res.set('Cache-Control', 'private, max-age=30');
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

// [OPTIMIZACIÓN 1] Secciones con proyección optimizada — no enviar array completo de estudiantesMatriculados
exports.getSecciones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    let query = Seccion.find()
      .populate('curso', 'nombre codigo')
      .populate('docente', 'nombre apellidos')
      .lean();

    if (limit > 0) {
      const total = await Seccion.countDocuments();
      const secciones = await query.skip(skip).limit(limit);
      const seccionesOpt = secciones.map(s => ({
        ...s,
        estudiantesMatriculadosCount: s.estudiantesMatriculados?.length || 0,
        estudiantesMatriculados: undefined
      }));
      return res.json({ data: seccionesOpt, total, page, totalPages: Math.ceil(total / limit) });
    }

    const secciones = await query;
    const seccionesOpt = secciones.map(s => ({
      ...s,
      estudiantesMatriculadosCount: s.estudiantesMatriculados?.length || 0,
      estudiantesMatriculados: undefined
    }));
    res.json(seccionesOpt);
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
