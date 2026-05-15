import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit3, Users, BookOpen } from 'lucide-react';

function DocenteDashboard() {
  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [calificaciones, setCalificaciones] = useState({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.rol !== 'DOCENTE') {
      navigate('/login');
    } else {
      fetchSecciones();
    }
  }, [navigate]);

  const fetchSecciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/docente/mis-secciones', { headers: { 'x-auth-token': token } });
      setSecciones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalificar = async (estudianteId, nota) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/docente/calificar', {
        estudianteId,
        seccionId: seccionSeleccionada._id,
        nota: Number(nota),
        comentarios: 'Calificación registrada'
      }, { headers: { 'x-auth-token': token } });
      
      // Mostrar feedback visual simple
      const btn = document.getElementById(`btn-calificar-${estudianteId}`);
      if(btn) {
        btn.style.background = '#10b981';
        btn.innerHTML = '✔ Guardado';
        setTimeout(() => {
          btn.style.background = 'var(--text-main)';
          btn.innerHTML = 'Guardar';
        }, 2000);
      }
    } catch (err) {
      alert('Error al guardar la nota');
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-dark)', padding: '8px', borderRadius: '10px', color: 'white' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>Portal Docente</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Profesor/a {user?.nombre} {user?.apellidos}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ ...btnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <LogOut size={16}/> Salir
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }} className="animate-fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          
          {/* Sidebar: Lista de Salones */}
          <section>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Mis Salones</h2>
            {secciones.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No tienes salones asignados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {secciones.map(s => {
                  const isSelected = seccionSeleccionada?._id === s._id;
                  return (
                    <div 
                      key={s._id} 
                      onClick={() => setSeccionSeleccionada(s)}
                      style={{ 
                        background: isSelected ? 'var(--primary-alpha)' : 'var(--surface)',
                        border: `1px solid ${isSelected ? 'var(--primary-light)' : 'var(--border)'}`,
                        padding: '1.25rem', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(109,40,217,0.1)' : 'var(--shadow-sm)'
                      }}
                    >
                      <h4 style={{ fontSize: '1.05rem', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {s.curso?.nombre}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Sec: {s.codigoSeccion} | {s.horario}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: isSelected ? 'white' : '#f8fafc', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                        <Users size={14}/> {s.estudiantesMatriculados.length} Alumnos
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Main Area: Estudiantes y Notas */}
          <section>
            {!seccionSeleccionada ? (
              <div className="modern-card" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3>Selecciona un salón</h3>
                <p>Haz clic en un salón del menú lateral para ver la lista de alumnos y registrar notas.</p>
              </div>
            ) : (
              <div className="modern-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{seccionSeleccionada.curso?.nombre}</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Sección {seccionSeleccionada.codigoSeccion} • Aula {seccionSeleccionada.aula}</p>
                </div>
                
                {seccionSeleccionada.estudiantesMatriculados.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay alumnos matriculados en este salón aún.</div>
                ) : (
                  <table className="modern-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Email</th>
                        <th style={{ width: '200px' }}>Calificación Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seccionSeleccionada.estudiantesMatriculados.map(est => (
                        <tr key={est._id}>
                          <td style={{ fontWeight: '500' }}>{est.nombre} {est.apellidos}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{est.email}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input 
                                type="number" 
                                placeholder="0 - 20"
                                min="0" max="20"
                                onChange={(e) => setCalificaciones({...calificaciones, [est._id]: e.target.value})}
                                style={{ width: '80px', padding: '8px', textAlign: 'center' }}
                              />
                              <button 
                                id={`btn-calificar-${est._id}`}
                                onClick={() => handleCalificar(est._id, calificaciones[est._id])} 
                                style={{ ...btnStyle, background: 'var(--text-main)', color: 'white', padding: '8px 12px', fontSize: '0.85rem' }}
                              >
                                Guardar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const btnStyle = { borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease' };

export default DocenteDashboard;
