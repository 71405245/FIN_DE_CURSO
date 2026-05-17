const mongoose = require('mongoose');

const seccionSchema = new mongoose.Schema({
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true,
  },
  codigoSeccion: {
    type: String,
    required: true,
  },
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Asignado por el Admin
  },
  horario: {
    type: String, // Ej: "Lunes y Miércoles 10:00 - 12:00"
    required: true,
  },
  dias: {
    type: [String], // Ej: ["Lunes", "Miércoles"]
    default: [],
  },
  horaInicio: {
    type: String, // Ej: "10:00"
  },
  horaFin: {
    type: String, // Ej: "12:00"
  },
  aula: {
    type: String, // Ej: "Pabellon B - 301"
    required: true,
  },
  cupoMaximo: {
    type: Number,
    default: 30, // Limite solicitado: 25 a 30
  },
  estudiantesMatriculados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Seccion', seccionSchema);
