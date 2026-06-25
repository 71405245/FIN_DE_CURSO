import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, User, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('admin@sima.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
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
        body { margin: 0; overflow: hidden; background-color: var(--bg-color); }
        .login-wrapper { width: 100vw; height: 100vh; display: flex; font-family: 'Outfit', sans-serif; background-color: #050505; }
        
        .login-side-visual {
            flex: 1.2;
            background: radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, #050505 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 5rem;
            position: relative;
            overflow: hidden;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .login-side-visual::before {
            content: '';
            position: absolute;
            top: -10%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 60%);
            border-radius: 50%;
            filter: blur(40px);
        }
        .login-side-visual::after {
            content: '';
            position: absolute;
            bottom: -10%;
            left: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
            border-radius: 50%;
            filter: blur(40px);
        }
        .visual-content { position: relative; z-index: 2; animation: slideUp 1s cubic-bezier(0.4, 0, 0.2, 1); }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .brand-name {
            font-size: 5.5rem;
            font-weight: 800;
            color: white;
            letter-spacing: -2px;
            margin-bottom: 1rem;
            background: linear-gradient(to right, #00f0ff, #8b5cf6, #f8fafc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
        }
        .brand-desc { font-size: 1.5rem; color: #94a3b8; max-width: 500px; font-weight: 300; line-height: 1.5; }
        
        .login-side-form {
            flex: 1;
            background: #0a0a0a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4rem;
            border-radius: 40px 0 0 40px;
            box-shadow: -20px 0 60px rgba(0,0,0,0.8);
            z-index: 10;
            position: relative;
        }
        .login-side-form::before {
            content: '';
            position: absolute;
            top: 0; left: 0; bottom: 0; width: 1px;
            background: linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.5), transparent);
        }
        .form-container { width: 100%; max-width: 400px; animation: fadeIn 1.2s ease-out; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .welcome-text { color: #f8fafc; font-weight: 800; font-size: 2.2rem; margin-bottom: 0.5rem; }
        .subtitle-text { color: #94a3b8; margin-bottom: 2.5rem; }
        
        .custom-input-group { margin-bottom: 1.5rem; }
        .custom-input-group label { display: block; font-weight: 600; font-size: 0.9rem; color: #94a3b8; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em;}
        .input-wrapper { position: relative; }
        .input-wrapper .icon-left { position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); color: #64748b; transition: color 0.3s; pointer-events: none; }
        .eye-toggle-btn { position: absolute; right: 1.2rem; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 0; cursor: pointer; color: #64748b; display: flex; align-items: center; transition: color 0.2s; }
        .eye-toggle-btn:hover { color: #00f0ff; text-shadow: 0 0 8px rgba(0,240,255,0.5); }
        .form-control-with-eye { padding-right: 3.2rem !important; }
        
        .form-control-custom {
            width: 100%;
            padding: 1.2rem 1rem 1.2rem 3.5rem;
            background: rgba(15, 15, 20, 0.7);
            border: 1px solid #1e1e24;
            border-radius: 16px;
            font-weight: 500;
            color: #f8fafc;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box;
            outline: none;
            font-family: inherit;
            font-size: 1rem;
            backdrop-filter: blur(10px);
        }
        .form-control-custom:focus { background: rgba(20, 20, 25, 0.9); border-color: #8b5cf6; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2), 0 0 15px rgba(139, 92, 246, 0.3); }
        .form-control-custom:focus + svg { color: #00f0ff; filter: drop-shadow(0 0 5px rgba(0, 240, 255, 0.5)); }
        
        .btn-premium {
            width: 100%;
            padding: 1.2rem;
            background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%);
            color: #050505;
            border: none;
            border-radius: 16px;
            font-weight: 800;
            font-size: 1.1rem;
            margin-top: 1rem;
            transition: all 0.3s;
            box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .btn-premium:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(139, 92, 246, 0.6); filter: brightness(1.2); }
        
        .alert-custom { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; color: #fca5a5; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; font-size: 0.9rem; display: flex; alignItems: center; gap: 0.5rem; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .feature-item { display: flex; align-items: center; margin-bottom: 1rem; }
        .feature-icon-bg { background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0,240,255,0.3); padding: 0.5rem; border-radius: 50%; margin-right: 1rem; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 10px rgba(0,240,255,0.2); }
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
                        <label htmlFor="login-email">Correo Electrónico</label>
                        <div className="input-wrapper">
                            <input 
                              id="login-email"
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
                        <label htmlFor="login-password">Contraseña</label>
                        <div className="input-wrapper">
                            <input 
                              id="login-password"
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
