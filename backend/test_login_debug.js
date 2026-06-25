/**
 * Debug de login: prueba directa contra MongoDB + bcrypt
 * Uso: node test_login_debug.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const http = require('http');

const EMAIL = 'admin@sima.com';
const PASSWORD = 'admin';

async function debugLogin() {
  console.log('\n========== DEBUG LOGIN ==========');
  console.log(`Email:    ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);

  // 1. Conectar a MongoDB y buscar usuario directo
  console.log('\n[1] Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
  console.log('    ✅ Conectado:', mongoose.connection.db.databaseName);

  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: EMAIL });

  if (!user) {
    console.log('    ❌ Usuario NO encontrado en la BD');
    await mongoose.disconnect();
    return;
  }

  console.log(`\n[2] Usuario encontrado:`);
  console.log(`    _id:      ${user._id}`);
  console.log(`    email:    ${user.email}`);
  console.log(`    rol:      ${user.rol}`);
  console.log(`    password: ${user.password}`);

  // 2. Verificar bcrypt manualmente
  console.log('\n[3] Verificando contraseña con bcrypt...');
  const match = await bcrypt.compare(PASSWORD, user.password);
  console.log(`    bcrypt.compare("${PASSWORD}", hash) => ${match ? '✅ MATCH' : '❌ NO MATCH'}`);

  await mongoose.disconnect();

  // 3. Hacer POST al endpoint de login
  console.log('\n[4] Haciendo POST a http://localhost:5001/api/auth/login ...');
  const body = JSON.stringify({ email: EMAIL, password: PASSWORD });

  await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`    HTTP Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log('    Respuesta:', JSON.stringify(json, null, 4));
        } catch {
          console.log('    Respuesta (raw):', data);
        }
        resolve();
      });
    });
    req.on('error', e => {
      console.log('    ❌ Error de conexión al backend:', e.message);
      resolve();
    });
    req.write(body);
    req.end();
  });

  console.log('\n========== FIN DEBUG ==========\n');
}

debugLogin().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
