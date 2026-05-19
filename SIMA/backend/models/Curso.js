const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  creditos: {
    type: Number,
    required: true,
  },
  carrera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera',
    required: true,
    index: true,
  },
  ciclo: {
    type: Number,
    required: true,
  },
  // Códigos de cursos prerrequisito (ej: ["MAT101", "CS101"])
  prerrequisitos: {
    type: [String],
    default: [],
  },
  // Área académica (ej: "Formación General", "Especialidad", "Electivo")
  area: {
    type: String,
    trim: true,
  },
  // Tipo de curso (ej: "Obligatorio", "Electivo", "Libre")
  tipo: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Índice compuesto: acelera filtrar cursos por carrera y ordenarlos por ciclo
cursoSchema.index({ carrera: 1, ciclo: 1 });

module.exports = mongoose.model('Curso', cursoSchema);
