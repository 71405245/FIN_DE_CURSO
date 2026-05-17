const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const auth = require('../middleware/auth');

router.get('/secciones-disponibles', auth, estudianteController.getSeccionesDisponibles);
router.get('/mis-secciones', auth, estudianteController.misSecciones);
router.post('/matricular', auth, estudianteController.matricular);
router.get('/perfil', auth, estudianteController.getPerfil);
router.get('/plan-estudios', auth, estudianteController.getPlanEstudios);
router.get('/historial', auth, estudianteController.getHistorial);
router.post('/generar-horario-ia', auth, estudianteController.generarHorarioIA);
router.get('/horario-pdf', auth, estudianteController.downloadHorarioPDF);

module.exports = router;
