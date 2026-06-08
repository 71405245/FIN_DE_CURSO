const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admins del sistema con acceso garantizado
const SYSTEM_ADMINS = [
  { email: 'admin@sima.com',  nombre: 'Administrador', apellidos: 'Principal',     rol: 'ADMIN', defaultPass: 'admin' },
  { email: 'admin2@sima.com', nombre: 'Administrador', apellidos: 'Planificación', rol: 'ADMIN', defaultPass: 'admin2' },
];

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('INTENTO DE LOGIN:', { email, password });

  try {
    // Buscar usuario
    let user = await User.findOne({ email });

    const systemAdmin = SYSTEM_ADMINS.find(a => a.email === email);

    // Si es un admin del sistema y no existe → créalo
    if (!user && systemAdmin && password === systemAdmin.defaultPass) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(systemAdmin.defaultPass, salt);
      const { defaultPass, ...adminData } = systemAdmin;
      user = new User({ ...adminData, password: hashedPassword });
      await user.save();
    } else if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Verificar password
    let isMatch = await bcrypt.compare(password, user.password);

    // Auto-reparación: si es admin del sistema y el hash en BD es incorrecto, lo resetea
    if (!isMatch && systemAdmin && password === systemAdmin.defaultPass) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(systemAdmin.defaultPass, salt);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Retornar JWT — usar sign síncrono (Express 5 no captura throw dentro de callbacks)
    const token = jwt.sign(
      { user: { id: user.id, rol: user.rol, nombre: user.nombre, email: user.email } },
      process.env.JWT_SECRET || 'secretodetokentemporal',
      { expiresIn: '10h' }
    );

    return res.json({
      token,
      user: { id: user.id, rol: user.rol, nombre: user.nombre, email: user.email }
    });

  } catch (err) {
    console.error('Error en login:', err.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};
