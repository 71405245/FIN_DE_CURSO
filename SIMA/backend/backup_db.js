const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sima_db';
const backupDir = path.join(__dirname, '..', 'sima_db_backup');

async function backup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB para respaldar datos...');

    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const collections = ['carreras', 'users', 'cursos', 'seccions', 'calificacions'];

    for (const collName of collections) {
      const dbColl = mongoose.connection.collection(collName);
      const data = await dbColl.find({}).toArray();
      
      const filePath = path.join(backupDir, `${collName}.json`);
      
      // Serialize to match previous backup format
      const jsonString = JSON.stringify(data, (key, value) => {
        // Handle ObjectId
        if (value && typeof value === 'object' && value.toString && value.constructor && value.constructor.name === 'ObjectId') {
          return value.toString();
        }
        return value;
      }, 2);
      
      fs.writeFileSync(filePath, jsonString, 'utf8');
      console.log(`✅ Exportados ${data.length} registros de la coleccion '${collName}'`);
    }
    
    console.log('🎉 Base de datos respaldada correctamente en sima_db_backup!');
  } catch (error) {
    console.error('❌ Error respaldando la base de datos:', error);
  } finally {
    mongoose.connection.close();
  }
}

backup();
