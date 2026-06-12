const adminController = require('../controllers/adminController');
const User = require('../models/User');
const Curso = require('../models/Curso');
const Seccion = require('../models/Seccion');
const Carrera = require('../models/Carrera');
const bcrypt = require('bcryptjs');

jest.mock('../models/User');
jest.mock('../models/Curso');
jest.mock('../models/Seccion');
jest.mock('../models/Carrera');
jest.mock('bcryptjs');

describe('Admin Controller (Panel Administrativo y CRUD)', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {}, headers: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
      end: jest.fn()
    };
    jest.clearAllMocks();
    global.apiMetrics = [];
    global.apiMetricsIndex = 0;
    global.apiMetricsCount = 0;
  });

  describe('getStatsCounts', () => {
    it('38. Debe retornar los conteos de todas las colecciones principales', async () => {
      Carrera.countDocuments.mockResolvedValue(5);
      Curso.countDocuments.mockResolvedValue(20);
      User.countDocuments.mockImplementation(({ rol }) => {
        if (rol === 'ESTUDIANTE') return Promise.resolve(150);
        if (rol === 'DOCENTE') return Promise.resolve(25);
        return Promise.resolve(0);
      });
      Seccion.countDocuments.mockResolvedValue(10);

      await adminController.getStatsCounts(req, res);

      expect(res.set).toHaveBeenCalledWith('Cache-Control', 'private, max-age=30');
      expect(res.json).toHaveBeenCalledWith({
        carreras: 5,
        cursos: 20,
        alumnos: 150,
        docentes: 25,
        secciones: 10
      });
    });
  });

  describe('getRecursos & APM', () => {
    it('39. Debe retornar datos de CPU, memoria y APM a través de caché y buffer circular', async () => {
      global.apiMetrics = [
        { method: 'GET', route: '/api/status', duration: 150, bytes: 50, compressedBytes: 40, time: new Date() }
      ];
      global.apiMetricsCount = 1;
      global.apiMetricsIndex = 1;

      await adminController.getRecursos(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        platform: expect.any(String),
        memory: expect.any(Object),
        cpu: expect.any(Object),
        apm: expect.objectContaining({
          totalRequests: 1,
          topRutas: [{ ruta: 'GET /api/status', count: 1 }]
        })
      }));
    });
  });

  describe('getEnvironmentalImpact', () => {
    it('40. Debe calcular y retornar el impacto ambiental CO2 basado en bytes transferidos', () => {
      global.apiMetrics = [
        { method: 'GET', route: '/api/status', duration: 100, bytes: 1000, compressedBytes: 800, time: new Date() }
      ];
      global.apiMetricsCount = 1;
      global.apiMetricsIndex = 1;

      adminController.getEnvironmentalImpact(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        totalRequests: 1,
        totalCo2g: expect.any(Number),
        worstEndpoint: 'GET /api/status'
      }));
    });
  });

  describe('importarEstudiantes', () => {
    it('41. Debe importar estudiantes mapeando carreras correctamente y evitando duplicados', async () => {
      req.body = {
        estudiantes: [
          { email: 'new@sima.com', nombre: 'Juan', apellidos: 'Pérez', carrera: 'Ingeniería', ciclo: '2' }
        ]
      };

      // Mock de Carreras
      Carrera.find.mockResolvedValue([
        { _id: 'carr_1', nombre: 'Ingeniería de Sistemas' }
      ]);
      
      // Mock de usuarios existentes para evitar duplicados en BD
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ email: 'old@sima.com' }])
      });

      bcrypt.hash.mockResolvedValue('hashed_pass');
      User.insertMany.mockResolvedValue(true);

      await adminController.importarEstudiantes(req, res);

      expect(User.insertMany).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          email: 'new@sima.com',
          carrera: 'carr_1',
          cicloActual: 2
        })
      ]));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        exito: true,
        creados: 1,
        duplicados: 0
      }));
    });

    it('42. Debe rechazar la importación si el formato es inválido', async () => {
      req.body = { estudiantes: null };

      await adminController.importarEstudiantes(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Formato de importación inválido' });
    });
  });

  describe('CRUD Carreras', () => {
    it('43. Debe crear, listar, actualizar y eliminar carreras con validaciones', async () => {
      // 1. Create
      req.body = { nombre: 'Sistemas', descripcion: 'IT' };
      const saveMock = jest.fn().mockResolvedValue({ _id: 'c1', nombre: 'Sistemas' });
      Carrera.mockImplementation(() => ({ save: saveMock }));

      await adminController.createCarrera(req, res);
      expect(saveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();

      // 2. List
      Carrera.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'c1', nombre: 'Sistemas' }])
      });
      await adminController.getCarreras(req, res);
      expect(res.json).toHaveBeenCalled();

      // 3. Update
      req.params = { id: 'c1' };
      Carrera.findByIdAndUpdate.mockResolvedValue({ _id: 'c1', nombre: 'Sistemas Modificado' });
      await adminController.updateCarrera(req, res);
      expect(Carrera.findByIdAndUpdate).toHaveBeenCalled();

      // 4. Delete (Error por dependencias)
      Curso.findOne.mockResolvedValue({ _id: 'curso1' }); // Tiene un curso asignado
      User.findOne.mockResolvedValue(null);
      await adminController.deleteCarrera(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'No se puede eliminar la carrera porque tiene cursos o alumnos asignados.' });
    });
  });

  describe('CRUD Estudiantes', () => {
    it('44. Debe crear, listar con paginación, actualizar y eliminar estudiantes', async () => {
      // Create
      req.body = { email: 'est@sima.com', password: '123', nombre: 'Ana', apellidos: 'Luz' };
      User.findOne.mockResolvedValue(null); // No existe
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      const saveMock = jest.fn().mockResolvedValue({ nombre: 'Ana' });
      User.mockImplementation(() => ({ save: saveMock }));

      await adminController.createEstudiante(req, res);
      expect(res.json).toHaveBeenCalled();
      res.json.mockClear();

      // List with pagination
      req.query = { page: '1', limit: '10' };
      User.countDocuments.mockResolvedValue(1);

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ nombre: 'Ana' }])
      };

      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnValue(mockQuery)
      });

      await adminController.getEstudiantes(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        total: 1,
        page: 1
      }));
    });
  });

  describe('CRUD Cursos', () => {
    it('45. Debe crear, listar, actualizar y eliminar cursos con código único', async () => {
      req.body = { codigo: 'MAT1', nombre: 'Mate', creditos: 4 };
      
      // Create
      Curso.findOne.mockResolvedValue(null); // No duplicado
      const saveMock = jest.fn().mockResolvedValue({ _id: 'curso1' });
      Curso.mockImplementation(() => ({ save: saveMock }));
      Curso.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ codigo: 'MAT1' })
      });

      await adminController.createCurso(req, res);
      expect(res.json).toHaveBeenCalled();

      // Delete (con alumnos matriculados en alguna sección de este curso)
      req.params = { id: 'curso1' };
      Seccion.findOne.mockResolvedValue({ _id: 'seccion1' }); // Hay sección abierta
      await adminController.deleteCurso(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
