import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  BarChart2, AlertTriangle, CheckCircle, Users, Clock,
  TrendingUp, RefreshCw, ChevronDown, ChevronUp, ShieldAlert,
  XCircle, Edit2, PlusCircle, Search, Calendar, LayoutDashboard
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const MAX_HORAS = 48;
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function PlanificacionManager() {
  const [activeTab, setActiveTab] = useState('planificador'); // 'planificador' | 'estadisticas'

  const [stats, setStats] = useState(null);
  const [cargaHoraria, setCargaHoraria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCarga, setLoadingCarga] = useState(true);
  const [expandedDocente, setExpandedDocente] = useState(null);
  
  // Filtros
  const [filtroCarga, setFiltroCarga] = useState('todos');
  const [busquedaDocente, setBusquedaDocente] = useState('');

  // Modals state
  const [seccionReasignar, setSeccionReasignar] = useState(null);
  const [seccionEditar, setSeccionEditar] = useState(null);

  const cargarStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/planificacion/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error cargando planificación:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCargaHoraria = async () => {
    setLoadingCarga(true);
    try {
      const res = await axios.get('/api/admin/planificacion/carga-horaria');
      setCargaHoraria(res.data);
    } catch (err) {
      console.error('Error cargando carga horaria:', err);
    } finally {
      setLoadingCarga(false);
    }
  };

  const handleRefresh = () => { cargarStats(); cargarCargaHoraria(); };

  useEffect(() => { cargarStats(); cargarCargaHoraria(); }, []);

  const handleLiberarSeccion = async (seccionId) => {
    if (!window.confirm('¿Estás seguro de quitar al docente de esta sección? Quedará como vacante.')) return;
    try {
      await axios.put(`/api/admin/planificacion/seccion/${seccionId}/liberar`);
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al liberar sección');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--primary-alpha)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Calculando planificación en tiempo real...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!stats) return <div style={{ padding: '2rem', color: '#ef4444' }}>Error al cargar los datos.</div>;

  const { kpis, graficos, alertas } = stats;
  const totalConflictos = (alertas.conflictosDocente?.length || 0) + (alertas.conflictosAula?.length || 0);

  const chartOpts = () => ({
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y ?? ctx.parsed}` } } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  });

  const datosHistograma = {
    labels: ['0-10h', '11-20h', '21-30h', '31-40h', '41-48h', '>48h'],
    datasets: [{
      label: 'Docentes',
      data: [
        graficos.histogramaCarga['0-10h'], graficos.histogramaCarga['11-20h'],
        graficos.histogramaCarga['21-30h'], graficos.histogramaCarga['31-40h'],
        graficos.histogramaCarga['41-48h'], graficos.histogramaCarga['>48h']
      ],
      backgroundColor: ['#10b981cc', '#14b8a6cc', '#0ea5e9cc', '#6366f1cc', '#f59e0bcc', '#ef4444cc'],
      borderRadius: 6
    }]
  };

  const datosDias = {
    labels: DIAS,
    datasets: [{ label: 'Secciones', data: DIAS.map(d => graficos.cargaPorDia[d] || 0), backgroundColor: '#6366f1cc', borderRadius: 8 }]
  };

  const distKeys = ['0-24%', '25-49%', '50-74%', '75-99%', '100%'];
  const datosOcupacion = {
    labels: distKeys,
    datasets: [{ label: 'Salones', data: distKeys.map(k => graficos.distOcupacion[k] || 0), backgroundColor: ['#10b981cc','#6366f1cc','#f59e0bcc','#ef4444cc','#dc2626'], borderRadius: 8 }]
  };

  const docentesFiltrados = (cargaHoraria?.docentes || []).filter(d => {
    if (filtroCarga !== 'todos' && d.estado !== filtroCarga) return false;
    if (busquedaDocente && !d.nombre.toLowerCase().includes(busquedaDocente.toLowerCase())) return false;
    return true;
  });

  const estadoConfig = {
    exceso:  { label: 'Excede 48h',      color: '#ef4444', bg: '#fef2f2', icon: '🔴' },
    limite:  { label: 'Próximo al límite', color: '#f59e0b', bg: '#fffbeb', icon: '⚠️' },
    normal:  { label: 'Normal',           color: '#10b981', bg: '#f0fdf4', icon: '✅' },
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header Principal ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Centro de Planificación</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Armado de horarios y administración de carga docente.</p>
          </div>
        </div>
        <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.88rem', transition: 'all 0.2s' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* ── Pestañas de Navegación (Tabs) ── */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('planificador')}
          style={{
            background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
            fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
            color: activeTab === 'planificador' ? 'var(--primary-purple)' : 'var(--text-muted)',
            borderBottom: activeTab === 'planificador' ? '3px solid var(--primary-purple)' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}
        >
          <LayoutDashboard size={20} /> Planificador de Horarios
        </button>
        <button
          onClick={() => setActiveTab('estadisticas')}
          style={{
            background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
            fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
            color: activeTab === 'estadisticas' ? 'var(--primary-purple)' : 'var(--text-muted)',
            borderBottom: activeTab === 'estadisticas' ? '3px solid var(--primary-purple)' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}
        >
          <BarChart2 size={20} /> Estadísticas y Conflictos
          {totalConflictos > 0 && (
            <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '99px' }}>{totalConflictos}</span>
          )}
        </button>
      </div>

      {/* ==================================================================================== */}
      {/* ── PESTAÑA 1: PLANIFICADOR DE HORARIOS (Vista Principal Enfocada) ── */}
      {/* ==================================================================================== */}
      {activeTab === 'planificador' && (
        <div className="animate-fade-in">
          
          {/* Vacantes de Urgencia (Solo si hay) */}
          {alertas.seccionesSinAsignar.length > 0 && (
            <div className="modern-card" style={{ marginBottom: '1.5rem', border: '1px solid #fdba74', background: '#fff7ed' }}>
              <h3 style={{ ...chartTitle, color: '#ea580c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18}/> Urgencia: {alertas.seccionesSinAsignar.length} Secciones Sin Docente Asignado
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {alertas.seccionesSinAsignar.map(s => (
                  <div key={s._id} style={{ background: 'white', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(234, 88, 12, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#ea580c', fontSize: '0.9rem' }}>{s.codigoSeccion} — {s.curso}</span>
                      <button onClick={() => setSeccionEditar(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea580c' }} title="Editar Aula/Horario"><Edit2 size={14}/></button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9a3412', marginBottom: '10px', display: 'flex', gap: '8px' }}>
                      <span style={{background: '#ffedd5', padding: '2px 6px', borderRadius: '4px'}}>📅 {s.dias?.join(', ')}</span>
                      <span style={{background: '#ffedd5', padding: '2px 6px', borderRadius: '4px'}}>⏰ {s.horaInicio} – {s.horaFin}</span>
                    </div>
                    <button onClick={() => setSeccionReasignar(s)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <PlusCircle size={16} /> Asignar Docente
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de Administración de Carga (Core Visual) */}
          <div className="modern-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', border: '1px solid var(--border)' }}>
            
            {/* Header del Planificador */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-color)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="Buscar docente por nombre..." value={busquedaDocente} onChange={e => setBusquedaDocente(e.target.value)} style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem', width: '250px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { key: 'todos',  label: `Todos (${cargaHoraria?.docentes?.length || 0})` },
                  { key: 'exceso', label: `🔴 Exceso (${cargaHoraria?.docentes?.filter(d => d.estado === 'exceso').length || 0})` },
                  { key: 'limite', label: `⚠️ Límite (${cargaHoraria?.docentes?.filter(d => d.estado === 'limite').length || 0})` },
                  { key: 'normal', label: `✅ Normal (${cargaHoraria?.docentes?.filter(d => d.estado === 'normal').length || 0})` },
                ].map(f => (
                  <button
                    key={f.key} onClick={() => setFiltroCarga(f.key)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', background: filtroCarga === f.key ? 'var(--primary-purple)' : 'var(--surface)', color: filtroCarga === f.key ? 'white' : 'var(--text-muted)', transition: 'all 0.2s ease' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grilla de Docentes */}
            {loadingCarga && (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando disponibilidad docente...</div>
            )}
            {!loadingCarga && docentesFiltrados.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No hay docentes que coincidan con la búsqueda.</div>
            )}
            {!loadingCarga && docentesFiltrados.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {docentesFiltrados.map(doc => {
                  const cfg = estadoConfig[doc.estado];
                  const pct = Math.min((doc.totalHoras / MAX_HORAS) * 100, 100);
                  
                  let barColor = '#10b981';
                  if (doc.estado === 'exceso') barColor = '#ef4444';
                  else if (doc.estado === 'limite') barColor = '#f59e0b';
                  const isOpen = expandedDocente === doc._id;

                  return (
                    <div key={doc._id} style={{ border: `1px solid ${isOpen ? barColor + '66' : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s', background: isOpen ? 'var(--bg-color)' : 'var(--surface)' }}>
                      {/* Fila principal del docente */}
                      <div
                        role="button"
                        tabIndex={0}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px 100px auto', alignItems: 'center', gap: '1.5rem', padding: '16px 20px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onClick={() => setExpandedDocente(isOpen ? null : doc._id)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpandedDocente(isOpen ? null : doc._id)}
                        aria-expanded={isOpen}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>{cfg.icon} {doc.nombre}</div>
                          <div style={{ background: 'var(--border)', borderRadius: '99px', height: '6px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: barColor, transition: 'width 0.6s ease' }} />
                            <div style={{ position: 'absolute', top: 0, left: '100%', width: '2px', height: '100%', background: '#94a3b8', transform: 'translateX(-2px)' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Disponibilidad</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-purple)', background: 'var(--primary-alpha)', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                            {doc.turnoDisponibilidad || 'Tiempo Completo'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: barColor, lineHeight: 1 }}>{doc.totalHoras}h</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>de {MAX_HORAS}h</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>{doc.secciones.length}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>secciones</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isOpen ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                        </div>
                      </div>

                      {/* Espacio de Trabajo del Docente (Calendario + Clases) */}
                      {isOpen && (
                        <div style={{ padding: '20px', borderTop: `1px solid ${barColor}33`, display: 'flex', gap: '2rem', background: 'var(--surface)' }}>
                          
                          {/* Columna 1: Lista de Clases Asignadas */}
                          <div style={{ flex: '0 0 35%' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Users size={18} color="var(--primary-purple)"/> Secciones Asignadas ({doc.secciones.length})
                            </h4>
                            {doc.secciones.length === 0 ? (
                              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>No tiene secciones asignadas.</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {doc.secciones.map(sec => (
                                  <div key={sec._id} style={{ background: 'var(--bg-color)', borderRadius: '8px', padding: '12px', borderLeft: `4px solid ${barColor}`, border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                      <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.85rem' }}>{sec.codigoSeccion}</span>
                                      <span style={{ fontWeight: '800', color: barColor, background: barColor+'11', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{sec.horas}h</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '600' }}>{sec.curso}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                      <span style={{background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px'}}>📅 {sec.dias?.join(', ')}</span>
                                      <span style={{background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px'}}>⏰ {sec.horaInicio}-{sec.horaFin}</span>
                                    </div>
                                    
                                    {/* Botones CRUD */}
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button onClick={(e) => { e.stopPropagation(); setSeccionReasignar(sec); }} style={btnStyle('var(--primary-purple)')} title="Reasignar a otro docente"><RefreshCw size={12}/> Cambiar</button>
                                      <button onClick={(e) => { e.stopPropagation(); setSeccionEditar(sec); }} style={btnStyle('var(--text-main)')} title="Editar horario/aula"><Edit2 size={12}/> Editar</button>
                                      <button onClick={(e) => { e.stopPropagation(); handleLiberarSeccion(sec._id); }} style={btnStyle('#ef4444')} title="Quitar docente"><XCircle size={12}/> Liberar</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Columna 2: Calendario Visual */}
                          <div style={{ flex: '1' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={18} color="var(--primary-purple)"/> Calendario de Disponibilidad
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(dia => {
                                const clasesDia = doc.secciones.filter(s => s.dias.includes(dia)).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
                                return (
                                  <div key={dia} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', background: 'var(--bg-color)', minHeight: '150px', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', textAlign: 'center', marginBottom: '12px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{dia}</div>
                                    {clasesDia.length === 0 ? (
                                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#10b981', fontWeight: '700', background: '#10b98111', borderRadius: '6px', border: '1px dashed #10b98155' }}>Libre</div>
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {clasesDia.map(c => (
                                          <div key={c._id} style={{ fontSize: '0.75rem', background: 'var(--primary-alpha)', color: 'var(--primary-purple)', padding: '8px', borderRadius: '6px', textAlign: 'center', fontWeight: '700', borderLeft: '3px solid var(--primary-purple)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            {c.horaInicio} - {c.horaFin}<br/>
                                            <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: '500', display: 'block', marginTop: '2px' }}>{c.codigoSeccion}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* ── PESTAÑA 2: ESTADÍSTICAS Y REPORTES (Oculto por defecto) ── */}
      {/* ==================================================================================== */}
      {activeTab === 'estadisticas' && (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
          
          {/* Tarjetas KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <KpiCard icon={<BarChart2 size={22}/>} label="Total Salones" value={kpis.totalSecciones} color="#6366f1" />
            <KpiCard icon={<TrendingUp size={22}/>} label="% Ocupación" value={`${kpis.porcentajeOcupacion}%`} color="#10b981" />
            <KpiCard icon={<Users size={22}/>} label="Salones Llenos" value={kpis.salonesLlenos} color="#ef4444" />
            <KpiCard icon={<ShieldAlert size={22}/>} label="Vacantes" value={alertas.seccionesSinAsignar.length} color={alertas.seccionesSinAsignar.length > 0 ? '#f97316' : '#10b981'} highlight={alertas.seccionesSinAsignar.length > 0} />
            <KpiCard icon={<Clock size={22}/>} label="Docentes Activos" value={kpis.docentesConSeccion} color="#8b5cf6" />
            <KpiCard icon={<ShieldAlert size={22}/>} label="En Exceso (>48h)" value={kpis.docentesEnExceso} color={kpis.docentesEnExceso > 0 ? '#ef4444' : '#10b981'} highlight={kpis.docentesEnExceso > 0} />
          </div>

          {/* Gráficos Globales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="modern-card">
              <h3 style={chartTitle}>📊 Histograma de Carga</h3>
              <Bar data={datosHistograma} options={chartOpts()} />
            </div>
            <div className="modern-card">
              <h3 style={chartTitle}>📅 Secciones por Día</h3>
              <Bar data={datosDias} options={chartOpts()} />
            </div>
            <div className="modern-card">
              <h3 style={chartTitle}>🏫 Ocupación Aulas</h3>
              <Bar data={datosOcupacion} options={chartOpts()} />
            </div>
          </div>

          {/* Alertas de Conflictos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="modern-card">
              <h3 style={{ ...chartTitle, color: totalConflictos > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {totalConflictos > 0 ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>} Conflictos Físicos ({totalConflictos})
              </h3>
              {totalConflictos === 0 ? (
                <div style={{ color: '#10b981', fontSize: '0.9rem', padding: '1rem 0' }}>✅ No se detectaron conflictos de cruce horario.</div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
                  {alertas.conflictosDocente.map((c) => (
                    <AlertaItem key={`d-${c.docente}-${c.seccion1.curso}`} tipo="Docente" color="#ef4444" icono="👤" msg={`${c.docente}: "${c.seccion1.curso}" vs "${c.seccion2.curso}"`} detalle={`${c.seccion1.horario} | ${c.seccion2.horario}`} />
                  ))}
                  {alertas.conflictosAula.map((c) => (
                    <AlertaItem key={`a-${c.aula}-${c.seccion1.curso}`} tipo="Aula" color="#f97316" icono="🏫" msg={`Aula ${c.aula}: "${c.seccion1.curso}" vs "${c.seccion2.curso}"`} detalle={`${c.seccion1.horario} | ${c.seccion2.horario}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="modern-card">
              <h3 style={{ ...chartTitle, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18}/> Salones Casi Llenos ({alertas.casiLlenos.length})
              </h3>
              {alertas.casiLlenos.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No hay salones con ocupación ≥ 80%.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                  {alertas.casiLlenos.map((s) => (
                    <div key={s.codigo || s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{s.codigo} - {s.curso}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f59e0b', background: '#fef3c7', padding: '4px 12px', borderRadius: '12px' }}>{s.pct}% ocupado</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modales (Disponibles en ambas vistas) */}
      {seccionReasignar && <ReasignarDocenteModal seccion={seccionReasignar} onClose={() => setSeccionReasignar(null)} onSuccess={() => { setSeccionReasignar(null); handleRefresh(); }} />}
      {seccionEditar && <EditarHorarioModal seccion={seccionEditar} onClose={() => setSeccionEditar(null)} onSuccess={() => { setSeccionEditar(null); handleRefresh(); }} />}

    </div>
  );
}

// ── Modales y Helpers se mantienen igual que en la versión anterior ──

function EditarHorarioModal({ seccion, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    dias: seccion.dias || [],
    horaInicio: seccion.horaInicio || '08:00',
    horaFin: seccion.horaFin || '10:00',
    aula: seccion.aula || ''
  });
  const [saving, setSaving] = useState(false);

  const handleToggleDia = (dia) => {
    setFormData(prev => ({
      ...prev,
      dias: prev.dias.includes(dia) ? prev.dias.filter(d => d !== dia) : [...prev.dias, dia]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/planificacion/seccion/${seccion._id}/horario`, formData);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error al guardar horario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Editar Horario y Aula" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="modern-card animate-fade-in" role="presentation" onKeyDown={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>✏️ Editar Horario y Aula</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><span>&times;</span></button>
        </h3>
        
        <div style={labelStyle}>Días de la semana</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
          {DIAS.map(d => (
            <button key={d} onClick={() => handleToggleDia(d)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid', borderColor: formData.dias.includes(d) ? 'var(--primary-purple)' : 'var(--border)', background: formData.dias.includes(d) ? 'var(--primary-alpha)' : 'transparent', color: formData.dias.includes(d) ? 'var(--primary-purple)' : 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>
              {d.substring(0,3)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="hora-inicio-mod" style={labelStyle}>Hora Inicio</label>
            <input id="hora-inicio-mod" type="time" value={formData.horaInicio} onChange={e => setFormData({...formData, horaInicio: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="hora-fin-mod" style={labelStyle}>Hora Fin</label>
            <input id="hora-fin-mod" type="time" value={formData.horaFin} onChange={e => setFormData({...formData, horaFin: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <label htmlFor="aula-mod" style={labelStyle}>Aula</label>
        <input id="aula-mod" type="text" placeholder="Ej: A101" value={formData.aula} onChange={e => setFormData({...formData, aula: e.target.value})} style={{ ...inputStyle, marginBottom: '1.5rem' }} />

        <button onClick={handleSave} disabled={saving} style={{ padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary-purple)', color: 'white', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}

EditarHorarioModal.propTypes = {
  seccion: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    dias: PropTypes.arrayOf(PropTypes.string),
    horaInicio: PropTypes.string,
    horaFin: PropTypes.string,
    aula: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

function ReasignarDocenteModal({ seccion, onClose, onSuccess }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!seccion) return;
    const fetchSugerencias = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/admin/planificacion/docentes-disponibles?horaInicio=${seccion.horaInicio}&horaFin=${seccion.horaFin}&dias=${seccion.dias.join(',')}`);
        setSugerencias(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSugerencias();
  }, [seccion]);

  const handleReasignar = async (docenteId) => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/planificacion/seccion/${seccion._id}/reasignar`, { docenteId });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error al reasignar');
    } finally {
      setSaving(false);
    }
  };

  if (!seccion) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Asignar Docente" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="modern-card animate-fade-in" role="presentation" onKeyDown={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔄 Asignar Docente</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}><span>&times;</span></button>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', background: 'var(--bg-color)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <strong style={{ color: 'var(--text-main)' }}>{seccion.codigoSeccion} - {seccion.curso}</strong><br/>
          📅 {seccion.dias.join(', ')} &nbsp;|&nbsp; ⏰ {seccion.horaInicio} - {seccion.horaFin} &nbsp;|&nbsp; ⌛ {seccion.horas || '?'}h
        </p>
        
        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Docentes Sugeridos (Sin cruces)</h4>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Buscando docentes sin cruce de horario...</div>
        )}
        {!loading && sugerencias.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#ef4444', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            No hay docentes disponibles con menos de {MAX_HORAS}h y sin cruces.
          </div>
        )}
        {!loading && sugerencias.length > 0 && (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px' }}>
            {sugerencias.map(doc => (
              <div key={doc._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>{doc.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Carga proyectada: <span style={{ fontWeight: '800', color: doc.horasProyectadas >= 40 ? '#f59e0b' : '#10b981' }}>{doc.horasProyectadas}h</span> (actual: {doc.horasActuales}h)
                  </div>
                </div>
                <button onClick={() => handleReasignar(doc._id)} disabled={saving} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-purple)', color: 'white', fontSize: '0.8rem', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  Asignar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ReasignarDocenteModal.propTypes = {
  seccion: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    codigoSeccion: PropTypes.string,
    curso: PropTypes.string,
    horaInicio: PropTypes.string,
    horaFin: PropTypes.string,
    horas: PropTypes.number,
    dias: PropTypes.arrayOf(PropTypes.string)
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

function KpiCard({ icon, label, value, color, highlight }) {
  return (
    <div className="modern-card" style={{ textAlign: 'center', padding: '1.5rem 1rem', border: highlight ? `2px solid ${color}55` : undefined, background: highlight ? color + '0a' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <div style={{ padding: '10px', background: color + '22', borderRadius: '12px', color }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: highlight ? color : 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

KpiCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  highlight: PropTypes.bool,
};

function AlertaItem({ tipo, color, icono, msg, detalle }) {
  return (
    <div style={{ background: color + '11', border: `1px solid ${color}44`, borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: '800', color, marginBottom: '4px' }}>{icono} Conflicto de {tipo}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '2px' }}>{msg}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{detalle}</div>
    </div>
  );
}

AlertaItem.propTypes = {
  tipo: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  icono: PropTypes.string.isRequired,
  msg: PropTypes.string.isRequired,
  detalle: PropTypes.string.isRequired,
};

const btnStyle = (color) => ({
  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px',
  background: 'transparent', border: `1px solid ${color}44`, color: color,
  fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', flex: 1, justifyContent: 'center'
});

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' };
const chartTitle = { fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 1rem 0' };

export default PlanificacionManager;
