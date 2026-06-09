process.env.NODE_ENV = 'test';
const estudianteController = require('../controllers/estudianteController');

describe('AI Scheduler Helpers (Motor de Horarios)', () => {
  const { checkOverlap, checkTurno, countUniqueDays } = estudianteController._helpers;

  describe('checkOverlap (Solapamiento de Cursos)', () => {
    it('1. Debe retornar false si no comparten ningún día', () => {
      const sec1 = { dias: ['LU', 'MI'], horaInicio: '08:00', horaFin: '10:00' };
      const sec2 = { dias: ['MA', 'JU'], horaInicio: '08:00', horaFin: '10:00' };
      expect(checkOverlap(sec1, sec2)).toBe(false);
    });

    it('2. Debe retornar false si comparten día pero los horarios son secuenciales', () => {
      const sec1 = { dias: ['LU', 'MI'], horaInicio: '08:00', horaFin: '10:00' };
      const sec2 = { dias: ['LU', 'MI'], horaInicio: '10:00', horaFin: '12:00' };
      expect(checkOverlap(sec1, sec2)).toBe(false);
    });

    it('3. Debe retornar true si comparten día y los horarios se solapan parcialmente', () => {
      const sec1 = { dias: ['LU'], horaInicio: '09:00', horaFin: '11:00' };
      const sec2 = { dias: ['LU'], horaInicio: '10:00', horaFin: '12:00' };
      expect(checkOverlap(sec1, sec2)).toBe(true);
    });

    it('4. Debe retornar true si tienen exactamente el mismo horario y días', () => {
      const sec1 = { dias: ['VI'], horaInicio: '14:00', horaFin: '16:00' };
      const sec2 = { dias: ['VI'], horaInicio: '14:00', horaFin: '16:00' };
      expect(checkOverlap(sec1, sec2)).toBe(true);
    });

    it('5. Debe retornar false si falta información (robusted del algoritmo)', () => {
      expect(checkOverlap(null, { })).toBe(false);
      expect(checkOverlap({ dias: ['LU'] }, { dias: ['LU'] })).toBe(false); // Sin horas
    });
  });

  describe('checkTurno (Preferencias de Turno)', () => {
    it('6. MAÑANA: Debe retornar true si empieza antes de las 13:00', () => {
      const sec = { horaInicio: '08:00' };
      expect(checkTurno(sec, 'MAÑANA')).toBe(true);
    });

    it('7. MAÑANA: Debe retornar false si empieza a las 13:00 o después', () => {
      const sec = { horaInicio: '13:30' };
      expect(checkTurno(sec, 'MAÑANA')).toBe(false);
    });

    it('8. TARDE: Debe retornar true si empieza entre 13:00 y 17:59', () => {
      expect(checkTurno({ horaInicio: '13:00' }, 'TARDE')).toBe(true);
      expect(checkTurno({ horaInicio: '17:00' }, 'TARDE')).toBe(true);
    });

    it('9. TARDE: Debe retornar false si empieza antes de las 13:00 o a partir de las 18:00', () => {
      expect(checkTurno({ horaInicio: '12:30' }, 'TARDE')).toBe(false);
      expect(checkTurno({ horaInicio: '18:00' }, 'TARDE')).toBe(false);
    });

    it('10. NOCHE: Debe retornar true si empieza a partir de las 18:00', () => {
      expect(checkTurno({ horaInicio: '18:15' }, 'NOCHE')).toBe(true);
      expect(checkTurno({ horaInicio: '20:00' }, 'NOCHE')).toBe(true);
    });

    it('11. MIXTO/CUALQUIERA: Debe retornar true siempre si el turno no es específico', () => {
      // El helper devuelve true por defecto si no es un turno mapeado
      expect(checkTurno({ horaInicio: '14:00' }, 'MIXTO')).toBe(true);
      expect(checkTurno({ horaInicio: '08:00' }, '')).toBe(true);
    });
  });

  describe('countUniqueDays (Conteo de días de asistencia)', () => {
    it('12. Debe contar correctamente 3 días únicos', () => {
      const horario = [
        { dias: ['LU', 'MI'] },
        { dias: ['MI', 'VI'] }
      ];
      expect(countUniqueDays(horario)).toBe(3); // LU, MI, VI
    });

    it('13. Debe retornar 0 si el arreglo está vacío', () => {
      expect(countUniqueDays([])).toBe(0);
    });
  });
});
