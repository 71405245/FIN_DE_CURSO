const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const auth = require('../middleware/auth');

router.get('/secciones-disponibles', auth, estudianteController.getSeccionesDisponibles);
router.get('/mis-secciones', auth, estudianteController.misSecciones);
router.post('/matricular', auth, estudianteController.matricular);

module.exports = router;
