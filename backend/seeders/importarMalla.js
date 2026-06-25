/**
 * SIMA — Importador de Malla Curricular desde CSV
 * ================================================
 * Coloca tus archivos .csv en: backend/seeders/data/
 *
 * El nombre del archivo = nombre de la carrera.
 * Ejemplo: "Ingenieria de Sistemas.csv" → carrera "Ingenieria de Sistemas"
 *
 * Columnas del CSV (separadas por TAB o coma, con encabezado):
 *   codigo | asignatura | creditos | prerrequisitos | tipo | area | ciclo
 *
 *   - prerrequisitos: puede ser un código único o varios separados por "/"
 *     Ejemplos: "MAT101"  |  "MAT101/CS101"  |  (vacío = sin prerrequisitos)
 *
 *   - Las columnas: estado, nota, veces llevado → se IGNORAN (son del estudiante)
 *
 * Uso:
 *   node seeders/importarMalla.js
 *   node seeders/importarMalla.js --limpiar    ← borra todo antes de importar
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const Carrera = require('../models/Carrera');
const Curso   = require('../models/Curso');

// ─── Config ──────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'data');
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

/**
 * Devuelve el valor de una fila buscando múltiples nombres posibles de columna.
 * Retorna string vacío si no existe.
 */
function campo(fila, ...claves) {
  for (const clave of claves) {
    if (fila[clave] !== undefined && fila[clave] !== null && String(fila[clave]).trim() !== '') {
      return String(fila[clave]).trim();
    }
  }
  return '';
}

/**
 * Parsea los prerrequisitos del CSV.
 * Acepta: "MAT101" | "MAT101/CS101" | "MAT101, CS101" | vacío
 * Retorna: array de códigos, ej: ["MAT101", "CS101"]
 */
function parsearPrerequisitos(valor) {
  if (!valor || valor.trim() === '' || valor.trim().toLowerCase() === 'ninguno') return [];
  // Separar por / o ,
  return valor.split(/[/,]/).map(v => v.trim()).filter(Boolean);
}

/**
 * Detecta automáticamente si el CSV usa TAB o coma como separador.
 */
