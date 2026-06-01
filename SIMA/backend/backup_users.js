/**
 * Backup de la colección Users de SIMA → sima_db_backup/users.json
 * Uso: node backup_users.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'sima_db_backup');
const BACKUP_FILE = path.join(BACKUP_DIR, 'users.json');

async function backup() {
  try {
    // 1. Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conexión exitosa');

    // 2. Traer todos los documentos de la colección 'users' en bruto
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log(`📋 ${users.length} usuarios encontrados`);

    // 3. Crear el directorio de backup si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // 4. Guardar el JSON con metadata de la exportación
    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        collection: 'users',
        totalDocuments: users.length,
        database: mongoose.connection.db.databaseName,
      },
      data: users
    };

    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`💾 Backup guardado en: ${BACKUP_FILE}`);
    console.log(`📦 Total de documentos respaldados: ${users.length}`);

  } catch (err) {
    console.error('❌ Error al realizar el backup:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada. Backup completado con éxito.');
  }
}

backup();
