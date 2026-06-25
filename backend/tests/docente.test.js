const docenteController = require('../controllers/docenteController');
const Seccion = require('../models/Seccion');
const Calificacion = require('../models/Calificacion');

jest.mock('../models/Seccion');
jest.mock('../models/Calificacion');

describe('Docente Controller (Gestión de Clases y Notas)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'doc_987' },
      body: {},
      params: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('misSecciones', () => {
    it('21. Debe retornar las secciones asignadas al docente con populate y lean', async () => {
      const mockSecciones = [
        { _id: 'sec1', codigoSeccion: 'S1', docente: 'doc_987', curso: { nombre: 'Cálculo I' } },
        { _id: 'sec2', codigoSeccion: 'S2', docente: 'doc_987', curso: { nombre: 'Álgebra' } }
      ];

      // Simulamos la cadena find().populate().populate().lean()
      const mockLean = jest.fn().mockResolvedValue(mockSecciones);
      const mockPopulate2 = jest.fn().mockReturnValue({ lean: mockLean });
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Seccion.find.mockReturnValue({ populate: mockPopulate1 });

      await docenteController.misSecciones(req, res);

      expect(Seccion.find).toHaveBeenCalledWith({ docente: 'doc_987' });
      expect(res.json).toHaveBeenCalledWith(mockSecciones);
    });
  });

  describe('calificar', () => {
    it('22. Debe retornar 400 si la nota es inválida (fuera del rango 0-20 o NaN)', async () => {
      // Caso 1: nota mayor a 20
      req.body = { estudianteId: 'est1', seccionId: 'sec1', nota: '25', comentarios: 'Exceso' };
      await docenteController.calificar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'La nota debe ser un número entre 0 y 20.' });

      // Caso 2: nota menor a 0
      req.body = { estudianteId: 'est1', seccionId: 'sec1', nota: '-2', comentarios: 'Negativo' };
      await docenteController.calificar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Caso 3: nota NaN
      req.body = { estudianteId: 'est1', seccionId: 'sec1', nota: 'abc', comentarios: 'Letras' };
      await docenteController.calificar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('23. Debe retornar 404 si la sección no existe en la base de datos', async () => {
      req.body = { estudianteId: 'est1', seccionId: 'nonexistent', nota: '15', comentarios: 'OK' };
      Seccion.findById.mockResolvedValue(null);

      await docenteController.calificar(req, res);

      expect(Seccion.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Sección no encontrada' });
    });

    it('24. Debe retornar 400 si la sección está corrupta (no tiene curso asociado)', async () => {
      req.body = { estudianteId: 'est1', seccionId: 'sec_corrupt', nota: '15', comentarios: 'OK' };
      Seccion.findById.mockResolvedValue({ _id: 'sec_corrupt', curso: null });

      await docenteController.calificar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Esta sección está corrupta (no tiene curso asociado).' });
    });

    it('25. Debe crear una nueva calificación si no existía previamente para el estudiante y sección', async () => {
      req.body = { estudianteId: 'est1', seccionId: 'sec1', nota: '18', comentarios: 'Buen trabajo' };
      
      const mockSeccion = { _id: 'sec1', curso: 'curso_123' };
      Seccion.findById.mockResolvedValue(mockSeccion);
      Calificacion.findOne.mockResolvedValue(null);

      // Mockear el constructor de Calificacion
      const saveMock = jest.fn().mockResolvedValue(true);
      Calificacion.mockImplementation(() => {
        return {
          save: saveMock,
          estudiante: 'est1',
          seccion: 'sec1',
          curso: 'curso_123',
          docente: 'doc_987',
          nota: 18,
          comentarios: 'Buen trabajo'
        };
      });

      await docenteController.calificar(req, res);

      expect(Calificacion.findOne).toHaveBeenCalledWith({ estudiante: 'est1', seccion: 'sec1' });
      expect(saveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Calificación registrada'
      }));
    });

    it('26. Debe actualizar la calificación existente si ya existía en la base de datos', async () => {
      req.body = { estudianteId: 'est1', seccionId: 'sec1', nota: '16', comentarios: 'Corregido' };

      const mockSeccion = { _id: 'sec1', curso: 'curso_123' };
      const mockCalificacion = {
        estudiante: 'est1',
        seccion: 'sec1',
        nota: 12,
        comentarios: 'Viejo',
        docente: 'doc_old',
        save: jest.fn().mockResolvedValue(true)
      };

      Seccion.findById.mockResolvedValue(mockSeccion);
      Calificacion.findOne.mockResolvedValue(mockCalificacion);

      await docenteController.calificar(req, res);

      expect(mockCalificacion.nota).toBe(16);
      expect(mockCalificacion.comentarios).toBe('Corregido');
      expect(mockCalificacion.docente).toBe('doc_987');
      expect(mockCalificacion.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Calificación actualizada',
        calificacion: mockCalificacion
      }));
    });
  });

  describe('getCalificacionesSeccion', () => {
    it('27. Debe retornar el listado de calificaciones asociadas a la sección', async () => {
      req.params = { seccionId: 'sec1' };
      const mockCalificaciones = [
        { _id: 'cal1', estudiante: 'est1', nota: 15 },
        { _id: 'cal2', estudiante: 'est2', nota: 18 }
      ];

      Calificacion.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCalificaciones)
      });

      await docenteController.getCalificacionesSeccion(req, res);

      expect(Calificacion.find).toHaveBeenCalledWith({ seccion: 'sec1' });
      expect(res.json).toHaveBeenCalledWith(mockCalificaciones);
    });
  });
});
