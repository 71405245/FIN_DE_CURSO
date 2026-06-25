const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sima_db';

async function updateAdmins() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.collection('users');
    
    const salt = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash('admin', salt);
    
    const salt2 = await bcrypt.genSalt(10);
    const hash2 = await bcrypt.hash('admin2', salt2);
    
    const result1 = await db.updateOne({ email: 'admin@sima.com' }, { $set: { password: hash1 } });
    console.log('Admin 1 (admin@sima.com) modificado:', result1.modifiedCount);
    
    const result2 = await db.updateOne({ email: 'admin2@sima.com' }, { $set: { password: hash2 } });
    if (result2.matchedCount === 0) {
        console.log('Admin 2 no existe. Creando desde cero...');
        await db.insertOne({
            email: 'admin2@sima.com',
            nombre: 'Administrador',
            apellidos: 'Planificación',
            password: hash2,
            rol: 'ADMIN',
            fechaRegistro: new Date(),
            carrerasEnsenadas: [],
            cicloActual: 1
        });
        console.log('Admin 2 (admin2@sima.com) creado con exito.');
    } else {
        console.log('Admin 2 (admin2@sima.com) modificado:', result2.modifiedCount);
    }
    
    console.log('Contraseñas forzadas directamente en la base de datos!');
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}

updateAdmins();
