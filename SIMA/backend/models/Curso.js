const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  creditos: {
    type: Number,
    required: true,
  },
  carrera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera',
    required: true,
  },
  ciclo: {
    type: Number,
    required: true,
  },
  descripcion: {
    type: String,
  }
});

module.exports = mongoose.model('Curso', cursoSchema);
