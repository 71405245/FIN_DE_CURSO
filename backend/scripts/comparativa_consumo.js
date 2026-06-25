/**
 * ============================================================
 *  SIMA — Script de Comparativa de Consumo (Antes vs Después)
 *  Uso: node comparativa_consumo.js
 * ============================================================
 * Mide los mismos endpoints en dos modos:
 *  ANTES  → cabecera x-no-compression:1  (sin GZIP, simula estado original)
 *  DESPUÉS → petición normal con GZIP     (estado optimizado actual)
 *
 * Fórmula CO₂: bytes × 0.0000000318 g/byte × 1000 = mg CO₂
 * Fuente: Sustainable Web Design — Wholegrain Digital (2023)
 * ============================================================
 */

require('dotenv').config();
const http = require('http');
const zlib = require('zlib');

const HOST = 'localhost';
const PORT = process.env.PORT || 5001;

// Factor de huella de carbono (Sustainable Web Design Model 2023)
const CO2_PER_BYTE_MG = 0.0000000318 * 1000; // mg CO₂ por byte

const ENDPOINTS = [
  { nombre: 'Estadísticas Dashboard',  ruta: '/api/admin/stats/counts' },
  { nombre: 'Lista de Carreras',        ruta: '/api/admin/carreras'      },
  { nombre: 'Lista de Cursos',          ruta: '/api/admin/cursos'        },
  { nombre: 'Lista de Secciones',       ruta: '/api/admin/secciones'     },
  { nombre: 'Lista de Docentes',        ruta: '/api/admin/docentes'      },
  { nombre: 'Lista de Estudiantes',     ruta: '/api/admin/estudiantes'   },
];

// ── Utilidades ─────────────────────────────────────────────────────────────

