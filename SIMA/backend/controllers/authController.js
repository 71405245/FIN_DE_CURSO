const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    let user = await User.findOne({ email });

    // Semilla temporal: Si no hay Admin en BD, créalo
    if (!user && email === 'admin@sima.com' && password === 'admin123') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({
        nombre: 'Administrador',
        apellidos: 'Principal',
        email: 'admin@sima.com',
        password: hashedPassword,
        rol: 'ADMIN'
      });
      await user.save();
    } else if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Retornar JWT
    const payload = {
      user: {
        id: user.id,
        rol: user.rol,
        nombre: user.nombre
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secretodetokentemporal',
      { expiresIn: '10h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};
