const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');
const auth = require('../middleware/auth');

router.get('/mis-secciones', auth, docenteController.misSecciones);
router.post('/calificar', auth, docenteController.calificar);

module.exports = router;
