process.env.NODE_ENV = 'test';
const planificacionController = require('../controllers/planificacionController');
const Seccion = require('../models/Seccion');
const User = require('../models/User');

jest.mock('../models/Seccion');
jest.mock('../models/User');

describe('AI Planning Controller (Planificación y Carga Horaria)', () => {
  const { horaADecimal, calcularHorasSeccion, hayConflicto, estadoCarga } = planificacionController._helpers;
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('Helpers de Carga y Horarios', () => {
    it('28. horaADecimal: convierte HH:MM en decimal', () => {
      expect(horaADecimal('08:00')).toBe(8);
      expect(horaADecimal('08:30')).toBe(8.5);
      expect(horaADecimal('14:45')).toBe(14.75);
      expect(horaADecimal('')).toBe(0);
    });

    it('29. calcularHorasSeccion: calcula horas semanales', () => {
      // 2 horas por clase, 2 días a la semana = 4 horas
      expect(calcularHorasSeccion('08:00', '10:00', ['LU', 'MI'])).toBe(4);
      // 3 horas por clase, 3 días a la semana = 9 horas
      expect(calcularHorasSeccion('14:00', '17:00', ['LU', 'MI', 'VI'])).toBe(9);
      // Datos faltantes
      expect(calcularHorasSeccion('10:00', '08:00', ['LU'])).toBe(0);
    });

    it('30. hayConflicto: detecta colisiones de días y horas', () => {
      const s1 = { dias: ['LU', 'MI'], horaInicio: '08:00', horaFin: '10:00' };
      const s2 = { dias: ['MI', 'VI'], horaInicio: '09:00', horaFin: '11:00' }; // Colisiona el MI de 09:00 a 10:00
      const s3 = { dias: ['MA', 'JU'], horaInicio: '08:00', horaFin: '10:00' }; // Diferentes días
      const s4 = { dias: ['LU', 'MI'], horaInicio: '10:00', horaFin: '12:00' }; // Mismos días, secuencial

      expect(hayConflicto(s1, s2)).toBe(true);
      expect(hayConflicto(s1, s3)).toBe(false);
      expect(hayConflicto(s1, s4)).toBe(false);
    });

    it('31. estadoCarga: clasifica según horas acumuladas', () => {
      expect(estadoCarga(49)).toBe('exceso');
      expect(estadoCarga(48)).toBe('limite');
      expect(estadoCarga(40)).toBe('limite');
      expect(estadoCarga(39)).toBe('normal');
    });
  });

  describe('Métodos del Controlador', () => {
    it('32. getStats: retorna estadísticas agregadas de las secciones', async () => {
      const mockAggregatedSecciones = [
        {
          _id: 'sec1',
          codigoSeccion: 'S1',
          curso: 'curso1',
          docente: 'docente1',
          dias: ['LU', 'MI'],
          horaInicio: '08:00',
          horaFin: '10:00',
          aula: 'A101',
          cupoMaximo: 30,
          estudiantesMatriculadosCount: 25
        }
      ];

      Seccion.aggregate.mockResolvedValue(mockAggregatedSecciones);
      Seccion.populate.mockResolvedValue([
        {
          ...mockAggregatedSecciones[0],
          curso: { nombre: 'Matemática I', codigo: 'MAT1' },
          docente: { _id: 'docente1', nombre: 'Juan', apellidos: 'Pérez' }
        }
      ]);

      await planificacionController.getStats(req, res);

      expect(Seccion.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        kpis: expect.objectContaining({
          totalSecciones: 1,
          porcentajeOcupacion: 83
        })
      }));
    });

    it('33. getCargaHoraria: calcula carga horaria por docente', async () => {
      const mockSecciones = [
        {
          _id: 'sec1',
          codigoSeccion: 'S1',
          curso: { nombre: 'Física I' },
          docente: { _id: 'doc1', nombre: 'José', apellidos: 'Gómez', email: 'jose@sima.com' },
          dias: ['LU', 'MI'],
          horaInicio: '08:00',
          horaFin: '10:00',
          aula: 'Lab1'
        }
      ];

      Seccion.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockSecciones)
          })
        })
      });

      await planificacionController.getCargaHoraria(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        maxHoras: 48,
        docentes: expect.arrayContaining([
          expect.objectContaining({
            nombre: 'José Gómez',
            totalHoras: 4,
            estado: 'normal'
          })
        ])
      }));
    });

    it('34. getDocentesDisponibles: busca docentes sin cruces y con horas libres', async () => {
      req.query = { horaInicio: '08:00', horaFin: '10:00', dias: 'LU,MI' };

      const mockDocentes = [
        { _id: 'doc1', nombre: 'Carlos', apellidos: 'López', rol: 'DOCENTE' }
      ];
      const mockSecciones = [
        {
          _id: 'sec1',
          docente: 'doc1',
          dias: ['MA'],
          horaInicio: '08:00',
          horaFin: '10:00'
        }
      ];

      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDocentes)
      });
      Seccion.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSecciones)
      });

      await planificacionController.getDocentesDisponibles(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          nombre: 'Carlos López',
          horasActuales: 2,
          horasProyectadas: 6
        })
      ]));
    });

    it('35. reasignarDocente: asigna docente a sección', async () => {
      req.params = { id: 'sec1' };
      req.body = { docenteId: 'doc1' };

      const mockSeccion = {
        _id: 'sec1',
        docente: null,
        save: jest.fn().mockResolvedValue(true)
      };

      Seccion.findById.mockResolvedValue(mockSeccion);

      await planificacionController.reasignarDocente(req, res);

      expect(Seccion.findById).toHaveBeenCalledWith('sec1');
      expect(mockSeccion.docente).toBe('doc1');
      expect(mockSeccion.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: 'Docente reasignado correctamente' });
    });

    it('36. liberarSeccion: quita docente de una sección', async () => {
      req.params = { id: 'sec1' };

      const mockSeccion = {
        _id: 'sec1',
        docente: 'doc1',
        save: jest.fn().mockResolvedValue(true)
      };

      Seccion.findById.mockResolvedValue(mockSeccion);

      await planificacionController.liberarSeccion(req, res);

      expect(mockSeccion.docente).toBeNull();
      expect(mockSeccion.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: 'Sección liberada correctamente' });
    });

    it('37. editarHorario: actualiza campos de horario', async () => {
      req.params = { id: 'sec1' };
      req.body = { dias: ['LU'], horaInicio: '10:00', horaFin: '12:00', aula: 'A202' };

      const mockSeccion = {
        _id: 'sec1',
        dias: ['MA'],
        horaInicio: '08:00',
        horaFin: '10:00',
        aula: 'A101',
        horario: 'MA 08:00 - 10:00',
        save: jest.fn().mockResolvedValue(true)
      };

      Seccion.findById.mockResolvedValue(mockSeccion);

      await planificacionController.editarHorario(req, res);

      expect(mockSeccion.dias).toEqual(['LU']);
      expect(mockSeccion.horaInicio).toBe('10:00');
      expect(mockSeccion.horaFin).toBe('12:00');
      expect(mockSeccion.aula).toBe('A202');
      expect(mockSeccion.horario).toBe('LU 10:00 - 12:00');
      expect(mockSeccion.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Horario actualizado correctamente'
      }));
    });
  });
});
