require('dotenv').config();
const mongoose = require('mongoose');
const Curso = require('./models/Curso');
const User = require('./models/User');
const Seccion = require('./models/Seccion');
const Carrera = require('./models/Carrera');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');

const CATEGORIAS = [
  { id: 'MATEMATICA', keywords: ['matemática', 'cálculo', 'estadística', 'geometría', 'algebra', 'física', 'numérico', 'ecuaciones'] },
  { id: 'CIENCIAS_SOCIALES', keywords: ['historia', 'filosofía', 'psicología', 'sociología', 'ética', 'humanidades', 'derecho', 'legislación', 'constitucional', 'penal', 'civil'] },
  { id: 'LETRAS_IDIOMAS', keywords: ['comunicación', 'lenguaje', 'textos', 'inglés', 'english', 'redacción'] },
  { id: 'INGENIERIA_CIVIL', keywords: ['civil', 'construcción', 'estructural', 'topografía', 'suelos', 'pavimentos', 'hidráulica', 'concreto', 'edificaciones', 'caminos'] },
  { id: 'SISTEMAS_INFORMATICA', keywords: ['sistemas', 'programación', 'software', 'datos', 'computación', 'algoritmos', 'redes', 'inteligencia artificial', 'base de datos', 'informática'] },
  { id: 'ARQUITECTURA', keywords: ['arquitectura', 'diseño', 'urbanismo', 'dibujo', 'espacial', 'estructuras arquitectónicas'] },
  { id: 'ADMINISTRACION_GESTION', keywords: ['administración', 'economía', 'finanzas', 'marketing', 'negocios', 'contabilidad', 'gestión', 'proyectos', 'innovación', 'liderazgo'] },
  { id: 'GENERAL', keywords: [] }
];

function categorizarCurso(nombre) {
  const n = nombre.toLowerCase();
  for (const cat of CATEGORIAS) {
    if (cat.keywords.some(k => n.includes(k))) return cat.id;
  }
  return 'GENERAL';
}

function checkOverlap(s1, s2) {
  if (!s1.dias || !s2.dias || s1.dias.length === 0 || s2.dias.length === 0) return false;
  const commonDays = s1.dias.filter(d => s2.dias.includes(d));
  if (commonDays.length === 0) return false;
  if (!s1.horaInicio || !s2.horaInicio || !s1.horaFin || !s2.horaFin) return false;
  return (s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin);
}

async function run() {
  console.log(">> Iniciando reasignación de docentes...");

  const cursos = await Curso.find().lean();
  const docentes = await User.find({ rol: 'DOCENTE' }).lean();
  const secciones = await Seccion.find().populate('curso').lean();

  console.log(`- Encontrados ${cursos.length} cursos, ${docentes.length} docentes y ${secciones.length} secciones.`);

  // 1. Categorizar todos los cursos
  const cursoCategoria = {};
  cursos.forEach(c => {
    cursoCategoria[c._id] = categorizarCurso(c.nombre);
  });

  // 2. Repartir especialidades a los docentes de manera equitativa
  const docenteEspecialidad = {};
  const especialidadesDisponibles = CATEGORIAS.map(c => c.id);
  docentes.forEach((d, index) => {
    // Round-robin assignment of specialties to teachers
    const esp = especialidadesDisponibles[index % especialidadesDisponibles.length];
    docenteEspecialidad[d._id] = esp;
  });

  // Contador para saber cuantos hay por especialidad
  const counts = {};
  Object.values(docenteEspecialidad).forEach(e => {
    counts[e] = (counts[e] || 0) + 1;
  });
  console.log("- Profesores repartidos por especialidad:", counts);

  // 3. Reasignar secciones asegurando no colisiones
  let reasignados = 0;
  let errores = 0;

  // Mapa para trackear el horario actual de cada docente { docenteId: [seccion1, seccion2...] }
  const horarioDocentes = {};
  docentes.forEach(d => horarioDocentes[d._id] = []);

  for (const seccion of secciones) {
    const cursoId = seccion.curso._id;
    const cat = cursoCategoria[cursoId];

    // Buscar todos los docentes que tengan esta especialidad
    const docentesEspecialidad = docentes.filter(d => docenteEspecialidad[d._id] === cat);
    
    // Fallback: si no hay, usar a cualquiera de GENERAL, si no, a cualquiera
    let candidatos = docentesEspecialidad;
    if (candidatos.length === 0) candidatos = docentes.filter(d => docenteEspecialidad[d._id] === 'GENERAL');
    if (candidatos.length === 0) candidatos = docentes;

    // Buscar el primero que no tenga cruce de horario
    let docenteAsignado = null;

    // Mezclar candidatos para balancear carga
    candidatos.sort(() => Math.random() - 0.5);

    for (const doc of candidatos) {
      const horarioActual = horarioDocentes[doc._id];
      let cruza = false;
      for (const asig of horarioActual) {
        if (checkOverlap(seccion, asig)) {
          cruza = true;
          break;
        }
      }
      if (!cruza) {
        docenteAsignado = doc;
        break;
      }
    }

    if (docenteAsignado) {
      // Registrar la sección en el horario del docente para evitar cruces futuros
      horarioDocentes[docenteAsignado._id].push(seccion);
      
      // Actualizar la DB
      await Seccion.updateOne({ _id: seccion._id }, { $set: { docente: docenteAsignado._id } });
      reasignados++;
    } else {
      console.log(`[!] Imposible encontrar docente libre sin cruces para la seccion ${seccion.codigoSeccion} del curso ${seccion.curso.nombre} (${seccion.horario})`);
      errores++;
    }
  }

  console.log(`\n>> ¡Reasignación Completada!`);
  console.log(`- Secciones Reasignadas con Éxito: ${reasignados}`);
  console.log(`- Secciones sin Docente Posible (Cruce Total): ${errores}`);
  
  process.exit(0);
}

run().catch(console.error);
