const estudianteController = require('../controllers/estudianteController');
const Calificacion = require('../models/Calificacion');
const Seccion = require('../models/Seccion');
const User = require('../models/User');

jest.mock('../models/Calificacion');
jest.mock('../models/Seccion');
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
});
