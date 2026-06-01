require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function debug() {
  console.log('\n=== DEBUG LOGIN ===');
  console.log('MONGO_URI:', process.env.MONGO_URI);
  
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB conectado\n');

  const emails = ['admin@sima.com', 'admin2@sima.com'];

  for (const email of emails) {
    console.log(`--- ${email} ---`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('  ❌ Usuario NO encontrado en BD');
      continue;
    }

    console.log('  ✅ Usuario encontrado');
    console.log('  ROL:', user.rol);
    console.log('  Hash en BD:', user.password ? user.password.substring(0, 30) + '...' : 'NULL');

    // Probar bcrypt directamente
    const match = await bcrypt.compare('admin123', user.password);
    console.log('  bcrypt.compare("admin123") =>', match ? '✅ MATCH' : '❌ NO MATCH');

    if (!match) {
      console.log('\n  🔧 Reparando hash...');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash('admin123', salt);
      console.log('  Nuevo hash generado:', newHash.substring(0, 30) + '...');
      
      // Actualizar directamente en BD sin pasar por Mongoose model
      await User.updateOne({ email }, { $set: { password: newHash } });
      console.log('  ✅ Hash actualizado en BD via updateOne');

      // Verificar
      const userUpdated = await User.findOne({ email });
      const matchAfter = await bcrypt.compare('admin123', userUpdated.password);
      console.log('  Verificación post-repair:', matchAfter ? '✅ AHORA FUNCIONA' : '❌ SIGUE FALLANDO');
    }
    console.log('');
  }

  await mongoose.disconnect();
  console.log('=== FIN DEBUG ===\n');
  process.exit(0);
}

debug().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
