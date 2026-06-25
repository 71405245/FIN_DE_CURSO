const mongoose = require('mongoose');

const preferenciaSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Preferencias de horarios (array de bloques HH:MM)
  horariosPreferidos: [{ type: String }],
  // Días libres (ej. ['Viernes','Sábado'])
  diasLibre: [{ type: String }],
  // Docentes favoritos (referencia a usuarios con rol DOCENTE)
  docentesFavoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Otros campos personalizados
  notas: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Preferencia', preferenciaSchema);
