const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellidos: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    enum: ['ADMIN', 'ESTUDIANTE', 'DOCENTE'],
    default: 'ESTUDIANTE',
  },
  carrera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera',
  },
  carrerasEnsenadas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera'
  }],
  cicloActual: {
    type: Number,
    default: 1,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', userSchema);
