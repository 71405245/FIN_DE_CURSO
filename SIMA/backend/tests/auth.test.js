const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Interceptar las peticiones a MongoDB usando Jest
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller (Sistema de Autenticación)', () => {
  let req, res;

  beforeEach(() => {
    // Simuladores de Express args
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('14. Login Fallido: Debe retornar 400 si el usuario no existe', async () => {
    req.body = { email: 'inexistente@sima.com', password: '123' };
    User.findOne.mockResolvedValue(null);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Credenciales inválidas' });
  });

  it('15. Login Fallido: Debe retornar 400 si la contraseña no coincide', async () => {
    req.body = { email: 'estudiante@sima.com', password: 'badpassword' };
    User.findOne.mockResolvedValue({
      email: 'estudiante@sima.com',
      password: 'hashedpassword'
    });
    bcrypt.compare.mockResolvedValue(false);

    await authController.login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('badpassword', 'hashedpassword');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Credenciales inválidas' });
  });

  it('16. Login Exitoso: Genera un Token JWT', async () => {
    req.body = { email: 'valido@sima.com', password: '123' };
    const fakeUser = {
      id: '12345',
      email: 'valido@sima.com',
      password: 'hash',
      nombre: 'Juan',
      rol: 'ESTUDIANTE'
    };

    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    await authController.login(req, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: 'fake-jwt-token',
      user: { id: '12345', rol: 'ESTUDIANTE', nombre: 'Juan', email: 'valido@sima.com' }
    });
  });

  it('17. Auto-Reparación Admin: Debe resetear la contraseña nativa si es SYSTEM_ADMIN', async () => {
    req.body = { email: 'admin@sima.com', password: 'admin' };
    const brokenAdmin = {
      email: 'admin@sima.com',
      password: 'corrupted-hash',
      save: jest.fn()
    };

    User.findOne.mockResolvedValue(brokenAdmin);
    bcrypt.compare.mockResolvedValue(false); // Hash corrompido
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('new-hash');
    jwt.sign.mockReturnValue('token');

    await authController.login(req, res);

    // Verificamos que se ejecutó el repair interno de password
    expect(brokenAdmin.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });
});