function detectarDelimitador(contenido) {
  const primeraLinea = contenido.split('\n')[0] || '';
  const tabs   = (primeraLinea.match(/\t/g) || []).length;
  const comas  = (primeraLinea.match(/,/g)  || []).length;
  return tabs >= comas ? '\t' : ',';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${C.bold}╔══════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}║   SIMA — Importador de Mallas CSV        ║${C.reset}`);
  console.log(`${C.bold}╚══════════════════════════════════════════╝${C.reset}\n`);

  log.info('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
  log.ok('Conectado\n');

  // Limpiar si se pidió
  if (LIMPIAR) {
    log.warn('--limpiar: eliminando cursos y carreras existentes...');
    await Curso.deleteMany({});
    await Carrera.deleteMany({});
    log.ok('Base de datos limpiada\n');
  }

  // Leer archivos CSV
  const archivos = fs.readdirSync(DATA_DIR).filter(f => /\.csv$/i.test(f));

  if (archivos.length === 0) {
    log.err(`No se encontraron archivos .csv en: ${DATA_DIR}`);
    process.exit(1);
  }

  log.info(`Archivos encontrados: ${C.bold}${archivos.length}${C.reset}\n`);

  // Estadísticas
  let totalCarreras = 0, totalCursos = 0, totalOmitidos = 0;
  const errores = [];

  // ── Procesar cada archivo ──────────────────────────────────────────────────
  for (const archivo of archivos) {
    const rutaArchivo   = path.join(DATA_DIR, archivo);
    const nombreCarrera = path.basename(archivo, path.extname(archivo)).trim();

    log.head(`📄 ${archivo}`);
    log.info(`Carrera → "${nombreCarrera}"`);

    try {
      let contenido = fs.readFileSync(rutaArchivo, 'utf-8');
      
      // Limpiar envoltorios de código markdown como ```csv o ```
      contenido = contenido
        .split('\n')
        .filter(line => !line.trim().startsWith('```'))
        .join('\n');

      const delimitador = detectarDelimitador(contenido);
      log.info(`Separador detectado: ${delimitador === '\t' ? 'TAB' : 'COMA'}`);

      const filas = parse(contenido, {
        columns:           true,
        skip_empty_lines:  true,
        trim:              true,
        bom:               true,   // compatibilidad con Excel
        delimiter:         delimitador,
        relax_column_count: true,  // tolera filas con columnas de más/menos
      });

      if (filas.length === 0) {
        log.warn('Archivo vacío, omitiendo.');
        continue;
      }

      const columnas = Object.keys(filas[0]);
      log.info(`Columnas: ${C.gray}${columnas.join(' | ')}${C.reset}`);

      // Crear o reusar carrera
      let carrera = await Carrera.findOne({ nombre: nombreCarrera });
      if (!carrera) {
        carrera = await Carrera.create({ nombre: nombreCarrera });
        log.ok(`Carrera creada: "${nombreCarrera}"`);
        totalCarreras++;
      } else {
        log.warn(`Carrera ya existe, usando la existente: "${nombreCarrera}"`);
      }

      // ── Insertar cursos ────────────────────────────────────────────────────
      let insertados = 0, omitidos = 0;

      for (const fila of filas) {
        // Mapeo flexible (acepta variantes en mayúsculas/minúsculas y en español/inglés)
        const codigo  = campo(fila, 'codigo',     'Codigo',    'CODIGO',    'code', 'Código');
        const nombre  = campo(fila, 'asignatura', 'Asignatura','ASIGNATURA','nombre','Nombre','name');
        const cicloS  = campo(fila, 'ciclo',      'Ciclo',     'CICLO',     'semestre','Semestre','nivel');
        const creditS = campo(fila, 'creditos',   'Creditos',  'CREDITOS',  'credits','cr','Créditos');
        const prereqS = campo(fila, 'prerrequisitos','Prerrequisitos','PRERREQUISITOS','prerequisito','prereq','pre');
        const area    = campo(fila, 'area',        'Area',      'AREA',      'Área');
        const tipo    = campo(fila, 'tipo',        'Tipo',      'TIPO',      'type');

        // Extraer número de ciclo (ej: "Ciclo 01" -> 1)
        const matchCiclo = cicloS.match(/\d+/);
        const ciclo   = matchCiclo ? parseInt(matchCiclo[0]) : NaN;
        const creditos = parseInt(creditS) || 0;
        const prerrequisitos = parsearPrerequisitos(prereqS);

        // Validar obligatorios
        if (!codigo) {
          log.warn(`  Fila sin código, omitida: ${JSON.stringify(fila)}`);
          omitidos++; continue;
        }
        if (!nombre) {
          log.warn(`  Fila sin nombre, omitida: ${codigo}`);
          omitidos++; continue;
        }
        if (!ciclo || isNaN(ciclo)) {
          log.warn(`  Ciclo inválido → ${codigo} "${nombre}", omitido.`);
          omitidos++; continue;
        }

        // Verificar duplicado
        const existe = await Curso.findOne({ codigo });
        if (existe) {
          log.warn(`  Ya existe → ${codigo} "${nombre}"`);
          omitidos++; continue;
        }

        await Curso.create({ codigo, nombre, creditos, carrera: carrera._id, ciclo, prerrequisitos, area, tipo });
        insertados++;
      }

      log.ok(`Insertados: ${C.bold}${insertados}${C.reset}  |  Omitidos: ${omitidos}`);
      totalCursos    += insertados;
      totalOmitidos  += omitidos;

    } catch (err) {
      log.err(`Error en "${archivo}": ${err.message}`);
      errores.push({ archivo, error: err.message });
    }
  }

  // ── Resumen ────────────────────────────────────────────────────────────────
  console.log(`\n${C.bold}╔══════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}║              RESUMEN FINAL               ║${C.reset}`);
  console.log(`${C.bold}╚══════════════════════════════════════════╝${C.reset}`);
  console.log(`  ${C.green}Carreras creadas:${C.reset}  ${totalCarreras}`);
  console.log(`  ${C.green}Cursos insertados:${C.reset} ${totalCursos}`);
  console.log(`  ${C.yellow}Cursos omitidos:${C.reset}   ${totalOmitidos}`);
  if (errores.length > 0) {
    console.log(`  ${C.red}Archivos con error:${C.reset} ${errores.length}`);
    errores.forEach(e => console.log(`    ${C.red}✖${C.reset} ${e.archivo}: ${e.error}`));
  }
  console.log('');

  await mongoose.disconnect();
  log.ok('¡Importación completada!\n');
}

main().catch(err => {
  console.error(`\n${C.red}Error fatal:${C.reset}`, err.message);
  mongoose.disconnect();
  process.exit(1);
});
