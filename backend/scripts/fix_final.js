require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Curso = require('../models/Curso');
const User = require('../models/User');
const Seccion = require('../models/Seccion');
const Calificacion = require('../models/Calificacion');

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

// Para generar datos realistas
const nombresRandom = ['Luis', 'Carmen', 'Jorge', 'Elena', 'Ricardo', 'Sofia', 'Pedro', 'Ana', 'Diego', 'Lucía'];
const apellidosRandom = ['Mendoza', 'Vargas', 'Rojas', 'Salas', 'Cortez', 'Campos', 'López', 'Guerrero', 'Ramos', 'Pinto'];

async function run() {
  console.log(">> Iniciando Ajuste Final de BD (Balanceo de Carga y Notas)...");

  // 1. ACTUALIZACIÓN DE NOTAS
  console.log("\n[1] Actualizando calificaciones a formato flotante...");
  const califs = await Calificacion.find();
  let notasActualizadas = 0;
  for (const c of califs) {
    if (Number.isInteger(c.nota)) {
      // Sumar o restar un decimal aleatorio
      const diff = (Math.random() * 1.5 - 0.5); // entre -0.5 y 1.0
      let nuevaNota = Math.max(0, Math.min(20, c.nota + diff));
      nuevaNota = Math.round(nuevaNota * 10) / 10; // 1 decimal
      
      c.nota = nuevaNota;
      // Pre-save calculará el nuevo status de `aprobado` con la regla > 10.5
      await c.save();
      notasActualizadas++;
    }
  }
  console.log(`- ${notasActualizadas} calificaciones actualizadas con decimales.`);

  // 2. BALANCEO DE DOCENTES (Max 10 clases)
  console.log("\n[2] Ejecutando balanceo estricto de carga docente...");
  const cursos = await Curso.find().lean();
  let docentes = await User.find({ rol: 'DOCENTE' }).lean();
  const secciones = await Seccion.find().populate('curso').lean();

  const cursoCategoria = {};
  cursos.forEach(c => { cursoCategoria[c._id] = categorizarCurso(c.nombre); });

  const docenteEspecialidad = {};
  const especialidadesDisponibles = CATEGORIAS.map(c => c.id);
  docentes.forEach((d, index) => {
    // Si ya existe en la DB, respetar especialidad o darle una round-robin si no se guardó
    const esp = especialidadesDisponibles[index % especialidadesDisponibles.length];
    docenteEspecialidad[d._id] = esp;
  });

  const horarioDocentes = {};
  docentes.forEach(d => horarioDocentes[d._id] = []);

  let nuevosDocentesCreados = 0;
  const hashPass = await bcrypt.hash('123456789', await bcrypt.genSalt(10));

  for (const seccion of secciones) {
    const cursoId = seccion.curso._id;
    const cat = cursoCategoria[cursoId];

    let docentesEspecialidad = docentes.filter(d => docenteEspecialidad[d._id] === cat);
    if (docentesEspecialidad.length === 0) docentesEspecialidad = docentes.filter(d => docenteEspecialidad[d._id] === 'GENERAL');
    
    // Shuffle
    docentesEspecialidad.sort(() => Math.random() - 0.5);

    let docenteAsignado = null;

    for (const doc of docentesEspecialidad) {
      const horarioActual = horarioDocentes[doc._id];
      // REGLA: MÁXIMO 10 CLASES
      if (horarioActual.length >= 10) continue;

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

    // SI NO HAY DOCENTE DISPONIBLE (todos ocupados o tienen 10 clases), CREAR UNO NUEVO
    if (!docenteAsignado) {
      const nombre = nombresRandom[Math.floor(Math.random() * nombresRandom.length)];
      const apellido = apellidosRandom[Math.floor(Math.random() * apellidosRandom.length)];
      const email = `prof.${nombre.toLowerCase()}.${apellido.toLowerCase()}${Math.floor(Math.random()*1000)}@sima.edu`;
      
      const nuevoDocente = await User.create({
        nombre: nombre,
        apellidos: apellido + ' (Extra)',
        email: email,
        password: hashPass,
        rol: 'DOCENTE'
      });

      docenteEspecialidad[nuevoDocente._id] = cat;
      horarioDocentes[nuevoDocente._id] = [];
      docentes.push(nuevoDocente.toObject());
      docenteAsignado = nuevoDocente;
      nuevosDocentesCreados++;
    }

    // Asignar
    horarioDocentes[docenteAsignado._id].push(seccion);
    await Seccion.updateOne({ _id: seccion._id }, { $set: { docente: docenteAsignado._id } });
  }

  console.log(`\n>> ¡Balanceo Completado!`);
  console.log(`- Se crearon ${nuevosDocentesCreados} docentes extra para cubrir las necesidades sin exceder 10 clases/profesor.`);
  
  process.exit(0);
}

run().catch(console.error);
