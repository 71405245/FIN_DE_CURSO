require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(helmet());
// app.use(mongoSanitize()); // Deshabilitado por incompatibilidad con Express 5
app.use(cors());

// [OPTIMIZACIÃ“N 8] APM - Buffer circular O(1) en vez de Array.shift() O(n)
const APM_BUFFER_SIZE = 500;
global.apiMetrics = new Array(APM_BUFFER_SIZE).fill(null);
global.apiMetricsIndex = 0;
global.apiMetricsCount = 0;

app.use((req, res, next) => {
  const start = Date.now();

  // [APM FIX] Interceptar res.json ANTES de compresión → bytes del JSON crudo (ANTES)
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    try {
      res._payloadBytes = Buffer.byteLength(JSON.stringify(data), 'utf8');
    } catch (_) { res._payloadBytes = 0; }
    return originalJson(data);
  };

  // [APM FIX] Interceptar res.write y res.end para contar bytes reales que salen
  // por el socket (DESPUÉS de GZIP). Con Transfer-Encoding:chunked el Content-Length
  // no existe, por eso hay que acumular manualmente.
  res._compressedBytesAccum = 0;
  const origWrite = res.write.bind(res);
  const origEnd   = res.end.bind(res);

  res.write = function (chunk, ...args) {
    if (chunk) {
      res._compressedBytesAccum += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, args[0] || 'utf8');
    }
    return origWrite(chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    if (chunk) {
      res._compressedBytesAccum += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(String(chunk), args[0] || 'utf8');
    }
    return origEnd(chunk, ...args);
  };

  res.on('finish', () => {
    const duration  = Date.now() - start;
    const route     = req.originalUrl.split('?')[0];

    if (route.startsWith('/api/')) {
      const rawBytes        = res._payloadBytes         || 0; // JSON crudo (ANTES)
      const compressedBytes = res._compressedBytesAccum || rawBytes; // bytes reales de red (DESPUÉS)

      // Escritura O(1) en buffer circular
      global.apiMetrics[global.apiMetricsIndex] = {
        method:          req.method,
        route:           route,
        duration:        duration,
        status:          res.statusCode,
        bytes:           rawBytes,        // payload JSON crudo (antes de GZIP)
        compressedBytes: compressedBytes, // bytes reales enviados (después de GZIP)
        encoding:        res.getHeader('content-encoding') || 'identity',
        time:            new Date()
      };
      global.apiMetricsIndex = (global.apiMetricsIndex + 1) % APM_BUFFER_SIZE;
      if (global.apiMetricsCount < APM_BUFFER_SIZE) global.apiMetricsCount++;
    }
  });
  next();
});

// [OPTIMIZACIÃ“N 3] CompresiÃ³n con nivel 6 (equilibrio velocidad/ratio) y threshold de 1KB
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
app.use(express.json());

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

// Configuración manual de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sima_db';
console.log('Conectando a:', MONGODB_URI);

