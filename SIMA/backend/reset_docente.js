const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sima_db');

const userSchema = new mongoose.Schema({
  nombre: String, apellidos: String, email: String, password: String, rol: String
});
const User = mongoose.model('User', userSchema);

async function setDocentePass() {
  const docente = await User.findOne({ rol: 'DOCENTE' });
  if (docente) {
    const salt = await bcrypt.genSalt(10);
    docente.password = await bcrypt.hash('123456789', salt);
    await docente.save();
    console.log("DOCENTE_EMAIL=" + docente.email);
    console.log("DOCENTE_NOMBRE=" + docente.nombre + " " + docente.apellidos);
  } else {
    console.log("NO_DOCENTE_FOUND");
  }
  process.exit(0);
}
setDocentePass();
