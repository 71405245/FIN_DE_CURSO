import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, CheckCircle, GraduationCap, Clock, MapPin, Users, Award, Sparkles, Download, Cpu, Trash2 } from 'lucide-react';
import '../App.css';

function EstudianteDashboard() {
  const [secciones, setSecciones] = useState([]);
  const [misSecciones, setMisSecciones] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [iaPrefs, setIaPrefs] = useState({ turno: 'MIXTO', cantidadCursos: 5, diasPorSemana: 5 });
  const [iaResult, setIaResult] = useState(null);
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
      
      const [dispRes, misRes, perfilRes] = await Promise.all([
        axios.get('/api/estudiante/secciones-disponibles', config),
        axios.get('/api/estudiante/mis-secciones', config),
        axios.get('/api/estudiante/perfil', config)
      ]);
      
      setSecciones(dispRes.data);
      setMisSecciones(misRes.data);
      setPerfil(perfilRes.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar datos del portal estudiantil.');
      setLoading(false);
    }
  };

  const handleMatricular = async (seccionId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post('/api/estudiante/matricular', { seccionId }, config);
      setSuccess('¡Matrícula exitosa! El curso ha sido agregado a tu horario.');
      setError('');
      fetchData();
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al matricular');
      setSuccess('');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleRectificar = async (seccionId) => {
    if (!window.confirm('¿Estás seguro de que deseas retirarte de este curso?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post('/api/estudiante/rectificar', { seccionId }, config);
      setSuccess('Te has retirado del curso correctamente.');
      setError('');
      fetchData();
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al rectificar la matrícula');
      setSuccess('');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/estudiante/horario-pdf', {
        headers: { 'x-auth-token': token },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mi_horario_sima.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSuccess('PDF descargado correctamente.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Error al generar el PDF del horario.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleGenerarIA = async () => {
    try {
      setIsGeneratingIA(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/estudiante/generar-horario-ia', iaPrefs, {
        headers: { 'x-auth-token': token }
      });
      
      setIaResult(res.data);
      if(res.data.success) {
         setSuccess(res.data.message);
         setTimeout(() => setSuccess(''), 5000);
      }
      setShowResultsModal(true);
      setIsGeneratingIA(false);
    } catch (err) {
      setError('Error al generar sugerencias con IA.');
      setIsGeneratingIA(false);
      setTimeout(() => setError(''), 4000);
    }
  };

  const aplicarAlternativa = async (alternativa) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      // Matricular en cada curso sugerido de la alternativa
      for (const h of alternativa.horarioGenerado) {
        try {
          await axios.post('/api/estudiante/matricular', { seccionId: h.seccion._id }, config);
        } catch (e) {
          console.warn('Posible curso ya matriculado o cruce:', e);
        }
      }
      
      setSuccess('¡Horario aplicado exitosamente! Te has matriculado en los cursos.');
      setShowResultsModal(false);
      setIaResult(null);
      fetchData(); // Refrescar datos
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Hubo un error al aplicar todo el horario.');
      setLoading(false);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Matriz Horaria Dinámica (similar a la del Django antiguo)
  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const SLOTS = [
    '07:00 - 08:30',
    '08:30 - 10:00',
    '10:00 - 11:30',
    '11:30 - 13:00',
    '13:00 - 14:30',
    '14:30 - 16:00',
    '16:00 - 17:30',
    '17:30 - 19:00',
    '19:00 - 20:30',
    '20:30 - 22:00'
  ];

  const getSeccionEnSlot = (dia, slot) => {
    const [slotInicio, slotFin] = slot.split(' - ');
    return misSecciones.find(s => {
      if (!s.dias.includes(dia)) return false;
      const sInicio = s.horaInicio;
      const sFin = s.horaFin;
      // Validar si cubre este slot de tiempo
      return (sInicio <= slotInicio && sFin >= slotFin);
    });
  };

  // Colores Premium Pastel Deterministas por Curso
  const getPastelColor = (cursoId) => {
    const colors = [
      { bg: 'rgba(99, 102, 241, 0.12)', border: '#6366f1', text: '#4f46e5' },
      { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', text: '#059669' },
      { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', text: '#d97706' },
      { bg: 'rgba(236, 72, 153, 0.12)', border: '#ec4899', text: '#db2777' },
      { bg: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6', text: '#2563eb' },
      { bg: 'rgba(139, 92, 246, 0.12)', border: '#8b5cf6', text: '#7c3aed' }
    ];
    let hash = 0;
    const key = cursoId || 'default';
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Obtener clases para hoy
  const getClasesHoy = () => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hoy = diasSemana[new Date().getDay()];
    return misSecciones.filter(s => s.dias.includes(hoy));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--surface)', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Cargando Portal Estudiantil...</p>
        </div>
      </div>
    );
  }

  const clasesHoy = getClasesHoy();

  return (
    <div style={{ backgroundColor: 'var(--surface)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', paddingBottom: '4rem' }}>
      
      {/* Styles Inyectados */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseRed {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pulse-badge { animation: pulseRed 2s infinite; }
        
        .hero-gradient {
            background: radial-gradient(circle at top right, #6366f1 0%, #4f46e5 100%);
            position: relative;
            overflow: hidden;
        }
        .hero-gradient::after {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 400px;
            height: 400px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            filter: blur(80px);
        }
        
        .glass-card {
            background: #ffffff;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04);
        }
        
        .schedule-table th {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background-color: #f1f5f9;
            color: #475569;
            padding: 12px 6px;
            font-weight: 700;
        }
        .schedule-table td {
            border: 1px solid #e2e8f0;
            padding: 4px;
            height: 52px;
        }
      `}</style>

      {/* Header Premium */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', letterSpacing: '-0.5px' }}>SIMA Portal</h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Estudiante • {perfil?.estudiante?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', transition: 'all 0.2s' }}>
            <LogOut size={16}/> Salir del Portal
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }} className="animate-fade-in">
        
        {/* Alertas Premium Flotantes */}
        {error && <div role="alert" aria-live="assertive" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>{error}</div>}
        {success && <output aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><CheckCircle size={18} aria-hidden="true" /> {success}</output>}

        {/* 🚀 HERO WELCOME SECTION */}
        <div className="hero-gradient rounded-3xl shadow-lg mb-6 p-6 text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge bg-white bg-opacity-20 rounded-pill px-3 py-1 mb-2 text-xs fw-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.15)', fontWeight: '700', borderRadius: '20px' }}>
              <Sparkles size={12} className="text-warning" /> Ciclo Académico 2026-I
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.8px' }}>Hola de nuevo, {perfil?.estudiante?.nombre} 👋</h2>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: 0 }}>
              Estás matriculado en <span style={{ color: '#fbbf24', fontWeight: '800' }}>{perfil?.creditosMatriculados} créditos</span> este ciclo. Tu límite máximo es de <span style={{ fontWeight: '700' }}>{perfil?.limiteCreditos} CR</span>.
            </p>
          </div>
          <GraduationCap size={72} style={{ opacity: 0.15 }} />
        </div>

        {/* 📊 ROW DE TARJETAS DE ESTADÍSTICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Card 1: Tu Progreso */}
          <div className="glass-card p-5" style={{ borderLeft: '5px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Créditos y Progreso</span>
              {perfil?.esRestringido && (
                <span className="pulse-badge" style={{ background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>
                  RESTRICCIÓN 15 CR
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4f46e5', margin: 0 }}>{perfil?.creditosAprobados}</h3>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>aprobados</span>
              <h4 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0ea5e9', margin: '0 0 0 0.75rem' }}>+{perfil?.creditosMatriculados}</h4>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>matriculados</span>
            </div>
            
            {/* Progress bar dual */}
            <div style={{ height: '8px', background: 'var(--surface)', borderRadius: '4px', display: 'flex', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div style={{ width: `${(perfil?.creditosAprobados / perfil?.limiteCreditos) * 100}%`, background: '#6366f1' }}></div>
              <div style={{ width: `${(perfil?.creditosMatriculados / perfil?.limiteCreditos) * 100}%`, background: '#38bdf8' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
              <span>Límite de Matrícula: {perfil?.limiteCreditos} CR</span>
              <span>Progreso: {Math.round(((perfil?.creditosAprobados + perfil?.creditosMatriculados) / perfil?.limiteCreditos) * 100)}%</span>
            </div>
          </div>

          {/* Card 2: Nivel Académico */}
          <div className="glass-card p-5" style={{ borderLeft: '5px solid #10b981', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '14px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Nivel Académico</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.15rem 0' }}>{perfil?.estudiante?.cicloActual}° Ciclo</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>{perfil?.estudiante?.carreraNombre}</p>
            </div>
          </div>

          {/* Card 3: Personalización IA */}
          <div className="glass-card p-5" style={{ borderLeft: '5px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(245,158,11,0.1)', padding: '12px', borderRadius: '14px', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Algoritmo Inteligente</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.15rem 0' }}>Matrícula Automatizada</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Genera un horario sin colisiones</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <button 
                onClick={handleGenerarIA}
                disabled={isGeneratingIA}
                style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', opacity: isGeneratingIA ? 0.7 : 1 }}
              >
                {isGeneratingIA ? <div style={{ border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                Generar Horario
              </button>
              <button 
                onClick={() => setShowPrefsModal(true)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--surface)', color: '#64748b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Cpu size={14} /> Preferencias
              </button>
            </div>
          </div>

        </div>

        {/* 📅 DOS COLUMNAS PRINCIPALES */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="grid-responsive">
          
          {/* Columna Izquierda: Horario Semanal y Recomendaciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* 🗓️ MI AGENDA SEMANAL DINÁMICA */}
            <div className="glass-card" style={{ padding: '1.75rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>📅 Mi Agenda Semanal</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Tus clases matriculadas distribuidas en el calendario</p>
                </div>
                <button onClick={handleDownloadPDF} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--surface)', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} className="hover:bg-slate-50">
                  <Download size={16} /> Exportar PDF
                </button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="schedule-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Hora</th>
                      {DIAS.map(d => (
                        <th key={d}>{d.substring(0, 3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOTS.map(slot => (
                      <tr key={slot}>
                        <td style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', background: 'var(--surface)', whiteSpace: 'nowrap' }}>
                          {slot.split(' - ')[0]}
                        </td>
                        {DIAS.map(dia => {
                          const seccion = getSeccionEnSlot(dia, slot);
                          if (seccion) {
                            const colors = getPastelColor(seccion.curso?._id);
                            return (
                              <td key={dia} style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, padding: '6px', borderRadius: '4px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: colors.text, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '4px' }} title={seccion.curso?.nombre}>
                                  {seccion.curso?.nombre}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.6rem', color: '#475569', fontWeight: '600' }}>
                                    <Clock size={10} color={colors.text}/> {seccion.horario || `${seccion.horaInicio}-${seccion.horaFin}`}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.6rem', color: '#475569', fontWeight: '600' }}>
                                    <MapPin size={10} color={colors.text}/> Aula {seccion.aula}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.6rem', color: '#475569', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={seccion.docente?.nombre}>
                                    <Users size={10} color={colors.text}/> {seccion.docente?.apellidos || 'Por Asignar'}
                                  </div>
                                </div>
                              </td>
                            );
                          }
                          return <td key={dia} style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>-</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🤖 CURSOS DISPONIBLES / RECOMENDACIONES IA */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Sparkles size={20} color="#4f46e5" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Cursos Recomendados y Disponibles (Ciclo Actual)</h3>
              </div>
              
              {secciones.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '1rem', margin: '0 auto' }} />
                  <p style={{ fontWeight: '500', margin: 0 }}>No hay cursos disponibles o ya te has matriculado en todos tus cursos de este ciclo.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {secciones.map(s => {
                    const cuposRestantes = s.cupoMaximo - s.estudiantesMatriculados.length;
                    return (
                      <div key={s._id} className="glass-card p-5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <span style={{ background: 'var(--surface)', color: '#475569', fontSize: '0.65rem', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                              Sección {s.codigoSeccion}
                            </span>
                            <span style={{ color: '#4f46e5', fontWeight: '800', fontSize: '0.75rem', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 8px', borderRadius: '20px' }}>
                              {s.curso?.creditos} CR
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.75rem 0', lineHeight: '1.3' }}>{s.curso?.nombre}</h4>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '#64748b', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}><Users size={14}/> Prof. {s.docente?.nombre} {s.docente?.apellidos}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}><Clock size={14}/> {s.horario}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}><MapPin size={14}/> Aula {s.aula}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                          <button onClick={() => handleMatricular(s._id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                            Matricularme
                          </button>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: cuposRestantes < 5 ? '#ef4444' : '#10b981', whiteSpace: 'nowrap' }}>
                            {cuposRestantes} libres
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Columna Derecha: Próximos Eventos / Horario Resumido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 📌 PRÓXIMOS EVENTOS (24H REMINDERS) */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <div style={{ background: '#0f172a', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Clases del Día</h4>
                <span style={{ background: '#4f46e5', fontSize: '0.7rem', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                  {clasesHoy.length} asignadas
                </span>
              </div>
              
              <div style={{ padding: '1rem' }}>
                {clasesHoy.length === 0 ? (
                  <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <Clock size={36} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <h5 style={{ fontWeight: '700', margin: '0 0 0.25rem 0', color: '#334155' }}>Todo en orden</h5>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>No tienes clases programadas para el día de hoy.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {clasesHoy.map(c => {
                      const colors = getPastelColor(c.curso?._id);
                      return (
                        <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--surface)', transition: 'all 0.2s' }}>
                          <div style={{ backgroundColor: colors.bg, color: colors.text, padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.15rem 0' }}>{c.curso?.nombre}</h5>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                              {c.horario} • <span style={{ fontWeight: '700' }}>Aula {c.aula}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* MIS CURSOS MATRICULADOS RESUMEN */}
            <div className="glass-card p-5">
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>Resumen de Cursos ({misSecciones.length})</h4>
              
              {misSecciones.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Aún no te has matriculado en ningún curso.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {misSecciones.map(s => (
                    <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', margin: '0 0 0.15rem 0' }}>{s.curso?.nombre}</h5>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Sección {s.codigoSeccion} • Aula {s.aula}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: '#4f46e5', fontWeight: '800', fontSize: '0.75rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: '6px' }}>
                          {s.curso?.creditos} CR
                        </span>
                        <button onClick={() => handleRectificar(s._id)} aria-label={`Retirarme de ${s.curso?.nombre}`} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Retirarme del curso">
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Preferencias Modal */}
        {showPrefsModal && (
          <dialog open aria-modal="true" aria-labelledby="modal-prefs-title" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', border: 'none' }}>
            <div className="glass-card" style={{ background: 'var(--surface)', width: '90%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', margin: 'auto' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '10px', color: '#f59e0b' }}><Cpu size={20} aria-hidden="true" /></div>
                   <h3 id="modal-prefs-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Preferencias de IA</h3>
                </div>
                <button aria-label="Cerrar modal" onClick={() => setShowPrefsModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><LogOut size={20} aria-hidden="true" /></button>
              </div>
              
              <div style={{ padding: '2rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Configura tus preferencias para que el algoritmo busque la mejor combinación de cursos y horarios disponibles sin colisiones.</p>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="ia-turno" style={{ display: 'block', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Turno Preferido</label>
                  <select id="ia-turno" value={iaPrefs.turno} onChange={(e) => setIaPrefs({...iaPrefs, turno: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--surface)', color: '#0f172a' }}>
                    <option value="MIXTO">Indiferente (Mixto)</option>
                    <option value="MAÑANA">Mañana (07:00 - 13:00)</option>
                    <option value="TARDE">Tarde (13:00 - 18:00)</option>
                    <option value="NOCHE">Noche (18:00 - 22:00)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="ia-cant-cursos" style={{ display: 'block', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Cantidad de Cursos</label>
                    <input id="ia-cant-cursos" type="number" min="1" max="7" value={iaPrefs.cantidadCursos} onChange={(e) => setIaPrefs({...iaPrefs, cantidadCursos: Number(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--surface)', color: '#0f172a' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="ia-dias" style={{ display: 'block', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Días a la semana (Máx)</label>
                    <input id="ia-dias" type="number" min="1" max="7" value={iaPrefs.diasPorSemana} onChange={(e) => setIaPrefs({...iaPrefs, diasPorSemana: Number(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--surface)', color: '#0f172a' }} />
                  </div>
                </div>

                <button onClick={() => setShowPrefsModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </dialog>
        )}

        {/* IA Resultados Modal */}
        {showResultsModal && iaResult && (
          <div role="dialog" aria-modal="true" aria-labelledby="modal-results-title" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' }}>
            <div className="glass-card" style={{ background: 'var(--surface)', width: '90%', maxWidth: '700px', borderRadius: '24px', overflow: 'hidden', margin: 'auto' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '10px', color: '#f59e0b' }}><Sparkles size={20} aria-hidden="true" /></div>
                   <h3 id="modal-results-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Opciones de Horario</h3>
                </div>
                <button aria-label="Cerrar resultados" onClick={() => setShowResultsModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><LogOut size={20} aria-hidden="true" /></button>
              </div>
              
              <div style={{ padding: '2rem' }}>
                <div style={{ padding: '1rem', borderRadius: '12px', background: iaResult.success ? '#ecfdf5' : '#fffbeb', border: `1px solid ${iaResult.success ? '#a7f3d0' : '#fde68a'}`, marginBottom: '1.5rem' }}>
                  <p style={{ margin: 0, fontWeight: '700', color: iaResult.success ? '#065f46' : '#d97706' }}>{iaResult.message}</p>
                </div>

                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {iaResult.alternativas.length > 0 ? iaResult.alternativas.map((alt, idx) => (
                    <div key={idx} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ margin: '0', fontWeight: '600', color: '#334155', fontSize: '0.9rem', lineHeight: '1.4' }}>{alt.descripcion}</p>
                      <button onClick={() => aplicarAlternativa(alt)} style={{ width: '100%', padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}>
                        Aplicar Alternativa {idx + 1}
                      </button>
                    </div>
                  )) : (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No se encontraron alternativas.</p>
                  )}
                </div>

                <button onClick={() => setShowResultsModal(false)} style={{ marginTop: '1.5rem', width: '100%', padding: '10px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default EstudianteDashboard;
