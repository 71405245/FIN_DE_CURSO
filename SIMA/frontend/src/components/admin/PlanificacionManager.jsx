import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart2, AlertTriangle, CheckCircle, Users, Calendar, Clock, MapPin, TrendingUp, RefreshCw } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

// Paleta de colores por carrera (se asigna automáticamente)
const CARRERA_COLORS = [
  '#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16',
  '#06b6d4','#a855f7','#e11d48','#0891b2','#65a30d',
  '#7c3aed','#db2777','#059669','#d97706','#dc2626'
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 a 22:00

function PlanificacionManager() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diaActivo, setDiaActivo] = useState('Lunes');
  const [tooltip, setTooltip] = useState(null);
  const [carreraColorMap, setCarreraColorMap] = useState({});

  const cargarStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/planificacion/stats');
      setStats(res.data);
      // Construir mapa de colores por carrera
      const mapa = {};
      let idx = 0;
      (res.data.secciones || []).forEach(s => {
        const carreraId = s.curso?.carrera || s.curso?._id || 'sin-carrera';
        if (!mapa[carreraId]) {
          mapa[carreraId] = CARRERA_COLORS[idx % CARRERA_COLORS.length];
          idx++;
        }
      });
      setCarreraColorMap(mapa);
    } catch (err) {
      console.error('Error cargando planificación:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarStats(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--primary-alpha)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Calculando estadísticas en tiempo real...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!stats) return <div style={{ padding: '2rem', color: '#ef4444' }}>Error al cargar los datos de planificación.</div>;

  const { kpis, graficos, alertas, secciones } = stats;
  const totalConflictos = (alertas.conflictosDocente?.length || 0) + (alertas.conflictosAula?.length || 0);

  // Opciones comunes para gráficos
  const chartOpts = (title) => ({
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y ?? ctx.parsed} secciones` } } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  });

  // Datos para gráfico de barras por día
  const datosDias = {
    labels: DIAS,
    datasets: [{
      label: 'Secciones',
      data: DIAS.map(d => graficos.cargaPorDia[d] || 0),
      backgroundColor: '#6366f1cc',
      borderRadius: 8,
    }]
  };

  // Datos para doughnut de turnos
  const datosTurnos = {
    labels: ['Mañana (7–12)', 'Tarde (13–17)', 'Noche (18–22)'],
    datasets: [{
      data: [graficos.turnos['Mañana'], graficos.turnos['Tarde'], graficos.turnos['Noche']],
      backgroundColor: ['#fbbf24', '#6366f1', '#1e293b'],
      borderWidth: 0,
    }]
  };

  // Datos para top docentes
  const datosDocentes = {
    labels: graficos.topDocentes.map(d => d.nombre.split(' ')[0] + ' ' + (d.nombre.split(' ')[2] || d.nombre.split(' ')[1] || '')),
    datasets: [{
      label: 'Secciones',
      data: graficos.topDocentes.map(d => d.secciones),
      backgroundColor: graficos.topDocentes.map((_, i) => CARRERA_COLORS[i % CARRERA_COLORS.length] + 'cc'),
      borderRadius: 6,
    }]
  };

  // Datos distribución de ocupación
  const distKeys = ['0-24%', '25-49%', '50-74%', '75-99%', '100%'];
  const datosOcupacion = {
    labels: distKeys,
    datasets: [{
      label: 'Salones',
      data: distKeys.map(k => graficos.distOcupacion[k] || 0),
      backgroundColor: ['#10b981cc','#6366f1cc','#f59e0bcc','#ef4444cc','#dc2626'],
      borderRadius: 8,
    }]
  };

  // Secciones del día activo para el calendario
  const seccionesDia = secciones.filter(s => s.dias?.includes(diaActivo));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Centro de Planificación</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Inteligencia en tiempo real sobre horarios, salones y carga docente.</p>
          </div>
        </div>
        <button
          onClick={cargarStats}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.88rem' }}
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* ── SECCIÓN 1: KPI Cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard icon={<BarChart2 size={22}/>} label="Total Salones" value={kpis.totalSecciones} color="#6366f1" />
        <KpiCard icon={<TrendingUp size={22}/>} label="% Ocupación" value={`${kpis.porcentajeOcupacion}%`} color="#10b981" />
        <KpiCard icon={<Users size={22}/>} label="Salones Llenos" value={kpis.salonesLlenos} color="#ef4444" />
        <KpiCard icon={<CheckCircle size={22}/>} label="Cupos Libres" value={kpis.cuposDisponibles.toLocaleString()} color="#f59e0b" />
        <KpiCard icon={<Users size={22}/>} label="Docentes Activos" value={kpis.docentesConSeccion} color="#8b5cf6" />
      </div>

      {/* ── SECCIÓN 2: Gráficos ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="modern-card">
          <h3 style={chartTitle}>📅 Secciones por Día de Semana</h3>
          <Bar data={datosDias} options={chartOpts('Secciones')} />
        </div>
        <div className="modern-card">
          <h3 style={chartTitle}>🌙 Distribución por Turno</h3>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Doughnut data={datosTurnos} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
          </div>
        </div>
        <div className="modern-card">
          <h3 style={chartTitle}>🏆 Top 10 Docentes por Carga</h3>
          <Bar data={datosDocentes} options={{ ...chartOpts(), indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } }, y: { grid: { display: false } } } }} />
        </div>
        <div className="modern-card">
          <h3 style={chartTitle}>📊 Distribución de Ocupación</h3>
          <Bar data={datosOcupacion} options={chartOpts()} />
        </div>
      </div>

      {/* ── SECCIÓN 3: Calendario Visual ────────────────────────────────────── */}
      <div className="modern-card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        <h3 style={{ ...chartTitle, marginBottom: '1.25rem' }}>📅 Calendario Visual de Horarios</h3>

        {/* Tabs por día */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {DIAS.map(dia => (
            <button
              key={dia}
              onClick={() => setDiaActivo(dia)}
              style={{
                padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                background: diaActivo === dia ? 'var(--primary-purple)' : 'var(--bg-color)',
                color: diaActivo === dia ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {dia} <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({secciones.filter(s => s.dias?.includes(dia)).length})</span>
            </button>
          ))}
        </div>

        {/* Cuadrícula */}
        <div style={{ position: 'relative', overflowX: 'auto' }}>
          {/* Columna de horas */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 0 }}>
            <div /> {/* Esquina vacía */}
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '0.5rem' }}>
              {diaActivo}
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: `${HORAS.length * 56}px` }}>
            {/* Filas de horas */}
            {HORAS.map(h => (
              <div key={h} style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
                <div style={{ width: '60px', minWidth: '60px', padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', height: '56px', display: 'flex', alignItems: 'flex-start', paddingTop: '6px' }}>
                  {String(h).padStart(2,'0')}:00
                </div>
                <div style={{ flex: 1, height: '56px', position: 'relative' }} />
              </div>
            ))}

            {/* Bloques de secciones */}
            {seccionesDia.map((s, idx) => {
              const hInicio = s.horaInicio ? parseInt(s.horaInicio.split(':')[0]) + parseInt(s.horaInicio.split(':')[1]) / 60 : null;
              const hFin = s.horaFin ? parseInt(s.horaFin.split(':')[0]) + parseInt(s.horaFin.split(':')[1]) / 60 : null;
              if (hInicio === null || hFin === null) return null;

              const top = (hInicio - 7) * 56;
              const height = (hFin - hInicio) * 56 - 2;
              const carreraId = s.curso?.carrera || s.curso?._id || 'sin-carrera';
              const color = carreraColorMap[carreraId] || '#6366f1';

              return (
                <div
                  key={s._id}
                  onMouseEnter={e => setTooltip({ s, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    position: 'absolute',
                    top: `${top}px`,
                    left: '68px',
                    right: '8px',
                    height: `${Math.max(height, 30)}px`,
                    background: color + '22',
                    borderLeft: `3px solid ${color}`,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.15s',
                    zIndex: 1,
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.curso?.nombre || 'Sin curso'}
                  </div>
                  {height > 36 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={10}/> {s.aula} &nbsp;|&nbsp; {s.horaInicio}–{s.horaFin}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {seccionesDia.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No hay secciones programadas para {diaActivo}.
            </div>
          )}
        </div>

        {/* Leyenda de colores por carrera */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {Object.entries(carreraColorMap).slice(0, 10).map(([id, color], i) => (
            <span key={id} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
              Carrera {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN 4: Alertas y Conflictos ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Conflictos */}
        <div className="modern-card">
          <h3 style={{ ...chartTitle, color: totalConflictos > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {totalConflictos > 0 ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
            Conflictos Detectados ({totalConflictos})
          </h3>
          {totalConflictos === 0 ? (
            <div style={{ color: '#10b981', fontSize: '0.9rem', padding: '1rem 0' }}>✅ No se detectaron conflictos de horario.</div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alertas.conflictosDocente.map((c, i) => (
                <AlertaItem key={`d-${i}`} tipo="Docente" color="#ef4444" icono="👤"
                  msg={`${c.docente}: "${c.seccion1.curso}" vs "${c.seccion2.curso}"`}
                  detalle={`${c.seccion1.horario} | ${c.seccion2.horario}`} />
              ))}
              {alertas.conflictosAula.map((c, i) => (
                <AlertaItem key={`a-${i}`} tipo="Aula" color="#f97316" icono="🏫"
                  msg={`Aula ${c.aula}: "${c.seccion1.curso}" vs "${c.seccion2.curso}"`}
                  detalle={`${c.seccion1.horario} | ${c.seccion2.horario}`} />
              ))}
            </div>
          )}
        </div>

        {/* Salones casi llenos y docentes sobrecargados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="modern-card">
            <h3 style={{ ...chartTitle, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18}/> Salones Casi Llenos ({alertas.casiLlenos.length})
            </h3>
            {alertas.casiLlenos.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No hay salones con ocupación ≥ 80%.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {alertas.casiLlenos.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-color)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>{s.curso}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f59e0b', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px' }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modern-card">
            <h3 style={{ ...chartTitle, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18}/> Docentes Sobrecargados ({alertas.docentesSobrecargados.length})
            </h3>
            {alertas.docentesSobrecargados.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Ningún docente supera las 5 secciones.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {alertas.docentesSobrecargados.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-color)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{d.nombre}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#8b5cf6', background: '#ede9fe', padding: '2px 8px', borderRadius: '12px' }}>{d.secciones} secciones</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip flotante del calendario */}
      {tooltip && (
        <div style={{
          position: 'fixed', top: tooltip.y + 16, left: tooltip.x + 8, zIndex: 9999,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px',
          padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', pointerEvents: 'none',
          minWidth: '200px'
        }}>
          <div style={{ fontWeight: '700', fontSize: '0.88rem', marginBottom: '4px' }}>{tooltip.s.curso?.nombre}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span>👤 {tooltip.s.docente ? `${tooltip.s.docente.nombre} ${tooltip.s.docente.apellidos}` : 'Sin docente'}</span>
            <span>🏫 {tooltip.s.aula}</span>
            <span>⏰ {tooltip.s.horaInicio} – {tooltip.s.horaFin}</span>
            <span>👥 {tooltip.s.matriculados} / {tooltip.s.cupoMaximo} alumnos</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar: KPI Card
function KpiCard({ icon, label, value, color }) {
  return (
    <div className="modern-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <div style={{ padding: '10px', background: color + '22', borderRadius: '12px', color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

// Componente auxiliar: Alerta de conflicto
function AlertaItem({ tipo, color, icono, msg, detalle }) {
  return (
    <div style={{ background: color + '11', border: `1px solid ${color}44`, borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontSize: '0.82rem', fontWeight: '700', color, marginBottom: '2px' }}>{icono} Conflicto de {tipo}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{msg}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{detalle}</div>
    </div>
  );
}

const chartTitle = { fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', margin: '0 0 1rem 0' };

export default PlanificacionManager;
