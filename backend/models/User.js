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
    index: true,
  },
  carrera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera',
    index: true,
  },
  carrerasEnsenadas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera'
  }],
  cicloActual: {
    type: Number,
    default: 1,
  },
  turnoDisponibilidad: {
    type: String,
    enum: ['Mañana', 'Tarde', 'Noche', 'Completo'],
    default: 'Completo',
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  }
});

// Índice compuesto: optimiza consultas rol + carrera (ej: estudiantes por carrera)
userSchema.index({ rol: 1, carrera: 1 });

module.exports = mongoose.model('User', userSchema);
