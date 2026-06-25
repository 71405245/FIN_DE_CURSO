const estudianteController = require('../controllers/estudianteController');
const Calificacion = require('../models/Calificacion');
const Seccion = require('../models/Seccion');
const User = require('../models/User');
const Curso = require('../models/Curso');

jest.mock('../models/Calificacion');
jest.mock('../models/Seccion');
jest.mock('../models/User');
jest.mock('../models/Curso');
jest.mock('../models/User');

describe('Estudiante Controller (Restricciones y Perfil)', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 'est_123' } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getPerfil (Límite Dinámico de Créditos)', () => {
    it('18. Alumno Regular: Si no tiene jales activos de 3ra matricula, su límite es 22 CR', async () => {
      // Mock User
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ nombre: 'Ana', rol: 'ESTUDIANTE' })
      });

      // Mock Calificaciones (Todo aprobado)
      Calificacion.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { _id: 'c1', creditos: 4 }, aprobado: true },
          { curso: { _id: 'c2', creditos: 3 }, aprobado: true }
        ])
      });

      // Mock Secciones matriculadas = vacio
      Seccion.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      await estudianteController.getPerfil(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.esRestringido).toBe(false);
      expect(response.limiteCreditos).toBe(22);
      expect(response.creditosAprobados).toBe(7); // 4 + 3
    });

    it('19. Alumno Restringido: Si tiene 3 jales de un mismo curso y NO aprobado, límite 15 CR', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ nombre: 'Luis', rol: 'ESTUDIANTE' })
      });

      // Mock: jaló el curso "c1" 3 veces consecutivas
      Calificacion.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { _id: 'c1', creditos: 4 }, aprobado: false },
          { curso: { _id: 'c1', creditos: 4 }, aprobado: false },
          { curso: { _id: 'c1', creditos: 4 }, aprobado: false }
        ])
      });

      Seccion.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      await estudianteController.getPerfil(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.esRestringido).toBe(true);
      expect(response.limiteCreditos).toBe(15);
    });

    it('20. Alumno Recuperado: Si jaló 3 veces pero luego lo aprobó en 4ta, se levanta la sanción y límite es 22 CR', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ nombre: 'Pedro', rol: 'ESTUDIANTE' })
      });

      // Mock: jaló 3 veces, pero LA ÚLTIMA la aprobó
      Calificacion.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { _id: 'c1', creditos: 4 }, aprobado: false },
          { curso: { _id: 'c1', creditos: 4 }, aprobado: false },
          { curso: { _id: 'c1', creditos: 4 }, aprobado: false },
          { curso: { _id: 'c1', creditos: 4 }, aprobado: true } // RECUPERADO
        ])
      });

      Seccion.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      await estudianteController.getPerfil(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.esRestringido).toBe(false);
      expect(response.limiteCreditos).toBe(22);
    });
  });

  describe('getSeccionesDisponibles', () => {
    it('debe devolver secciones disponibles para el ciclo actual', async () => {
      User.findById.mockResolvedValue({ rol: 'ESTUDIANTE', carrera: 'ing', cicloActual: 1 });
      Curso.find.mockResolvedValue([{ _id: 'c1' }]);
      Seccion.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: 's1', curso: { _id: 'c1' }, estudiantesMatriculados: [], cupoMaximo: 20 }
        ])
      });

      await estudianteController.getSeccionesDisponibles(req, res);
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveLength(1);
    });
  });

  describe('matricular', () => {
    it('debe fallar si no hay cupo', async () => {
      req.body = { seccionId: 's1' };
      Seccion.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 's1',
          curso: { prerrequisitos: [] },
          estudiantesMatriculados: Array(20).fill('est_x'),
          cupoMaximo: 20
        })
      });

      await estudianteController.matricular(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'El salón no tiene cupos disponibles' });
    });

    it('debe matricular correctamente si hay cupo y no hay prerrequisitos pendientes', async () => {
      req.body = { seccionId: 's1' };
      const seccionMock = {
        _id: 's1',
        curso: { prerrequisitos: [] },
        estudiantesMatriculados: [],
        cupoMaximo: 20,
        save: jest.fn()
      };
      Seccion.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(seccionMock)
      });

      await estudianteController.matricular(req, res);
      expect(seccionMock.estudiantesMatriculados).toContain('est_123');
      expect(seccionMock.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Matrícula exitosa' }));
    });
  });

  describe('misSecciones y rectificar', () => {
    it('misSecciones debe devolver las secciones matriculadas', async () => {
      Seccion.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ _id: 's1' }])
      });
      await estudianteController.misSecciones(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('rectificar debe remover al estudiante de la seccion', async () => {
      req.body = { seccionId: 's1' };
      const seccionMock = {
        _id: 's1',
        estudiantesMatriculados: ['est_123', 'est_otro'],
        save: jest.fn()
      };
      Seccion.findById.mockResolvedValue(seccionMock);
      await estudianteController.rectificar(req, res);
      expect(seccionMock.estudiantesMatriculados).not.toContain('est_123');
      expect(seccionMock.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getHistorial y getPlanEstudios', () => {
    it('getHistorial debe devolver resumen de aprobados y jalados', async () => {
      Calificacion.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { curso: { nombre: 'Math', creditos: 4, ciclo: 1 }, nota: 15, aprobado: true }
        ])
      });
      await estudianteController.getHistorial(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('getPlanEstudios debe devolver estado de cursos', async () => {
      User.findById.mockResolvedValue({ carrera: 'ing' });
      Curso.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([{ _id: 'c1', nombre: 'Math' }]) });
      Calificacion.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ curso: 'c1', aprobado: true }]) });
      Seccion.find.mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) });
      
      await estudianteController.getPlanEstudios(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('generarHorarioIA', () => {
    it('debe generar horario óptimo', async () => {
      req.body = { turno: 'MIXTO', cantidadCursos: 2, diasPorSemana: 5 };
      User.findById.mockResolvedValue({ carrera: 'ing', cicloActual: 1 });
      Curso.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'c1', ciclo: 1 },
          { _id: 'c2', ciclo: 1 }
        ])
      });
      Calificacion.find.mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) });
      
      const s1 = { _id: 's1', curso: { _id: 'c1', nombre: 'c1', creditos: 3 }, estudiantesMatriculados: [], cupoMaximo: 20, dias: ['LU'], horaInicio: '08:00', horaFin: '10:00' };
      const s2 = { _id: 's2', curso: { _id: 'c2', nombre: 'c2', creditos: 4 }, estudiantesMatriculados: [], cupoMaximo: 20, dias: ['MA'], horaInicio: '08:00', horaFin: '10:00' };

      const seccionMock = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([s1, s2])
      };
      Seccion.find.mockReturnValue(seccionMock);

      await estudianteController.generarHorarioIA(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('debe manejar error si no hay cursos pendientes', async () => {
      req.body = { turno: 'MIXTO', cantidadCursos: 2, diasPorSemana: 5 };
      User.findById.mockResolvedValue({ carrera: 'ing', cicloActual: 1 });
      Curso.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }); 
      Calificacion.find.mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) });
      Seccion.find.mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) });

      await estudianteController.generarHorarioIA(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'No tienes cursos pendientes este ciclo.' }));
    });
  });
});
