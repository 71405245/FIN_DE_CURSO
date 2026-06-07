/**
 * Reemplaza todas las URLs http://localhost:5000 por rutas relativas /api/...
 * en todos los archivos .jsx y .js del frontend/src
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OLD = 'http://localhost:5000';
const NEW = '';  // URL relativa — el proxy de Vite lo redirige a 5001

let totalFiles = 0;
let modifiedFiles = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      totalFiles++;
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes(OLD)) {
        const updated = content.split(OLD).join(NEW);
        fs.writeFileSync(fullPath, updated, 'utf-8');
        modifiedFiles++;
        console.log(`✅ Actualizado: ${path.relative(SRC_DIR, fullPath)}`);
      }
    }
  }
}

console.log(`🔍 Procesando archivos en ${SRC_DIR}...\n`);
processDir(SRC_DIR);
console.log(`\n✨ Listo: ${modifiedFiles} archivo(s) modificado(s) de ${totalFiles} revisados.`);
