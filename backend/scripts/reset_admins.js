require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function reset() {
  try {
    console.log('🔌 Conectando a MongoDB para reestablecer administradores...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');
    console.log('✅ Conexión establecida.');

    const password = '123456789';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Reset Admin 1
    const admin1Email = 'admin@sima.com';
    let admin1 = await User.findOne({ email: admin1Email });
    if (admin1) {
      admin1.password = hashedPassword;
      admin1.rol = 'ADMIN';
      await admin1.save();
      console.log(`🛠️ Contraseña actualizada para el administrador principal existente: ${admin1Email}`);
    } else {
      admin1 = new User({
        nombre: 'Administrador',
        apellidos: 'Principal',
        email: admin1Email,
        password: hashedPassword,
        rol: 'ADMIN'
      });
      await admin1.save();
      console.log(`✨ Creado nuevo administrador principal: ${admin1Email}`);
    }

    // 2. Reset Admin 2
    const admin2Email = 'admin2@sima.com';
    let admin2 = await User.findOne({ email: admin2Email });
    if (admin2) {
      admin2.password = hashedPassword;
      admin2.rol = 'ADMIN';
      await admin2.save();
      console.log(`🛠️ Contraseña actualizada para el administrador de planificación existente: ${admin2Email}`);
    } else {
      admin2 = new User({
        nombre: 'Administrador',
        apellidos: 'Planificación',
        email: admin2Email,
        password: hashedPassword,
        rol: 'ADMIN'
      });
      await admin2.save();
      console.log(`✨ Creado nuevo administrador de planificación: ${admin2Email}`);
    }

    console.log('🎉 Administradores listos y habilitados con contraseña "123456789"!');
  } catch (err) {
    console.error('❌ Error al reestablecer administradores:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada.');
    process.exit(0);
  }
}

reset();
