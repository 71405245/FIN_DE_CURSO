require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'sima_db_backup');

async function importDatabase() {
  try {
    console.log('Iniciando importación desde el respaldo de tu compañero...');
    
    // 1. Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
    console.log('Conectado a MongoDB.');

    if (!fs.existsSync(BACKUP_DIR)) {
      console.error('No se encontró la carpeta de respaldo en:', BACKUP_DIR);
      process.exit(1);
    }

    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(BACKUP_DIR, file);
      
      console.log(`\nProcesando: ${file}...`);
      const fileData = fs.readFileSync(filePath, 'utf8');
      if (!fileData.trim()) continue;

      const data = JSON.parse(fileData);

      // Limpiar colección si existe para evitar duplicados
      try {
        await mongoose.connection.db.dropCollection(collectionName);
        console.log(` -> Limpiando colección anterior...`);
      } catch (err) {
        // La colección no existía previamente, todo bien.
      }

      if (data.length > 0) {
        // Convertir strings de 24 caracteres a ObjectIds nativos de MongoDB
        data.forEach(doc => {
          if (doc._id && typeof doc._id === 'string' && doc._id.length === 24) doc._id = new mongoose.Types.ObjectId(doc._id);
          if (doc.carrera && typeof doc.carrera === 'string' && doc.carrera.length === 24) doc.carrera = new mongoose.Types.ObjectId(doc.carrera);
          if (doc.curso && typeof doc.curso === 'string' && doc.curso.length === 24) doc.curso = new mongoose.Types.ObjectId(doc.curso);
          if (doc.docente && typeof doc.docente === 'string' && doc.docente.length === 24) doc.docente = new mongoose.Types.ObjectId(doc.docente);
          
          if (Array.isArray(doc.estudiantesMatriculados)) {
            doc.estudiantesMatriculados = doc.estudiantesMatriculados.map(e => 
              (typeof e === 'string' && e.length === 24) ? new mongoose.Types.ObjectId(e) : e
            );
          }
          if (Array.isArray(doc.carrerasEnsenadas)) {
             doc.carrerasEnsenadas = doc.carrerasEnsenadas.map(c => 
              (typeof c === 'string' && c.length === 24) ? new mongoose.Types.ObjectId(c) : c
            );
          }
        });

        // Insertar en lotes de a 5000 para no saturar la memoria
        const BATCH_SIZE = 5000;
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
          const batch = data.slice(i, i + BATCH_SIZE);
          await mongoose.connection.db.collection(collectionName).insertMany(batch);
        }
        console.log(`[EXITO] Se importaron ${data.length} registros a '${collectionName}'.`);
      }
    }

    console.log('\n======================================================');
    console.log('¡Importación finalizada con éxito!');
    console.log('Tu base de datos ahora es idéntica a la del respaldo.');
    console.log('Ya puedes iniciar sesión con las credenciales de alumno.');
    console.log('======================================================\n');

  } catch (error) {
    console.error('\n[ERROR] Hubo un problema al importar:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

importDatabase();
