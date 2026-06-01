const http = require('http');

const body = JSON.stringify({ email: 'admin@sima.com', password: 'admin123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', data);
  });
});

req.on('error', (e) => {
  console.error('ERROR conectando al backend:', e.message);
  console.error('¿Está el backend corriendo en puerto 5000?');
});

req.write(body);
req.end();
