function checkOverlap(s1, s2) {
  if (!s1 || !s2 || !s1.dias || !s2.dias) return false;
  const commonDays = s1.dias.filter(d => s2.dias.includes(d));
  if (commonDays.length === 0) return false;
  if (!s1.horaInicio || !s2.horaInicio || !s1.horaFin || !s2.horaFin) return false;
  return s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin;
}

function checkTurno(s, turno) {
  if (!s || !s.horaInicio) return true;
  if (turno === 'MAÑANA') return s.horaInicio < '13:00';
  if (turno === 'TARDE') return s.horaInicio >= '13:00' && s.horaInicio < '18:00';
  if (turno === 'NOCHE') return s.horaInicio >= '18:00';
  return true; // MIXTO o vacio
}

function countUniqueDays(schedule) {
  const days = new Set();
  schedule.forEach(s => {
    if (s && s.dias) {
      s.dias.forEach(d => days.add(d));
    }
  });
  return days.size;
}

function calcularMejoresHorarios(cursosAProcesar, seccionesPorCurso, turno, diasPorSemana) {
  const todasLasAlternativas = [];

  function backtrack(cursoIndex, horarioActual) {
    if (todasLasAlternativas.length >= 150) return;

    if (cursoIndex === cursosAProcesar.length) {
      todasLasAlternativas.push([...horarioActual]);
      return;
    }

    const cursoActual = cursosAProcesar[cursoIndex];
    const opcionesSeccion = seccionesPorCurso[cursoActual._id];

    if (!opcionesSeccion || opcionesSeccion.length === 0) {
      backtrack(cursoIndex + 1, horarioActual);
      return;
    }

    for (const seccion of opcionesSeccion) {
      let cruza = false;
      for (const asignada of horarioActual) {
        if (checkOverlap(seccion, asignada)) {
          cruza = true;
          break;
        }
      }
      if (!cruza) {
        horarioActual.push(seccion);
        backtrack(cursoIndex + 1, horarioActual);
        horarioActual.pop();
      }
    }

    backtrack(cursoIndex + 1, horarioActual);
  }

  backtrack(0, []);

  const hashesVistos = new Set();
  const alternativasUnicas = [];
  for (const alt of todasLasAlternativas) {
    if (alt.length === 0) continue;
    const hash = alt.map(s => String(s._id)).sort().join('-');
    if (!hashesVistos.has(hash)) {
      hashesVistos.add(hash);
      alternativasUnicas.push(alt);
    }
  }

  alternativasUnicas.forEach(alt => {
    let score = alt.length * 1000;
    const cumpleTurno = alt.every(s => checkTurno(s, turno));
    if (cumpleTurno) score += 500;
    const diasUnicos = countUniqueDays(alt);
    if (diasUnicos <= diasPorSemana) score += 200;
    score -= diasUnicos * 50;

    alt._score = score;
    alt._cumpleTurno = cumpleTurno;
    alt._diasUnicos = diasUnicos;
  });

  alternativasUnicas.sort((a, b) => b._score - a._score);
  return alternativasUnicas.slice(0, 5);
}

module.exports = {
  checkOverlap,
  checkTurno,
  countUniqueDays,
  calcularMejoresHorarios
};
