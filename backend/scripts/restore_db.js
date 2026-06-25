const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sima_db';
const backupDir = path.join(__dirname, '..', 'sima_db_backup');

async function restore() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB para restaurar datos...');

    const collections = ['carreras', 'users', 'cursos', 'seccions', 'calificacions'];

    for (const collName of collections) {
      const filePath = path.join(backupDir, `${collName}.json`);
      if (!fs.existsSync(filePath)) {
          console.warn(`Archivo ${filePath} no encontrado, saltando...`);
          continue;
      }

      const rawData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawData);

      const dbColl = mongoose.connection.collection(collName);
      
      try { await dbColl.drop(); } catch (e) {}
      
      if (data.length > 0) {
        // Conversión recursiva de strings de 24 hex chars a ObjectId y strings ISO a Date
        const convertToObjectId = (obj) => {
          for (let key in obj) {
            if (obj[key] !== null && typeof obj[key] === 'object') {
              convertToObjectId(obj[key]);
            } else if (typeof obj[key] === 'string' && /^[0-9a-fA-F]{24}$/.test(obj[key])) {
              // Convertir a ObjectId
              obj[key] = new mongoose.Types.ObjectId(obj[key]);
            } else if (typeof obj[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(obj[key])) {
              obj[key] = new Date(obj[key]);
            }
          }
        };

        data.forEach(convertToObjectId);
        await dbColl.insertMany(data);
        console.log(`✅ Restaurados ${data.length} registros en la coleccion '${collName}'`);
      } else {
        console.log(`⚠️ Coleccion '${collName}' sin registros (0).`);
      }
    }
    
    console.log('🎉 Base de datos restaurada correctamente!');
  } catch (error) {
    console.error('❌ Error restaurando la base de datos:', error);
  } finally {
    mongoose.connection.close();
  }
}

restore();
