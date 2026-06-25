/**
 * SIMA — Importador de Estudiantes desde CSV
 * ==========================================
 * Coloca tu archivo alumnos.csv en: backend/seeders/dataAlumno/alumnos.csv
 *
 * Uso:
 *   node seeders/importarEstudiantes.js
 *   node seeders/importarEstudiantes.js --limpiar    ← borra los estudiantes antes de importar
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');

const Carrera = require('../models/Carrera');
const User    = require('../models/User');

// ─── Config ──────────────────────────────────────────────────────────────────

const CSV_FILE = path.join(__dirname, 'dataAlumno', 'alumnos.csv');
const LIMPIAR  = process.argv.includes('--limpiar');

// ─── Colores consola ──────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function campo(fila, ...claves) {
  for (const clave of claves) {
    if (fila[clave] !== undefined && fila[clave] !== null && String(fila[clave]).trim() !== '') {
      return String(fila[clave]).trim();
    }
  }
  return '';
}

function normalizarNombre(str) {
  if (!str) return '';
  let res = str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quitar tildes
  res = res.replace(/[\u2013\u2014]/g, "-"); // normalizar guiones y rayas (en-dash, em-dash) a guion simple
  res = res.replace(/\s+/g, " "); // normalizar multiples espacios
  return res.toLowerCase().trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${C.bold}╔══════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}║   SIMA — Importador de Alumnos CSV       ║${C.reset}`);
  console.log(`${C.bold}╚══════════════════════════════════════════╝${C.reset}\n`);

  if (!fs.existsSync(CSV_FILE)) {
    log.err(`No se encontró el archivo CSV de alumnos en: ${CSV_FILE}`);
    process.exit(1);
  }

  log.info('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
  log.ok('Conectado\n');

  // Limpiar si se pidió
  if (LIMPIAR) {
    log.warn('--limpiar: eliminando estudiantes existentes en la base de datos...');
    await User.deleteMany({ rol: 'ESTUDIANTE' });
    log.ok('Estudiantes eliminados\n');
  }

  log.info('Cargando archivo alumnos.csv...');
  const contenido = fs.readFileSync(CSV_FILE, 'utf-8');
  
  // Detectar delimitador
  const primeraLinea = contenido.split('\n')[0] || '';
  const delimitador = primeraLinea.includes('\t') ? '\t' : (primeraLinea.includes(';') ? ';' : ',');
  log.info(`Separador detectado: ${delimitador === '\t' ? 'TAB' : delimitador === ';' ? 'PUNTO Y COMA' : 'COMA'}`);

  const filas = parse(contenido, {
    columns:           true,
    skip_empty_lines:  true,
    trim:              true,
    bom:               true,
    delimiter:         delimitador,
    relax_column_count: true,
  });

  if (filas.length === 0) {
    log.err('El archivo CSV no contiene registros.');
    process.exit(1);
  }

  log.info(`Total de registros leídos del CSV: ${C.bold}${filas.length}${C.reset}\n`);

  // Cargar carreras en memoria para mapeo súper rápido
  log.info('Obteniendo carreras existentes...');
  const carreras = await Carrera.find({});
  const carreraMap = {};
  carreras.forEach(c => {
    const nombreNormalizado = normalizarNombre(c.nombre);
    carreraMap[nombreNormalizado] = c._id;
  });
  log.ok(`${carreras.length} carreras cargadas en memoria.`);

  // Obtener emails existentes en DB para control de duplicados
  log.info('Obteniendo estudiantes registrados para evitar duplicados...');
  const usuariosExistentes = await User.find({}).select('email');
  const emailSet = new Set(usuariosExistentes.map(u => u.email.toLowerCase().trim()));
  log.ok(`${emailSet.size} correos indexados en memoria.\n`);

  // ── Hashear contraseñas en lote de forma optimizada ──────────────────────────
  log.info('Precalcuando hashes de contraseñas de manera eficiente...');
  const salt = await bcrypt.genSalt(10);
  const loteSize = 200;
  const listadoProcesados = [];
  
  for (let i = 0; i < filas.length; i += loteSize) {
    const chunk = filas.slice(i, i + loteSize);
    const promesas = chunk.map(async (fila) => {
      const email = campo(fila, 'correo electrónico', 'correo electronico', 'email', 'correo').toLowerCase().trim();
      const passwordTemporal = campo(fila, 'contraseña temporal', 'contrasenna temporal', 'contrasena temporal', 'contraseña', 'contrasena', 'password', 'clave');
      
      const pwd = passwordTemporal || 'sima12345';
      const hash = await bcrypt.hash(pwd, salt);
      return { fila, email, hash };
    });

    const chunkHashes = await Promise.all(promesas);
    listadoProcesados.push(...chunkHashes);

    if ((i + loteSize) % 1000 === 0 || (i + loteSize) >= filas.length) {
      log.info(`  Progreso de encriptación: ${Math.min(i + loteSize, filas.length)} / ${filas.length} completado.`);
    }
  }
  log.ok('Contraseñas encriptadas correctamente.\n');

  // ── Estructurar registros para inserción ─────────────────────────────────────
  log.info('Mapeando y validando registros académicos...');
  const aInsertar = [];
  let duplicadosCount = 0;
  let sinCarreraCount = 0;
  const errores = [];

  for (const item of listadoProcesados) {
    const { fila, email, hash } = item;
    
    if (!email) {
      errores.push(`Fila omitida por email vacío: ${JSON.stringify(fila)}`);
      continue;
    }

    if (emailSet.has(email)) {
      duplicadosCount++;
      continue;
    }

    const nombre = campo(fila, 'nombre', 'Nombre', 'name');
    const apellidos = campo(fila, 'apellidos', 'Apellidos', 'last');
    
    if (!nombre || !apellidos) {
      errores.push(`Fila omitida por nombre o apellidos incompletos (Email: ${email})`);
      continue;
    }

    const carreraNombre = normalizarNombre(campo(fila, 'carrera', 'Carrera', 'career', 'programa'));
    let carreraId = null;
    if (carreraNombre) {
      carreraId = carreraMap[carreraNombre];
      if (!carreraId) {
        // Coincidencia parcial si no es exacta
        const matchedKey = Object.keys(carreraMap).find(k => k.includes(carreraNombre) || carreraNombre.includes(k));
        if (matchedKey) carreraId = carreraMap[matchedKey];
      }
    }

    if (!carreraId) {
      sinCarreraCount++;
      errores.push(`Carrera no encontrada: "${campo(fila, 'carrera')}" para ${nombre} ${apellidos}`);
      continue;
    }

    const cicloS = campo(fila, 'ciclo', 'Ciclo', 'semestre', 'nivel');
    const cicloNum = parseInt(cicloS.replace(/\D/g, '')) || 1;

    aInsertar.push({
      nombre,
      apellidos,
      email,
      password: hash,
      rol: 'ESTUDIANTE',
      carrera: carreraId,
      cicloActual: cicloNum
    });

    emailSet.add(email); // Evitar duplicados dentro del mismo lote del CSV
  }

  // ── Guardar en base de datos en lote masivo ──────────────────────────────────
  let creadosCount = 0;
  if (aInsertar.length > 0) {
    log.info(`Escribiendo registros en MongoDB en un único lote de alto rendimiento...`);
    await User.insertMany(aInsertar);
    creadosCount = aInsertar.length;
    log.ok('Escritura masiva en base de datos completada.');
  } else {
    log.warn('No se encontraron registros aptos para insertar.');
  }

  // ── Resumen ─────────────────────────────────────────────────────────────────
  console.log(`\n${C.bold}╔══════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}║              RESUMEN FINAL               ║${C.reset}`);
  console.log(`${C.bold}╚══════════════════════════════════════════╝${C.reset}`);
  console.log(`  ${C.green}Estudiantes creados:${C.reset}      ${creadosCount}`);
  console.log(`  ${C.yellow}Omitidos por duplicado:${C.reset}   ${duplicadosCount}`);
  console.log(`  ${C.yellow}Omitidos por sin carrera:${C.reset} ${sinCarreraCount}`);
  
  if (errores.length > 0) {
    console.log(`\n  ${C.red}Detalle de alertas (${errores.length}):${C.reset}`);
    errores.slice(0, 10).forEach(e => console.log(`    ${C.red}✖${C.reset} ${e}`));
    if (errores.length > 10) console.log(`    ... y ${errores.length - 10} alertas más.`);
  }
  console.log('');

  await mongoose.disconnect();
  log.ok('¡Importación masiva finalizada con éxito!\n');
}

main().catch(err => {
  console.error(`\n${C.red}Error fatal:${C.reset}`, err.message);
  mongoose.disconnect();
  process.exit(1);
});
