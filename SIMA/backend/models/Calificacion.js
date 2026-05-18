const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true,
  },
  seccion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seccion',
    required: true,
  },
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nota: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
  },
  // true si nota >= 11 (escala vigesimal peruana)
  aprobado: {
    type: Boolean,
    default: false,
  },
  periodo: {
    type: String, // Ej: "2025-I", "2025-II"
  },
  comentarios: {
    type: String,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

// Calcular automáticamente si aprobó antes de guardar
calificacionSchema.pre('save', function (next) {
  this.aprobado = this.nota > 10.5;
  next();
});

module.exports = mongoose.model('Calificacion', calificacionSchema);