function formatBytes(b) {
  if (b < 1024)        return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function co2mg(bytes) {
  return (bytes * CO2_PER_BYTE_MG).toFixed(7);
}

function pct(antes, despues) {
  const r = ((antes - despues) / antes * 100);
  return r > 0 ? `↓ ${r.toFixed(1)}%` : `↑ ${Math.abs(r).toFixed(1)}%`;
}

function bar(ratio, len = 30) {
  const filled = Math.round((1 - ratio) * len);
  const empty  = len - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

function peticion(token, ruta, sinCompresion) {
  return new Promise((resolve, reject) => {
    const headers = { 'x-auth-token': token };
    if (sinCompresion) {
      headers['x-no-compression'] = '1';
    } else {
      headers['Accept-Encoding'] = 'gzip, deflate';
    }

    const t0  = Date.now();
    const req = http.request(
      { host: HOST, port: PORT, path: ruta, method: 'GET', headers },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const raw  = Buffer.concat(chunks);
          const ms   = Date.now() - t0;
          const enc  = res.headers['content-encoding'] || 'ninguna';
          resolve({ bytes: raw.length, ms, encoding: enc });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function login() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ email: 'admin@sima.com', password: '123456789' });
    const req  = http.request(
      {
        host: HOST, port: PORT,
        path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data).token);
          } catch {
            reject(new Error('Login fallido — ¿el backend está corriendo en puerto ' + PORT + '?'));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Programa Principal ─────────────────────────────────────────────────────

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     SIMA — Comparativa de Consumo: ANTES vs DESPUÉS          ║');
  console.log('║     Impacto Ambiental de Optimizaciones (Green Code)          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Servidor : http://${HOST}:${PORT}`);
  console.log(`  Modelo CO₂: Sustainable Web Design 2023 — 0.0000000318 g/byte`);
  console.log('');

  // 1. Login
  process.stdout.write('  🔐 Autenticando con admin@sima.com ... ');
  let token;
  try {
    token = await login();
    console.log('✅ OK\n');
  } catch (err) {
    console.log('❌ ERROR');
    console.error(`\n  ${err.message}\n`);
    process.exit(1);
  }

  // 2. Medir cada endpoint
  const filas = [];
  let totalAntes = 0, totalDespues = 0;
  let totalMsAntes = 0, totalMsDespues = 0;

  console.log('  Midiendo endpoints (puede tardar ~10 segundos)...\n');

  for (const ep of ENDPOINTS) {
    process.stdout.write(`  ⏱  ${ep.nombre.padEnd(28)} `);

    // ANTES (sin compresión)
    const antes   = await peticion(token, ep.ruta, true);
    // DESPUÉS (con gzip)
    const despues = await peticion(token, ep.ruta, false);

    const ratio = despues.bytes / antes.bytes;
    filas.push({ ep, antes, despues, ratio });
    totalAntes   += antes.bytes;
    totalDespues += despues.bytes;
    totalMsAntes   += antes.ms;
    totalMsDespues += despues.ms;

    console.log(`${formatBytes(antes.bytes).padStart(9)} → ${formatBytes(despues.bytes).padStart(9)}  ${pct(antes.bytes, despues.bytes)}`);
  }

  // 3. Tabla completa
  console.log('\n');
  console.log('┌──────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                         TABLA COMPARATIVA DETALLADA                                  │');
  console.log('├──────────────────────┬────────────┬────────────┬─────────────┬────────────┬──────────┤');
  console.log('│ Endpoint             │ ANTES      │ DESPUÉS    │ Reducción   │ CO₂ ANTES  │ CO₂ DPS  │');
  console.log('│                      │ (bytes)    │ (bytes gz) │             │ (mg)       │ (mg)     │');
  console.log('├──────────────────────┼────────────┼────────────┼─────────────┼────────────┼──────────┤');

  for (const { ep, antes, despues } of filas) {
    const nombre = ep.nombre.substring(0, 20).padEnd(20);
    const bA     = formatBytes(antes.bytes).padStart(10);
    const bD     = formatBytes(despues.bytes).padStart(10);
    const red    = pct(antes.bytes, despues.bytes).padStart(11);
    const cA     = co2mg(antes.bytes).padStart(10);
    const cD     = co2mg(despues.bytes).padStart(8);
    console.log(`│ ${nombre} │ ${bA} │ ${bD} │ ${red} │ ${cA} │ ${cD} │`);
  }

  console.log('├──────────────────────┼────────────┼────────────┼─────────────┼────────────┼──────────┤');
  const rTot  = pct(totalAntes, totalDespues).padStart(11);
  const cTotA = co2mg(totalAntes).padStart(10);
  const cTotD = co2mg(totalDespues).padStart(8);
  console.log(`│ TOTAL SESIÓN         │ ${formatBytes(totalAntes).padStart(10)} │ ${formatBytes(totalDespues).padStart(10)} │ ${rTot} │ ${cTotA} │ ${cTotD} │`);
  console.log('└──────────────────────┴────────────┴────────────┴─────────────┴────────────┴──────────┘');

  // 4. Barras visuales
  console.log('\n  📊 VISUALIZACIÓN DE REDUCCIÓN POR ENDPOINT\n');
  for (const { ep, antes, despues, ratio } of filas) {
    const pctVal = ((1 - ratio) * 100).toFixed(0);
    console.log(`  ${ep.nombre.padEnd(28)} ${bar(ratio)} ${pctVal}% menos`);
  }

  // 5. Resumen ejecutivo
  const totalReducPct = ((totalAntes - totalDespues) / totalAntes * 100).toFixed(1);
  const totalReducKB  = ((totalAntes - totalDespues) / 1024).toFixed(1);
  const co2AhorradoMg = ((totalAntes - totalDespues) * CO2_PER_BYTE_MG).toFixed(4);
  const msAhorrado    = totalMsAntes - totalMsDespues;

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   RESUMEN EJECUTIVO                          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Datos transferidos ANTES  : ${formatBytes(totalAntes).padStart(10)}                   ║`);
  console.log(`║  Datos transferidos DESPUÉS: ${formatBytes(totalDespues).padStart(10)}                   ║`);
  console.log(`║  Reducción de red          : ${(totalReducKB + ' KB').padStart(10)} (${totalReducPct}% menos) ║`);
  console.log(`║  CO₂ ahorrado por sesión   : ${(co2AhorradoMg + ' mg').padStart(10)}                   ║`);
  console.log(`║  Tiempo ahorrado por sesión: ${(msAhorrado + ' ms').padStart(10)}                   ║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Proyección anual (100 sesiones/día × 365 días):             ║`);
  const co2AnualMg = (parseFloat(co2AhorradoMg) * 100 * 365).toFixed(1);
  const co2AnualG  = (parseFloat(co2AhorradoMg) * 100 * 365 / 1000).toFixed(3);
  console.log(`║    CO₂ ahorrado: ${(co2AnualMg + ' mg').padStart(12)} = ${co2AnualG} g CO₂/año  ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n  ✅ Medición completada con datos reales del servidor SIMA.\n');
}

main().catch((err) => {
  console.error('\n  ❌ Error inesperado:', err.message);
  process.exit(1);
});
