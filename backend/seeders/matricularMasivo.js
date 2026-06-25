require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Curso = require('../models/Curso');
const Seccion = require('../models/Seccion');

const LIMIT = 2500; // Número máximo de alumnos a matricular masivamente

// Helper para comprobar cruces simples
function checkOverlap(s1, s2) {
  const commonDays = s1.dias.filter(d => s2.dias.includes(d));
  if (commonDays.length === 0) return false;
  return (s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin);
}

async function matricularMasivo() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
    console.log('Conectado a la BD para Matrícula Masiva...');

    // Obtener estudiantes
    const estudiantes = await User.find({ rol: 'ESTUDIANTE' }).limit(LIMIT);
    console.log(`Se encontraron ${estudiantes.length} estudiantes. Iniciando proceso...`);

    let totalMatriculados = 0;

    for (let i = 0; i < estudiantes.length; i++) {
      const estudiante = estudiantes[i];
      let creditosActuales = 0;
      const horarioActual = [];

      // Ya matriculados previamente
      const seccionesPrevias = await Seccion.find({ estudiantesMatriculados: estudiante._id }).populate('curso');
      seccionesPrevias.forEach(s => {
        if (s.curso) creditosActuales += s.curso.creditos;
        horarioActual.push(s);
      });

      if (creditosActuales >= 15) continue; // Ya llegó a su límite

      // Cursos del ciclo
      const cursosCiclo = await Curso.find({ carrera: estudiante.carrera, ciclo: estudiante.cicloActual });
      const cursosMatriculadosIds = new Set(seccionesPrevias.map(s => String(s.curso._id)));

      for (const curso of cursosCiclo) {
        if (creditosActuales + curso.creditos > 15) continue;
        if (cursosMatriculadosIds.has(String(curso._id))) continue; // Ya lo tiene

        // Buscar secciones disponibles para este curso
        const seccionesDisponibles = await Seccion.find({ curso: curso._id });
        let matriculadoEnCurso = false;

        // Mezclar secciones para dar aleatoriedad
        const shuffledSecciones = seccionesDisponibles.sort(() => 0.5 - Math.random());

        for (const sec of shuffledSecciones) {
          if (sec.estudiantesMatriculados.length >= sec.cupoMaximo) continue;

          // Revisar colisión
          let colision = false;
          for (const scheduled of horarioActual) {
            if (checkOverlap(sec, scheduled)) {
              colision = true;
              break;
            }
          }

          if (!colision) {
            // Matricular!
            sec.estudiantesMatriculados.push(estudiante._id);
            await sec.save();
            horarioActual.push(sec);
            creditosActuales += curso.creditos;
            totalMatriculados++;
            matriculadoEnCurso = true;
            break; // Ya se matriculó en una sección de este curso, pasar al siguiente curso
          }
        }
      }

      if (i % 100 === 0 && i > 0) {
        console.log(`Procesados ${i} estudiantes... (Matrículas realizadas: ${totalMatriculados})`);
      }
    }

    console.log(`\n¡Proceso Finalizado! Se realizaron ${totalMatriculados} inscripciones en total.`);
    process.exit(0);
  } catch (error) {
    console.error('Error masivo:', error);
    process.exit(1);
  }
}

matricularMasivo();
