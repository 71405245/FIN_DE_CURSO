const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    required: true, // Quien califica
  },
  nota: {
    type: Number,
    required: true,
  },
  comentarios: {
    type: String,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Calificacion', calificacionSchema);
