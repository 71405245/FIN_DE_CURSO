const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { user: { id: '6a0949f59e1147478dddd423', rol: 'ESTUDIANTE' } },
  'supersecretjwtkey123',
  { expiresIn: '10h' }
);

async function test() {
  const config = { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } };
  
  try {
    const ia = await fetch('http://localhost:5000/api/estudiante/generar-horario-ia', {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({ turno: 'MIXTO', cantidadCursos: 5, diasPorSemana: 5 })
    });
    console.log("IA result:", await ia.text());
  } catch(e) {}
}

test();
