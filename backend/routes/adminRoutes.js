const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const planificacionController = require('../controllers/planificacionController');

// Planificación de Horarios
router.get('/planificacion/stats', planificacionController.getPlanificacionStats);
router.get('/planificacion/carga-horaria', planificacionController.getCargaHoraria);
router.get('/planificacion/docentes-disponibles', planificacionController.getDocentesDisponibles);
router.put('/planificacion/seccion/:id/reasignar', planificacionController.reasignarDocente);
router.put('/planificacion/seccion/:id/liberar', planificacionController.liberarSeccion);
router.put('/planificacion/seccion/:id/horario', planificacionController.editarHorarioSeccion);


const auth = require('../middleware/auth');

// [OPTIMIZACIÓN 8] Rate Limiter personalizado en memoria - Green Code (sin dependencias adicionales)
const rateLimitMap = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const limitWindow = 60000; // 1 minuto
  const maxRequests = 20; // 20 requests por minuto para el monitoreo de recursos

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip).filter(timestamp => now - timestamp < limitWindow);
  if (requests.length >= maxRequests) {
    return res.status(429).json({ msg: 'Demasiadas peticiones. Por favor intente más tarde.' });
  }

  requests.push(now);
  rateLimitMap.set(ip, requests);
  next();
};

// [OPTIMIZACIÓN 6] Endpoint consolidado de estadísticas (1 petición en vez de 5)
router.get('/stats/counts', adminController.getStatsCounts);

// Environmental Impact Dashboard — métricas de impacto ambiental del APM
router.get('/environmental-impact', adminController.getEnvironmentalImpact);


// Recursos / Sistema (Con seguridad JWT y Rate Limiting)
router.get('/recursos', auth, rateLimiter, adminController.getRecursos);

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
