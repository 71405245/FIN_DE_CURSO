import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, User, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('admin@sima.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.rol === 'ADMIN') {
        navigate('/admin');
      } else if (res.data.user.rol === 'ESTUDIANTE') {
        navigate('/estudiante');
      } else if (res.data.user.rol === 'DOCENTE') {
        navigate('/docente');
      }
    } catch (err) {
      setError('Credenciales inválidas');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body { margin: 0; overflow: hidden; background-color: #0f172a; }
        .login-wrapper { width: 100vw; height: 100vh; display: flex; font-family: 'Outfit', sans-serif; }
        
        .login-side-visual {
            flex: 1.2;
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 5rem;
            position: relative;
            overflow: hidden;
        }
        .login-side-visual::before {
            content: '';
            position: absolute;
            top: -10%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
            border-radius: 50%;
        }
        .visual-content { position: relative; z-index: 2; animation: slideUp 1s ease-out; }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .brand-name {
            font-size: 5rem;
            font-weight: 800;
            color: white;
            letter-spacing: -2px;
            margin-bottom: 1rem;
            background: linear-gradient(to right, #fff, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .brand-desc { font-size: 1.5rem; color: rgba(255,255,255,0.7); max-width: 500px; font-weight: 300; line-height: 1.4; }
        
        .login-side-form {
            flex: 1;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4rem;
            border-radius: 40px 0 0 40px;
            box-shadow: -20px 0 60px rgba(0,0,0,0.3);
            z-index: 10;
        }
        .form-container { width: 100%; max-width: 400px; animation: fadeIn 1.2s ease-out; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .welcome-text { color: #1e293b; font-weight: 800; font-size: 2.2rem; margin-bottom: 0.5rem; }
        .subtitle-text { color: #64748b; margin-bottom: 2.5rem; }
        
        .custom-input-group { margin-bottom: 1.5rem; }
        .custom-input-group label { display: block; font-weight: 600; font-size: 0.9rem; color: #475569; margin-bottom: 0.5rem; }
        .input-wrapper { position: relative; }
        .input-wrapper .icon-left { position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); color: #94a3b8; transition: color 0.3s; pointer-events: none; }
        .eye-toggle-btn { position: absolute; right: 1.2rem; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 0; cursor: pointer; color: #94a3b8; display: flex; align-items: center; transition: color 0.2s; }
        .eye-toggle-btn:hover { color: #6366f1; }
        .form-control-with-eye { padding-right: 3.2rem !important; }
        
        .form-control-custom {
            width: 100%;
            padding: 1rem 1rem 1rem 3.5rem;
            background: #f1f5f9;
            border: 2px solid transparent;
            border-radius: 16px;
            font-weight: 500;
            color: #1e293b;
            transition: all 0.3s;
            box-sizing: border-box;
            outline: none;
            font-family: inherit;
            font-size: 1rem;
        }
        .form-control-custom:focus { background: #fff; border-color: #6366f1; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.1); }
        .form-control-custom:focus + svg { color: #6366f1; }
        
        .btn-premium {
            width: 100%;
            padding: 1rem;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 1.1rem;
            margin-top: 1rem;
            transition: all 0.3s;
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
            cursor: pointer;
        }
        .btn-premium:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4); filter: brightness(1.1); }
        
        .alert-custom { background: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; font-size: 0.9rem; display: flex; alignItems: center; gap: 0.5rem; }
        
        .feature-item { display: flex; align-items: center; margin-bottom: 1rem; }
        .feature-icon-bg { background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 50%; margin-right: 1rem; display: flex; justify-content: center; align-items: center;}
      `}</style>
      
      <div className="login-wrapper">
        <div className="login-side-visual" style={{ display: window.innerWidth > 992 ? 'flex' : 'none' }}>
            <div className="visual-content">
                <div className="brand-name">SIMA</div>
                <p className="brand-desc">Gestión Académica Inteligente con el poder de la IA. Tu futuro comienza aquí.</p>
                
                <div style={{ marginTop: '3rem' }}>
                    <div className="feature-item">
                        <div className="feature-icon-bg"><Check size={18} color="#4ade80" /></div>
                        <span style={{ color: 'white', opacity: 0.75 }}>Optimización de Horarios</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon-bg"><Check size={18} color="#4ade80" /></div>
                        <span style={{ color: 'white', opacity: 0.75 }}>Análisis de Rendimiento</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon-bg"><Check size={18} color="#4ade80" /></div>
                        <span style={{ color: 'white', opacity: 0.75 }}>Soporte 24/7 con IA</span>
                    </div>
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '3rem', opacity: 0.25 }}>
                <p style={{ color: 'white', fontSize: '0.85rem', margin: 0 }}>&copy; 2026 SIMA University System</p>
            </div>
        </div>

        <div className="login-side-form" style={{ borderRadius: window.innerWidth > 992 ? '40px 0 0 40px' : '0' }}>
            <div className="form-container">
                <h2 className="welcome-text">¡Bienvenido!</h2>
                <p className="subtitle-text">Ingresa tus credenciales para continuar.</p>

                {error && (
                    <div className="alert-custom">
                        <AlertTriangle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="custom-input-group">
                        <label>Correo Electrónico</label>
                        <div className="input-wrapper">
                            <input 
                              type="text" 
                              className="form-control-custom" 
                              placeholder="ejemplo@sima.edu" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                            />
                            <User size={18} className="icon-left" />
                        </div>
                    </div>

                    <div className="custom-input-group">
                        <label>Contraseña</label>
                        <div className="input-wrapper">
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              className="form-control-custom form-control-with-eye" 
                              placeholder="••••••••" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required 
                            />
                            <Lock size={18} className="icon-left" />
                            <button
                              type="button"
                              className="eye-toggle-btn"
                              onClick={() => setShowPassword(prev => !prev)}
                              tabIndex={-1}
                              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-premium" disabled={loading}>
                        {loading ? 'Verificando...' : 'Entrar al Sistema'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      ¿Problemas para entrar? <span style={{ color: '#6366f1', fontWeight: 'bold', cursor: 'pointer' }}>Contacta a Soporte</span>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}

export default Login;
