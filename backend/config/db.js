const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGODB_URI = 'mongodb://localhost:27017/sima_db';
        console.log('Conectando a MongoDB en:', MONGODB_URI);
        
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
        console.log(`📚 Base de datos: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error de conexión: ${error.message}`);
        // No detenemos el servidor, solo mostramos el error
    }
};

module.exports = connectDB;