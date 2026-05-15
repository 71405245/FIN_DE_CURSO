import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, CheckCircle, GraduationCap, Clock, MapPin, Users } from 'lucide-react';

function EstudianteDashboard() {
  const [secciones, setSecciones] = useState([]);
  const [misSecciones, setMisSecciones] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.rol !== 'ESTUDIANTE') {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const [dispRes, misRes] = await Promise.all([
        axios.get('http://localhost:5000/api/estudiante/secciones-disponibles', config),
        axios.get('http://localhost:5000/api/estudiante/mis-secciones', config)
      ]);
      
      setSecciones(dispRes.data);
      setMisSecciones(misRes.data);
    } catch (err) {
      setError('Error al cargar datos. Verifica tu conexión.');
    }
  };

  const handleMatricular = async (seccionId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post('http://localhost:5000/api/estudiante/matricular', { seccionId }, config);
      setSuccess('¡Matrícula exitosa! El curso ha sido agregado a tu horario.');
      setError('');
      fetchData();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al matricular');
      setSuccess('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Header Premium */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-purple)', padding: '8px', borderRadius: '10px', color: 'white' }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>Portal Estudiantil</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hola, {user?.nombre}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ ...btnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <LogOut size={16}/> Salir
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }} className="animate-fade-in">
        
        {/* Alertas flotantes (Toast-like) */}
        {error && <div style={{...alertStyle, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca'}}>{error}</div>}
        {success && <div style={{...alertStyle, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0'}}><CheckCircle size={18}/> {success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {/* Columna: Secciones Disponibles */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BookOpen size={20} color="var(--primary-purple)" />
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Cursos Disponibles (Ciclo Actual)</h2>
            </div>
            
            {secciones.length === 0 ? (
              <div className="modern-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No hay salones disponibles o ya te has matriculado en todos tus cursos de este ciclo.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {secciones.map(s => {
                  const cuposRestantes = s.cupoMaximo - s.estudiantesMatriculados.length;
                  return (
                    <div key={s._id} className="modern-card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <span className="badge badge-gray" style={{ marginBottom: '0.5rem' }}>{s.codigoSeccion}</span>
                          <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>{s.curso?.nombre}</h4>
                        </div>
                        <span className="badge badge-purple" style={{ whiteSpace: 'nowrap' }}>{s.curso?.creditos} Créditos</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={infoRowStyle}><Users size={16}/> {s.docente?.nombre} {s.docente?.apellidos}</div>
                        <div style={infoRowStyle}><Clock size={16}/> {s.horario}</div>
                        <div style={infoRowStyle}><MapPin size={16}/> {s.aula}</div>
                        <div style={{ ...infoRowStyle, color: cuposRestantes < 5 ? '#ef4444' : 'var(--text-muted)' }}>
                          <Users size={16}/> {cuposRestantes} cupos libres
                        </div>
                      </div>
                      
                      <button onClick={() => handleMatricular(s._id)} style={{...btnStyle, width: '100%', background: 'var(--primary-purple)', color: 'white', justifyContent: 'center'}}>
                        Matricularme en este curso
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Columna: Mis Cursos */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={20} color="#10b981" />
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Mis Cursos Matriculados</h2>
            </div>
            
            {misSecciones.length === 0 ? (
              <div className="modern-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>Aún no te has matriculado en ningún curso.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {misSecciones.map(s => (
                  <div key={s._id} className="modern-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{s.curso?.nombre}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Cod: {s.curso?.codigo} | Sección: {s.codigoSeccion}</p>
                    
                    <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Horario</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{s.horario}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Aula</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{s.aula}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

const btnStyle = { padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.1s' };
const infoRowStyle = { color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' };
const alertStyle = { padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500', boxShadow: 'var(--shadow-sm)' };

export default EstudianteDashboard;
