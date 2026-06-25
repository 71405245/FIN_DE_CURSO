require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'sima_db_backup');

async function exportDatabase() {
  try {
    // 1. Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
    console.log('Conectado a la base de datos para exportación.');

    // 2. Crear carpeta de backup si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // 3. Obtener todas las colecciones de la BD
    const collections = await mongoose.connection.db.collections();
    
    if (collections.length === 0) {
      console.log('La base de datos está vacía, no hay colecciones para exportar.');
    }

    // 4. Exportar cada colección a un archivo JSON
    for (let collection of collections) {
      const collectionName = collection.collectionName;
      const data = await collection.find({}).toArray();
      
      const filePath = path.join(BACKUP_DIR, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`[EXITO] Colección '${collectionName}' exportada (${data.length} documentos).`);
    }

    console.log(`\n¡Respaldo completo! Los archivos se guardaron en la carpeta:`);
    console.log(BACKUP_DIR);

  } catch (error) {
    console.error('[ERROR] Falló la exportación:', error);
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect();
    console.log('Conexión cerrada.');
    process.exit(0);
  }
}

exportDatabase();
