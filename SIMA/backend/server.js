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
app.use(compression());
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
