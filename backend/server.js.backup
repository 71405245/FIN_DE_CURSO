require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
// [OPTIMIZACIÓN 3] Compresión con nivel 6 (equilibrio velocidad/ratio) y threshold de 1KB
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
app.use(express.json());

// [OPTIMIZACIÓN 8] APM - Buffer circular O(1) en vez de Array.shift() O(n)
const APM_BUFFER_SIZE = 500;
global.apiMetrics = new Array(APM_BUFFER_SIZE).fill(null);
global.apiMetricsIndex = 0;
global.apiMetricsCount = 0;

app.use((req, res, next) => {
  const start = Date.now();

  // Capturar tamaño del payload interceptando res.json ANTES de compresión
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    try {
      res._payloadBytes = Buffer.byteLength(JSON.stringify(data), 'utf8');
    } catch (_) { res._payloadBytes = 0; }
    return originalJson(data);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.originalUrl.split('?')[0];

    if (route.startsWith('/api/')) {
      // Bytes comprimidos reales enviados al cliente (post-GZIP)
      const contentLength = parseInt(res.getHeader('content-length') || '0', 10);
      const rawBytes = res._payloadBytes || 0;
      // Si content-length < rawBytes significa que se aplicó compresión
      const compressedBytes = (contentLength > 0 && contentLength < rawBytes) ? contentLength : rawBytes;

      // Escritura O(1) en buffer circular
      global.apiMetrics[global.apiMetricsIndex] = {
        method:          req.method,
        route:           route,
        duration:        duration,
        status:          res.statusCode,
        bytes:           rawBytes,           // payload JSON crudo (antes de GZIP)
        compressedBytes: compressedBytes,    // bytes reales enviados (después de GZIP)
        encoding:        res.getHeader('content-encoding') || 'identity',
        time:            new Date()
      };
      global.apiMetricsIndex = (global.apiMetricsIndex + 1) % APM_BUFFER_SIZE;
      if (global.apiMetricsCount < APM_BUFFER_SIZE) global.apiMetricsCount++;
    }
  });
  next();
});

// Rutas de prueba
app.get('/api/status', (req, res) => {
  res.json({ message: 'Bienvenido a la API de SIMA MERN' });
});

// Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/estudiante', require('./routes/estudianteRoutes'));
app.use('/api/docente', require('./routes/docenteRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
