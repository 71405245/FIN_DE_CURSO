/**
 * SIMA — Generador Masivo de Horarios, Salones y Secciones (Seeder)
 * =================================================================
 *
 * Características:
 *   - Genera 250 aulas válidas: Pabellones A-J, Pisos 1-5, Aulas 1-5 (ej. A101, A102, ..., J505).
 *   - Distribuye horarios de 1.5 horas a 3.0 horas desde las 7:00 AM hasta las 10:00 PM.
 *   - Clases de Lunes a Domingo (incluyendo fin de semana).
 *   - Validación estricta y libre de colisiones (sin cruces de horario para docentes ni aulas).
 *   - Asignación inteligente: Los docentes solo dictan cursos pertenecientes a sus carreras enseñadas.
 *
 * Uso:
 *   node seeders/generarHorariosYSalones.js
 *   node seeders/generarHorariosYSalones.js --limpiar    ← elimina las secciones previas antes de sembrar
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Curso = require('../models/Curso');
const User = require('../models/User');
const Seccion = require('../models/Seccion');
const Carrera = require('../models/Carrera');

// ─── Configuración ────────────────────────────────────────────────────────────

const LIMPIAR = process.argv.includes('--limpiar');

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};

const log = {
  ok:   (m) => console.log(`${C.green}  ✔${C.reset} ${m}`),
  warn: (m) => console.log(`${C.yellow}  ⚠${C.reset} ${m}`),
  err:  (m) => console.log(`${C.red}  ✖${C.reset} ${m}`),
  info: (m) => console.log(`${C.cyan}  →${C.reset} ${m}`),
  head: (m) => console.log(`\n${C.bold}${C.cyan}${m}${C.reset}`),
};

// ─── Definición de Días y Bloques de Horario ──────────────────────────────────

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Bloques de 30 minutos desde las 07:00 hasta las 22:00 (15 horas = 30 bloques)
// Bloque 0: 07:00 - 07:30
// Bloque 29: 21:30 - 22:00
const TOTAL_BLOQUES = 30;

function horaABloque(horaStr) {
  const [h, m] = horaStr.split(':').map(Number);
  const minutosDesdeInicio = (h - 7) * 60 + m;
  return Math.floor(minutosDesdeInicio / 30);
}

function bloqueAHora(bloqueNum) {
  const minutosTotales = bloqueNum * 30;
  const h = Math.floor(minutosTotales / 60) + 7;
  const m = minutosTotales % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Slots de 1.5 horas (3 bloques consecutivos)
const SLOTS_1_5H = [
  { inicio: '07:00', fin: '08:30' },
  { inicio: '08:30', fin: '10:00' },
  { inicio: '10:00', fin: '11:30' },
  { inicio: '11:30', fin: '13:00' },
  { inicio: '13:00', fin: '14:30' },
  { inicio: '14:30', fin: '16:00' },
  { inicio: '16:00', fin: '17:30' },
  { inicio: '17:30', fin: '19:00' },
  { inicio: '19:00', fin: '20:30' },
  { inicio: '20:30', fin: '22:00' }
];

// Slots de 3.0 horas (6 bloques consecutivos)
const SLOTS_3H = [
  { inicio: '07:00', fin: '10:00' },
  { inicio: '10:00', fin: '13:00' },
  { inicio: '13:00', fin: '16:00' },
  { inicio: '16:00', fin: '19:00' },
  { inicio: '19:00', fin: '22:00' }
];

// ─── Generador de Salones ─────────────────────────────────────────────────────

function generarSalones() {
  const salones = [];
  const pabellones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']; // A hasta la J
  for (const pab of pabellones) {
    for (let piso = 1; piso <= 5; piso++) { // 1 al 5
      for (let num = 1; num <= 5; num++) { // 101 al 505
        salones.push(`${pab}${piso}0${num}`); // ej. A101, B205, J505
      }
    }
  }
  return salones;
}

// ─── Algoritmo Principal ──────────────────────────────────────────────────────

async function main() {
  console.log(`\n${C.bold}╔══════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}║   SIMA — Generador Masivo de Horarios y Secciones        ║${C.reset}`);
  console.log(`${C.bold}╚══════════════════════════════════════════════════════════╝${C.reset}\n`);

  log.info('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
  log.ok('Conectado\n');

  if (LIMPIAR) {
    log.warn('--limpiar: eliminando secciones existentes en la base de datos...');
    await Seccion.deleteMany({});
    log.ok('Secciones eliminadas\n');
  }

  // 1. Cargar datos en memoria
  log.info('Cargando cursos, carreras y docentes registrados...');
  const cursos = await Curso.find({});
  const docentes = await User.find({ rol: 'DOCENTE' });
  const salones = generarSalones();

  log.ok(`${cursos.length} Cursos cargados.`);
  log.ok(`${docentes.length} Docentes cargados.`);
  log.ok(`${salones.length} Aulas generadas (formato A101 a J505).\n`);

  // 2. Grillas de Ocupación para evitar colisiones O(1)
  // ocupacionDocente[docenteId][dia][bloque] = true
  // ocupacionAula[aulaName][dia][bloque] = true
  const ocupacionDocente = {};
  const ocupacionAula = {};

  docentes.forEach(d => {
    ocupacionDocente[d._id.toString()] = {};
    DIAS.forEach(dia => {
      ocupacionDocente[d._id.toString()][dia] = new Array(TOTAL_BLOQUES).fill(false);
    });
  });

  salones.forEach(aula => {
    ocupacionAula[aula] = {};
    DIAS.forEach(dia => {
      ocupacionAula[aula][dia] = new Array(TOTAL_BLOQUES).fill(false);
    });
  });

  // 3. Programar secciones para los cursos
  log.info('Programando secciones sin colisiones de horario...');
  const seccionesParaInsertar = [];
  let cursosProgramados = 0;
  let cursosOmitidos = 0;

  // Barajar cursos para distribuir de manera aleatoria
  const cursosShuffled = [...cursos].sort(() => Math.random() - 0.5);

  for (const curso of cursosShuffled) {
    const cursoCarreraId = curso.carrera.toString();

    // Encontrar profesores calificados para dictar esta carrera
    const profesoresCalificados = docentes.filter(d => 
      d.carrerasEnsenadas.map(c => c.toString()).includes(cursoCarreraId)
    );

    if (profesoresCalificados.length === 0) {
      cursosOmitidos++;
      continue;
    }

    // Barajar profesores calificados para distribuir la carga equitativamente
    const profesoresCalificadosShuffled = [...profesoresCalificados].sort(() => Math.random() - 0.5);

    let programadoExitosamente = false;

    for (const docente of profesoresCalificadosShuffled) {
      const docenteIdStr = docente._id.toString();

      // Definir aleatoriamente la duración: 1.5 horas o 3.0 horas
      const usarTresHoras = Math.random() > 0.5;
      const slotsDisponibles = usarTresHoras ? SLOTS_3H : SLOTS_1_5H;

      // Generar combinaciones de día y slot aleatorios para buscar
      const combinacionesABuscar = [];
      DIAS.forEach(dia => {
        slotsDisponibles.forEach(slot => {
          combinacionesABuscar.push({ dia, slot });
        });
      });
      // Barajar combinaciones de horarios
      combinacionesABuscar.sort(() => Math.random() - 0.5);

      for (const comb of combinacionesABuscar) {
        const { dia, slot } = comb;
        const bInicio = horaABloque(slot.inicio);
        const bFin = horaABloque(slot.fin);

        // Validar si el profesor está libre en este rango de bloques
        let docenteLibre = true;
        for (let b = bInicio; b < bFin; b++) {
          if (ocupacionDocente[docenteIdStr][dia][b]) {
            docenteLibre = false;
            break;
          }
        }

        if (!docenteLibre) continue; // Intentar otra combinación de horario

        // Validar si hay algún aula libre en este rango de bloques
        // Barajamos las aulas para no saturar las primeras aulas
        const salonesShuffled = [...salones].sort(() => Math.random() - 0.5);
        let aulaSeleccionada = null;

        for (const aula of salonesShuffled) {
          let aulaLibre = true;
          for (let b = bInicio; b < bFin; b++) {
            if (ocupacionAula[aula][dia][b]) {
              aulaLibre = false;
              break;
            }
          }
          if (aulaLibre) {
            aulaSeleccionada = aula;
            break;
          }
        }

        if (!aulaSeleccionada) continue; // Ninguna aula libre, intentar otra combinación

        // ¡Encontramos horario y aula libres para este profesor!
        // Ocupar grillas
        for (let b = bInicio; b < bFin; b++) {
          ocupacionDocente[docenteIdStr][dia][b] = true;
          ocupacionAula[aulaSeleccionada][dia][b] = true;
        }

        // Crear la sección
        const cupoMaximo = Math.floor(Math.random() * (30 - 25 + 1)) + 25; // 25 a 30 cupos
        const diaTraducido = dia; // "Lunes", "Martes", etc.

        seccionesParaInsertar.push({
          curso: curso._id,
          codigoSeccion: `S${Math.floor(Math.random() * 3) + 1}`, // S1, S2, S3
          docente: docente._id,
          horario: `${diaTraducido} ${slot.inicio} - ${slot.fin}`,
          dias: [diaTraducido],
          horaInicio: slot.inicio,
          horaFin: slot.fin,
          aula: aulaSeleccionada,
          cupoMaximo,
          estudiantesMatriculados: []
        });

        programadoExitosamente = true;
        cursosProgramados++;
        break; // Detener búsqueda para este curso
      }

      if (programadoExitosamente) break;
    }

    // Detenernos si ya tenemos suficientes secciones para una simulación ultra completa (ej. 1,000 secciones)
    if (seccionesParaInsertar.length >= 1000) {
      log.warn('Llegamos al límite simulado de 1,000 secciones programadas exitosamente.');
      break;
    }
  }

  // 4. Inserción masiva de secciones
  if (seccionesParaInsertar.length > 0) {
    log.info(`Escribiendo ${seccionesParaInsertar.length} secciones en MongoDB en lote masivo...`);
    await Seccion.insertMany(seccionesParaInsertar);
    log.ok('Inserción masiva completada con éxito.');
  } else {
    log.err('No se pudo programar ninguna sección.');
  }

  // 5. Resumen
  console.log(`\n${C.bold}╔══════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}║                    RESUMEN FINAL                         ║${C.reset}`);
  console.log(`${C.bold}╚══════════════════════════════════════════════════════════╝${C.reset}`);
  console.log(`  ${C.green}Secciones programadas:${C.reset}    ${seccionesParaInsertar.length}`);
  console.log(`  ${C.yellow}Cursos omitidos sin doc:${C.reset}  ${cursosOmitidos}`);
  console.log(`  ${C.cyan}Total de aulas usadas:${C.reset}    ${new Set(seccionesParaInsertar.map(s => s.aula)).size} / 250`);
  console.log(`  ${C.gray}Docentes activos en clases:${C.reset} ${new Set(seccionesParaInsertar.map(s => s.docente.toString())).size} / 80`);
  console.log('');

  await mongoose.disconnect();
  log.ok('¡Horarios y salones generados correctamente!\n');
}

main().catch(err => {
  console.error(`\n${C.red}Error fatal:${C.reset}`, err.message);
  mongoose.disconnect();
  process.exit(1);
});
