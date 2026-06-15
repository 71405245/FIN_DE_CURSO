import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import '../App.css';

function DocenteDashboard() {
  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [calificaciones, setCalificaciones] = useState({}); // { [estudianteId]: nota }
  const [savedCalificaciones, setSavedCalificaciones] = useState([]); // Array de calificaciones de BD
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.rol !== 'DOCENTE') {
      navigate('/login');
    } else {
      fetchSecciones();
    }
  }, [navigate]);

  useEffect(() => {
    if (seccionSeleccionada) {
      fetchCalificacionesSeccion(seccionSeleccionada._id);
    }
  }, [seccionSeleccionada]);

  const fetchSecciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/docente/mis-secciones', { headers: { 'x-auth-token': token } });
      setSecciones(res.data);
    } catch (err) {
      setError('Error al obtener tus salones asignados.');
    }
  };

  const fetchCalificacionesSeccion = async (seccionId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/docente/secciones/${seccionId}/calificaciones`, { headers: { 'x-auth-token': token } });
      setSavedCalificaciones(res.data);
      
      // Mapear calificaciones cargadas al estado local
      const mapaNotas = {};
      res.data.forEach(c => {
        mapaNotas[c.estudiante.toString()] = c.nota;
      });
      setCalificaciones(mapaNotas);
    } catch (err) {
      console.error('Error al cargar notas registradas');
    }
  };

  const handleCalificar = async (estudianteId) => {
    const nota = calificaciones[estudianteId];
    if (nota === undefined || nota === '') {
      setError('Por favor, ingresa una calificación válida.');
      return;
    }
    
    const notaNum = Number(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
      setError('La calificación debe estar entre 0 y 20.');
      return;
    }

    setSavingId(estudianteId);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/docente/calificar', {
        estudianteId,
        seccionId: seccionSeleccionada._id,
        nota: notaNum,
        comentarios: 'Calificación registrada desde portal web'
      }, { headers: { 'x-auth-token': token } });

      setSuccess('¡Calificación guardada con éxito!');
      fetchCalificacionesSeccion(seccionSeleccionada._id);
      setSavingId(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al registrar la calificación.');
      setSavingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Calcular Estadísticas del Salón Seleccionado
  const calcularEstadisticas = () => {
    if (!seccionSeleccionada || savedCalificaciones.length === 0) {
      return { promedio: 0, tasaAprobacion: 0, totalCalificados: 0 };
    }
    
    let suma = 0;
    let aprobados = 0;
    savedCalificaciones.forEach(c => {
      suma += c.nota;
      if (c.nota > 10.5) aprobados++;
    });

    const promedio = suma / savedCalificaciones.length;
    const tasaAprobacion = (aprobados / savedCalificaciones.length) * 100;

    return {
      promedio: promedio.toFixed(1),
      tasaAprobacion: Math.round(tasaAprobacion),
      totalCalificados: savedCalificaciones.length
    };
  };

  const stats = calcularEstadisticas();

  // Agrupar secciones por carrera
  const seccionesAgrupadas = secciones.reduce((acc, seccion) => {
    const carrera = seccion.curso?.carrera?.nombre || 'General / Sin Carrera';
    if (!acc[carrera]) acc[carrera] = [];
    acc[carrera].push(seccion);
    return acc;
  }, {});

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', paddingBottom: '4rem' }}>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .docente-hero {
            background: radial-gradient(circle at top right, #3b82f6 0%, #1d4ed8 100%);
            position: relative;
            overflow: hidden;
        }
        .docente-hero::after {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 450px;
            height: 450px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            filter: blur(90px);
        }
        
        .glass-card {
            background: #ffffff;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .salon-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .salon-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            border-color: #3b82f6;
        }
        .salon-card-active {
            background: rgba(59, 130, 246, 0.06) !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 4px 12px rgba(59,130,246,0.1) !important;
        }
        
        .grade-input {
            width: 80px;
            padding: 10px;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            text-align: center;
            font-weight: 700;
            font-size: 1rem;
            color: #0f172a;
            transition: border-color 0.2s;
        }
        .grade-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        
        .modern-table th {
            font-weight: 700;
            color: #475569;
            background-color: #f1f5f9;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            padding: 1rem;
        }
        .modern-table td {
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
      `}</style>

      {/* Header Premium */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#2563eb', padding: '8px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', letterSpacing: '-0.5px' }}>SIMA Docente</h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Portal del Profesor • {user?.nombre}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', transition: 'all 0.2s' }}>
            <LogOut size={16}/> Salir del Portal
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1440px', margin: '2rem auto', padding: '0 2rem' }} className="animate-fade-in">
        
        {/* Alertas Flotantes */}
        {error && <div role="alert" aria-live="assertive" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: '600' }}><AlertCircle size={18} aria-hidden="true"/> {error}</div>}
        {success && <output aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: '600' }}><CheckCircle size={18} aria-hidden="true"/> {success}</output>}

        {/* 🚀 HERO PROFESSOR WELCOME */}
        <div className="docente-hero rounded-3xl shadow-lg mb-8 p-6 text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.15)', fontWeight: '700', borderRadius: '20px', fontSize: '0.7rem', padding: '3px 10px', marginBottom: '0.5rem' }}>
              <TrendingUp size={12} /> Gestión del Personal Académico 2026
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.8px' }}>Bienvenido, Profesor/a {user?.nombre} 👋</h2>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: 0 }}>
              Tienes a tu cargo <span style={{ color: '#fbbf24', fontWeight: '800' }}>{secciones.length} salones</span> registrados para evaluación y seguimiento académico.
            </p>
          </div>
          <BookOpen size={72} style={{ opacity: 0.15 }} />
        </div>

        {/* DOS COLUMNAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }} className="grid-responsive">
          
          {/* Sidebar: Lista de Salones */}
          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Mis Salones Asignados</h3>
            
            {secciones.length === 0 ? (
              <div className="glass-card p-5 text-center color-muted">No tienes salones asignados.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.entries(seccionesAgrupadas).map(([carrera, salones]) => (
                  <div key={carrera}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{carrera}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {salones.map(s => {
                        const isSelected = seccionSeleccionada?._id === s._id;
                        return (
                          <div 
                            key={s._id} 
                            role="button"
                            tabIndex={0}
                            onClick={() => setSeccionSeleccionada(s)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSeccionSeleccionada(s)}
                            className={`salon-card ${isSelected ? 'salon-card-active' : ''}`}
                            aria-pressed={isSelected}
                          >
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: isSelected ? '#1d4ed8' : '#0f172a', marginBottom: '0.25rem', lineHeight: '1.3' }}>
                              {s.curso?.nombre}
                            </h4>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '500' }}>Sec: {s.codigoSeccion} • Aula {s.aula}</p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' }}>
                                <Users size={12}/> {s.estudiantesMatriculados.length} Alumnos
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb' }}>{s.horaInicio} - {s.horaFin}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Main Area: Estudiantes y Notas */}
          <section>
            {!seccionSeleccionada ? (
              <div className="glass-card" style={{ height: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                <Users size={56} style={{ opacity: 0.2, marginBottom: '1rem', color: '#2563eb' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Selecciona un Salón Académico</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '350px', margin: 0, lineHeight: '1.5' }}>Haz clic en un salón en el menú de la izquierda para ver el registro de alumnos y registrar sus calificaciones.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Cabecera del Salón y Métricas */}
                <div className="glass-card p-6" style={{ borderTop: '5px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>{seccionSeleccionada.curso?.nombre}</h2>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                        Código: {seccionSeleccionada.curso?.codigo} • Sección: {seccionSeleccionada.codigoSeccion} • Aula: {seccionSeleccionada.aula}
                      </p>
                    </div>
                  </div>

                  {/* Fila de Métricas del Salón */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Alumnos Grados</span>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {stats.totalCalificados} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>/ {seccionSeleccionada.estudiantesMatriculados.length}</span>
                      </h4>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Promedio del Salón</span>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb', margin: 0 }}>
                        {stats.promedio} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>/ 20</span>
                      </h4>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tasa de Aprobación</span>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
                        {stats.tasaAprobacion}%
                      </h4>
                    </div>

                  </div>
                </div>

                {/* Tabla de Alumnos y Notas */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Registro Oficial de Calificaciones</h3>
                  </div>

                  {seccionSeleccionada.estudiantesMatriculados.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No hay estudiantes matriculados en este salón aún.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr>
                            <th>Estudiante</th>
                            <th>Correo Electrónico</th>
                            <th style={{ textAlign: 'center' }}>Estado</th>
                            <th style={{ width: '220px', textAlign: 'center' }}>Nota (0 - 20)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seccionSeleccionada.estudiantesMatriculados.map(est => {
                            const notaLocal = calificaciones[est._id];
                            const notaNum = Number(notaLocal);
                            const hasGrade = notaLocal !== undefined && notaLocal !== '';
                            const isPassing = hasGrade && notaNum > 10.5;
                            
                            return (
                              <tr key={est._id}>
                                <td style={{ fontWeight: '700', color: '#334155' }}>{est.nombre} {est.apellidos}</td>
                                <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{est.email}</td>
                                <td style={{ textAlign: 'center' }}>
                                  {!hasGrade && (
                                    <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>Sin Calificar</span>
                                  )}
                                  {hasGrade && isPassing && (
                                    <span style={{ display: 'inline-block', background: '#ecfdf5', color: '#047857', fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>Aprobado</span>
                                  )}
                                  {hasGrade && !isPassing && (
                                    <span style={{ display: 'inline-block', background: '#fef2f2', color: '#b91c1c', fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>Desaprobado</span>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
                                    <label htmlFor={`nota-${est._id}`} className="sr-only" style={{ display: 'none' }}>Nota de {est.nombre}</label>
                                    <input 
                                      id={`nota-${est._id}`}
                                      type="number" 
                                      placeholder="-"
                                      min="0" max="20"
                                      value={notaLocal || ''}
                                      onChange={(e) => setCalificaciones({...calificaciones, [est._id]: e.target.value})}
                                      className="grade-input"
                                      aria-label={`Calificación para ${est.nombre} ${est.apellidos}`}
                                    />
                                    <button 
                                      disabled={savingId === est._id}
                                      onClick={() => handleCalificar(est._id)} 
                                      style={{ 
                                        padding: '10px 14px', 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        background: '#0f172a', 
                                        color: 'white', 
                                        fontWeight: '700', 
                                        fontSize: '0.8rem', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: savingId === est._id ? 0.6 : 1
                                      }}
                                    >
                                      {savingId === est._id ? 'Guardando...' : 'Guardar'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default DocenteDashboard;
