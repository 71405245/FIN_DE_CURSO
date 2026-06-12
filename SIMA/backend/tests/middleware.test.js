const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware (Control de Acceso JWT)', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('46. Debe retornar 401 si no se proporciona el token en el header', () => {
    req.header.mockReturnValue(null); // No token header

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No hay token, permiso denegado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('47. Debe retornar 401 si el token es inválido o corrupto', () => {
    req.header.mockReturnValue('invalid-token');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token signature');
    });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token no es válido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('48. Debe decodificar el token, asignar req.user y llamar a next() si es válido', () => {
    req.header.mockReturnValue('valid-token');
    const mockPayload = { user: { id: 'user_123', rol: 'ADMIN' } };
    jwt.verify.mockReturnValue(mockPayload);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(req.user).toEqual(mockPayload.user);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
