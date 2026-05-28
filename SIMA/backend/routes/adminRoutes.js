const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const planificacionController = require('../controllers/planificacionController');

// Planificación de Horarios
router.get('/planificacion/stats', planificacionController.getStats);


// Recursos / Sistema
router.get('/recursos', adminController.getRecursos);

// Carreras
router.post('/carreras', adminController.createCarrera);
router.get('/carreras', adminController.getCarreras);
router.put('/carreras/:id', adminController.updateCarrera);
router.delete('/carreras/:id', adminController.deleteCarrera);

// Estudiantes
router.post('/estudiantes', adminController.createEstudiante);
router.post('/estudiantes/importar', adminController.importarEstudiantes);
router.get('/estudiantes', adminController.getEstudiantes);
router.put('/estudiantes/:id', adminController.updateEstudiante);
router.delete('/estudiantes/:id', adminController.deleteEstudiante);

// Docentes
router.post('/docentes', adminController.createDocente);
router.get('/docentes', adminController.getDocentes);
router.put('/docentes/:id', adminController.updateDocente);
router.delete('/docentes/:id', adminController.deleteDocente);

// Cursos
router.post('/cursos', adminController.createCurso);
router.get('/cursos', adminController.getCursos);
router.put('/cursos/:id', adminController.updateCurso);
router.delete('/cursos/:id', adminController.deleteCurso);

// Secciones
router.post('/secciones', adminController.createSeccion);
router.get('/secciones', adminController.getSecciones);
router.put('/secciones/:id', adminController.updateSeccion);
router.delete('/secciones/:id', adminController.deleteSeccion);

module.exports = router;
