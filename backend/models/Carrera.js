const mongoose = require('mongoose');

const carreraSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
  },
  descripcion: {
    type: String,
  }
});

module.exports = mongoose.model('Carrera', carreraSchema);
