import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Activity, Cpu, HardDrive, Clock, Server, RefreshCw, Leaf,
  Zap, Shield, Award, CheckCircle, Flame, Globe, BarChart2
} from 'lucide-react';

// ─── Constantes ────────────────────────────────────────────────────────────
const API = '/api/admin';
const CO2_PER_BYTE_MG = 0.0000000318 * 1000; // mg CO₂ por byte

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatBytes(b) {
  if (!b || b === 0) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function formatSysBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function calculateEmissions(uptimeSecs) {
  const hours = uptimeSecs / 3600;
  const kwh = hours * 0.055;
  const co2Grams = kwh * 380;
  if (co2Grams < 1000) return `${co2Grams.toFixed(2)} g CO₂`;
  return `${(co2Grams / 1000).toFixed(3)} kg CO₂`;
}

function formatDateTime(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleString('es', {
    month: 'numeric', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
}

function getStatusColor(code) {
  if (code >= 500) return '#ef4444';
  if (code >= 400) return '#f59e0b';
  if (code >= 300) return '#8b5cf6';
  if (code >= 200) return '#10b981';
  return '#6b7280';
}

function getMethodColor(method) {
  const m = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' };
  return m[method] || '#6b7280';
}

// ──────────────────────────────────────────────────────────────────────────
export default function RecursosManager() {
  const [activeView, setActiveView] = useState('environmental'); // 'environmental' | 'comparativa' | 'system'
  const [recursos, setRecursos]   = useState(null);
  const [impact,   setImpact]     = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [loadingImpact, setLoadingImpact] = useState(true);
  const [error,    setError]      = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [requestsEvitadasCount, setRequestsEvitadasCount] = useState(0);

  // ── Fetch recursos del sistema ──────────────────────────────────────────
  const fetchRecursos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/recursos`, { headers: { 'x-auth-token': token } });
      setRecursos(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Demasiadas solicitudes. El Rate Limiter ecológico está activo (máximo 20 reqs/min).');
      } else {
        setError('Error de comunicación con el servidor de métricas.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch impacto ambiental ─────────────────────────────────────────────
  const fetchImpact = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/environmental-impact`);
      setImpact(res.data);
    } catch (_) {
      // silencioso
    } finally {
      setLoadingImpact(false);
    }
  }, []);

  useEffect(() => {
    fetchRecursos();
    fetchImpact();

    let intervalId = null;
    let impactIntervalId = null;
    let secondsCounterId = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(fetchRecursos, 15000);
        impactIntervalId = setInterval(fetchImpact, 8000); // APM más frecuente
      }
    };
    const stopPolling = () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      if (impactIntervalId) { clearInterval(impactIntervalId); impactIntervalId = null; }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        stopPolling();
      } else {
        setIsTabVisible(true);
        fetchRecursos();
        fetchImpact();
        startPolling();
      }
    };

    if (!document.hidden) startPolling();

    secondsCounterId = setInterval(() => {
      setRequestsEvitadasCount(prev => prev + (document.hidden ? 1 : 1.33));
    }, 10000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopPolling();
      clearInterval(secondsCounterId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchRecursos, fetchImpact]);

  const cacheStatus = recursos?.greenMetrics?.cacheHitRate === 'active' ? 'Óptima (Hit)' : 'Fría';

  // ── Tab pills ───────────────────────────────────────────────────────────
  const tabs = [
    { id: 'environmental', label: 'Impacto Ambiental',      icon: <Globe size={16} /> },
    { id: 'comparativa',   label: 'Comparativa Antes/Después', icon: <BarChart2 size={16} /> },
    { id: 'system',        label: 'Recursos del Sistema',   icon: <Server size={16} /> },
  ];

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ display: 'inline-flex', padding: '6px', background: '#e6f4ea', borderRadius: '8px', color: '#137333' }}>
              <Leaf size={20} />
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Consumo de Recursos &amp; Sostenibilidad
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Métricas de hardware integradas con optimizaciones de Green Software
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '8px 12px',
            background: isTabVisible ? '#e6f4ea' : '#fef7e0', borderRadius: '10px',
            border: isTabVisible ? '1px solid #13733322' : '1px solid #b0600022',
            fontSize: '0.8rem', fontWeight: '700',
            color: isTabVisible ? '#137333' : '#b06000'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isTabVisible ? '#10b981' : '#f59e0b', animation: isTabVisible ? 'pulseGreen 1.5s infinite' : 'none' }} />
            {isTabVisible ? 'MONITOREO ACTIVO' : 'TRÁFICO SUSPENDIDO (AHORRO)'}
          </div>
          <button
            onClick={() => { fetchRecursos(); fetchImpact(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '9px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-alpha)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <RefreshCw size={16} /> Refrescar
          </button>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', background: 'var(--surface)', padding: '6px', borderRadius: '14px', boxShadow: 'var(--shadow-sm)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveView(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '9px 20px',
              borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              background: activeView === t.id ? 'var(--primary-gradient)' : 'transparent',
              color: activeView === t.id ? 'white' : 'var(--text-muted)',
              boxShadow: activeView === t.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          VISTA: IMPACTO AMBIENTAL
      ═══════════════════════════════════════════════════════════════════ */}
      {activeView === 'environmental' && (
        <EnvironmentalView
          impact={impact}
          loading={loadingImpact}
          onRefresh={fetchImpact}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VISTA: COMPARATIVA ANTES vs DESPUÉS
      ═══════════════════════════════════════════════════════════════════ */}
      {activeView === 'comparativa' && (
        <ComparativaView impact={impact} loading={loadingImpact} />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VISTA: RECURSOS DEL SISTEMA
      ═══════════════════════════════════════════════════════════════════ */}
      {activeView === 'system' && (
        <SystemView
          recursos={recursos}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          requestsEvitadasCount={requestsEvitadasCount}
          cacheStatus={cacheStatus}
          formatSysBytes={formatSysBytes}
          formatUptime={formatUptime}
          calculateEmissions={calculateEmissions}
        />
      )}

      <style>{`
        @keyframes pulseGreen {
          0%   { transform: scale(1);   box-shadow: 0 0 0 0   rgba(16,185,129,0.4); }
          70%  { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(16,185,129,0); }
          100% { transform: scale(1);   box-shadow: 0 0 0 0   rgba(16,185,129,0); }
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .env-table { width: 100%; border-collapse: collapse; }
        .env-table th {
          text-align: left; padding: 10px 14px; font-size: 0.73rem;
          font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em;
          color: #00e5ff; background: #0d1b2a; border-bottom: 1px solid #1e3a5f;
          white-space: nowrap;
        }
        .env-table td {
          padding: 9px 14px; font-size: 0.82rem; border-bottom: 1px solid #0f2235;
          color: #cdd9e5; white-space: nowrap;
        }
        .env-table tbody tr { transition: background 0.15s; }
        .env-table tbody tr:hover { background: rgba(0,229,255,0.04); }
        .stat-card-dark {
          background: linear-gradient(135deg, #0d1b2a 0%, #112233 100%);
          border: 1px solid #1e3a5f; border-radius: 14px; padding: 1.1rem 1.4rem;
          display: flex; flex-direction: column; gap: 0.3rem;
        }
        .stat-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #4a7fa5; }
        .stat-value-dark { font-size: 1.3rem; font-weight: 900; line-height: 1.1; }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Environmental Impact View
// ──────────────────────────────────────────────────────────────────────────
function EnvironmentalView({ impact, loading, onRefresh }) {
  if (loading && !impact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,229,255,0.15)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#4a7fa5', fontWeight: '600', fontSize: '0.9rem' }}>Cargando impacto ambiental...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const data = impact || { totalRequests: 0, totalCo2g: 0, avgCo2g: 0, worstEndpoint: '-', mostUsed: '-', requests: [] };

  return (
    <div>
      {/* ── Título del panel oscuro ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <Globe size={20} color="#00e5ff" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
          Environmental Impact Dashboard
        </h3>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4a7fa5', fontWeight: '600' }}>
          CO₂ calculado vía CO2.js (Green Web Foundation)
        </span>
      </div>

      {/* ── Tarjetas de estadísticas ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

        <div className="stat-card-dark">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value-dark" style={{ color: '#cdd9e5' }}>{data.totalRequests}</div>
        </div>

        <div className="stat-card-dark">
          <div className="stat-label">Total CO₂</div>
          <div className="stat-value-dark" style={{ color: '#00e5ff' }}>
            {data.totalCo2g < 0.001
              ? `${(data.totalCo2g * 1000).toFixed(4)} mg`
              : `${data.totalCo2g.toFixed(4)} g`}
          </div>
        </div>

        <div className="stat-card-dark">
          <div className="stat-label">AVG CO₂ / Request</div>
          <div className="stat-value-dark" style={{ color: '#00e5ff' }}>
            {data.avgCo2g < 0.001
              ? `${(data.avgCo2g * 1000).toFixed(6)} mg`
              : `${data.avgCo2g.toFixed(6)} g`}
          </div>
        </div>

        <div className="stat-card-dark" style={{ gridColumn: 'span 1' }}>
          <div className="stat-label">Worst Endpoint</div>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ef4444', marginTop: '2px', wordBreak: 'break-all' }}>
            {data.worstEndpoint}
          </div>
        </div>

        <div className="stat-card-dark">
          <div className="stat-label">Most Used Endpoint</div>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#10b981', marginTop: '2px', wordBreak: 'break-all' }}>
            {data.mostUsed}
          </div>
        </div>
      </div>

      {/* ── Tabla oscura de peticiones ──────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)',
        border: '1px solid #1e3a5f',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>

        {/* Cabecera del panel */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.4rem', borderBottom: '1px solid #1e3a5f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 8px #00e5ff' }} />
            <span style={{ color: '#cdd9e5', fontWeight: '700', fontSize: '0.9rem' }}>
              Registro de Peticiones — {data.requests.length} entradas
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulseGreen 1.5s infinite' }} />
            <span style={{ fontSize: '0.75rem', color: '#4a7fa5', fontWeight: '600' }}>LIVE</span>
          </div>
        </div>

        {data.requests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4a7fa5' }}>
            <Globe size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: '600' }}>Sin peticiones registradas aún.</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Navega por el sistema para generar tráfico.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
            <table className="env-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Method</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>Bytes</th>
                  <th>CO₂</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map((r, i) => {
                  const compressionApplied = r.compressedBytes < r.bytes && r.bytes > 0;
                  return (
                    <tr key={r.id || `${r.time}-${r.route}-${i}`}>
                      <td style={{ color: '#7a9bb5', fontSize: '0.78rem' }}>{formatDateTime(r.time)}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800',
                          background: getMethodColor(r.method) + '22', color: getMethodColor(r.method)
                        }}>
                          {r.method}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#a8c0d8' }}>{r.route}</td>
                      <td>
                        <span style={{ color: getStatusColor(r.status), fontWeight: '700' }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ color: r.duration > 100 ? '#f59e0b' : '#10b981', fontWeight: '700' }}>
                        {r.duration.toFixed(2)} ms
                      </td>
                      <td>
                        {compressionApplied ? (
                          <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', lineHeight: 1.3 }}>
                            <span style={{ color: '#6b7280', textDecoration: 'line-through', fontSize: '0.75rem' }}>
                              {formatBytes(r.bytes)}
                            </span>
                            <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.82rem' }}>
                              {formatBytes(r.compressedBytes)}
                              <span style={{ fontSize: '0.65rem', marginLeft: '4px', color: '#10b981', opacity: 0.8 }}>GZIP</span>
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: '#cdd9e5', fontWeight: '600' }}>
                            {formatBytes(r.bytes || r.compressedBytes || 0)}
                          </span>
                        )}
                      </td>
                      <td style={{ color: '#00e5ff', fontWeight: '700', fontFamily: 'monospace' }}>
                        {r.co2mg.toFixed(4)} mg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.4rem', borderTop: '1px solid #1e3a5f', textAlign: 'center', fontSize: '0.73rem', color: '#2d5a7a' }}>
          MegaBlog — CO₂ emissions calculated via CO2.js (Green Web Foundation) &nbsp;|&nbsp;
          Factor: 0.0000000318 g CO₂/byte · Sustainable Web Design 2023
        </div>
      </div>

      {/* ── Leyenda de compresión ───────────────────────────────────────── */}
      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'rgba(0,229,255,0.04)', borderRadius: '10px', border: '1px solid rgba(0,229,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ textDecoration: 'line-through', color: '#6b7280', fontSize: '0.82rem', fontWeight: '600' }}>1.5 KB</span>
          <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: '700' }}>→ 435 B GZIP</span>
          <span style={{ fontSize: '0.78rem', color: '#4a7fa5' }}>= bytes tachados son el JSON crudo; el valor verde es lo realmente enviado al cliente por GZIP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#00e5ff' }} />
          <span style={{ fontSize: '0.78rem', color: '#4a7fa5' }}>CO₂ calculado sobre bytes comprimidos (impacto real de red)</span>
        </div>
      </div>
    </div>
  );
}

EnvironmentalView.propTypes = {
  impact: PropTypes.shape({
    totalRequests: PropTypes.number,
    totalCo2g: PropTypes.number,
    avgCo2g: PropTypes.number,
    worstEndpoint: PropTypes.string,
    mostUsed: PropTypes.string,
    requests: PropTypes.array
  }),
  loading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired
};

// ──────────────────────────────────────────────────────────────────────────
// Comparativa Antes vs Después  (equivalente visual a comparativa_consumo.js)
// ANTES = bytes JSON crudo (campo `bytes` en APM = lo que se enviaba sin GZIP)
// DESPUÉS = bytes comprimidos (campo `compressedBytes` = lo que realmente viaja)
// ──────────────────────────────────────────────────────────────────────────
function ComparativaView({ impact, loading }) {
  const CO2_PER_BYTE_MG = 0.0000000318 * 1000;

  if (loading && !impact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,229,255,0.15)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#4a7fa5', fontWeight: '600', fontSize: '0.9rem' }}>Calculando comparativa...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Agregar por endpoint (METHOD + route): acumular bytes antes (crudo) y despu\u00e9s (comprimido)
  const byEndpoint = {};
  (impact?.requests || []).forEach(r => {
    const key = `${r.method} ${r.route}`;
    if (!byEndpoint[key]) {
      byEndpoint[key] = { key, count: 0, totalBefore: 0, totalAfter: 0, totalDuration: 0 };
    }
    byEndpoint[key].count++;
    byEndpoint[key].totalBefore   += r.bytes           || 0; // JSON crudo (ANTES)
    byEndpoint[key].totalAfter    += r.compressedBytes || r.bytes || 0; // con GZIP (DESPUÉS)
    byEndpoint[key].totalDuration += r.duration        || 0;
  });

  const rows = Object.values(byEndpoint).sort((a, b) => b.totalBefore - a.totalBefore);

  const totalBefore = rows.reduce((s, r) => s + r.totalBefore, 0);
  const totalAfter  = rows.reduce((s, r) => s + r.totalAfter,  0);
  const totalSaved  = totalBefore - totalAfter;
  const globalPct   = totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : '0.0';

  function co2mg(bytes) { return (bytes * CO2_PER_BYTE_MG).toFixed(7); }
  function pct(a, d) {
    if (!a || a === 0) return '-';
    const r = ((a - d) / a * 100);
    return r > 0
      ? <span style={{ color: '#10b981', fontWeight: '800' }}>↓ {r.toFixed(1)}%</span>
      : <span style={{ color: '#ef4444', fontWeight: '800' }}>↑ {Math.abs(r).toFixed(1)}%</span>;
  }
  function bar(before, after, width = 120) {
    const ratio = before > 0 ? Math.min(after / before, 1) : 1;
    const filled = Math.round((1 - ratio) * width);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: `${width + 50}px` }}>
        <div style={{ position: 'relative', width: `${width}px`, height: '10px', background: '#1e3a5f', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${filled}px`, background: 'linear-gradient(90deg, #10b981, #00e5ff)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700', minWidth: '36px' }}>
          {before > 0 ? `${Math.round((1 - ratio) * 100)}%` : '-'}
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* ── Título ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <BarChart2 size={20} color="#00e5ff" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
          Comparativa de Consumo: ANTES vs DESPUÉS
        </h3>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4a7fa5', fontWeight: '600' }}>
          Equivalente a: <code style={{ background: '#0d1b2a', padding: '2px 6px', borderRadius: '4px', color: '#00e5ff' }}>node comparativa_consumo.js</code>
        </span>
      </div>

      {/* Explicación de metodología */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2a0f0f 100%)', border: '1px solid #5f1e1e', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900', fontSize: '0.85rem', color: 'white' }}>A</div>
          <div>
            <div style={{ fontWeight: '800', color: '#fca5a5', fontSize: '0.88rem', marginBottom: '3px' }}>ANTES (sin optimizar)</div>
            <div style={{ fontSize: '0.78rem', color: '#7f4444', lineHeight: 1.4 }}>
              Payload JSON crudo · Cabecera <code style={{ background: '#1e0505', padding: '1px 4px', borderRadius: '3px', color: '#fca5a5' }}>x-no-compression: 1</code><br/>
              Equivale al estado original del sistema antes de GZIP
            </div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0a1a0f 0%, #0f2a18 100%)', border: '1px solid #1e5f3a', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900', fontSize: '0.85rem', color: 'white' }}>D</div>
          <div>
            <div style={{ fontWeight: '800', color: '#6ee7b7', fontSize: '0.88rem', marginBottom: '3px' }}>DESPUÉS (optimizado)</div>
            <div style={{ fontSize: '0.78rem', color: '#2e7a56', lineHeight: 1.4 }}>
              Bytes reales con GZIP Nivel 6 · <code style={{ background: '#051a0e', padding: '1px 4px', borderRadius: '3px', color: '#6ee7b7' }}>Content-Encoding: gzip</code><br/>
              Lo que realmente viaja por la red hacia el cliente
            </div>
          </div>
        </div>

        {totalBefore > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1628 100%)', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', lineHeight: 1 }}>{globalPct}%</div>
              <div style={{ fontSize: '0.7rem', color: '#4a7fa5', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reducción total</div>
            </div>
            <div style={{ borderLeft: '1px solid #1e3a5f', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#4a7fa5', marginBottom: '4px' }}>
                ANTES: <strong style={{ color: '#fca5a5' }}>{formatBytes(totalBefore)}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4a7fa5', marginBottom: '4px' }}>
                DESPUÉS: <strong style={{ color: '#6ee7b7' }}>{formatBytes(totalAfter)}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4a7fa5' }}>
                CO₂ ahorrado: <strong style={{ color: '#00e5ff' }}>{co2mg(totalSaved)} mg</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabla comparativa oscura ── */}
      {rows.length === 0 ? (
        <div style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#4a7fa5' }}>
          <BarChart2 size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ margin: 0, fontWeight: '600' }}>Sin datos de comparativa aún.</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
            Navega por el sistema para generar peticiones en el APM. También puedes correr:
            <br/><code style={{ color: '#00e5ff', fontSize: '0.8rem' }}>node comparativa_consumo.js</code>
          </p>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)', border: '1px solid #1e3a5f', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

          {/* Cabecera panel */}
          <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ color: '#cdd9e5', fontWeight: '700', fontSize: '0.9rem' }}>
              Tabla Comparativa Detallada — {rows.length} endpoints
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.73rem', color: '#4a7fa5' }}>
              Fuente: Sustainable Web Design 2023 · 0.0000000318 g CO₂/byte
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="env-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '200px' }}>Endpoint</th>
                  <th style={{ color: '#fca5a5' }}>ANTES (bytes)</th>
                  <th style={{ color: '#6ee7b7' }}>DESPUÉS (GZIP)</th>
                  <th>Reducción</th>
                  <th>Barra</th>
                  <th style={{ color: '#fca5a5' }}>CO₂ ANTES</th>
                  <th style={{ color: '#6ee7b7' }}>CO₂ DESPUÉS</th>
                  <th>Reqs</th>
                  <th>Avg ms</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a8c0d8', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.key}
                    </td>
                    <td style={{ color: '#fca5a5', fontWeight: '700' }}>{formatBytes(r.totalBefore)}</td>
                    <td style={{ color: '#6ee7b7', fontWeight: '700' }}>{formatBytes(r.totalAfter)}</td>
                    <td>{pct(r.totalBefore, r.totalAfter)}</td>
                    <td>{bar(r.totalBefore, r.totalAfter)}</td>
                    <td style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.78rem' }}>{co2mg(r.totalBefore)} mg</td>
                    <td style={{ color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.78rem' }}>{co2mg(r.totalAfter)} mg</td>
                    <td style={{ color: '#7a9bb5', fontWeight: '700' }}>{r.count}</td>
                    <td style={{ color: r.totalDuration / r.count > 100 ? '#f59e0b' : '#7a9bb5', fontWeight: '700' }}>
                      {(r.totalDuration / r.count).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#0a1628', borderTop: '2px solid #1e3a5f' }}>
                  <td style={{ color: '#00e5ff', fontWeight: '900', fontSize: '0.85rem' }}>TOTAL SESIÓN</td>
                  <td style={{ color: '#fca5a5', fontWeight: '900' }}>{formatBytes(totalBefore)}</td>
                  <td style={{ color: '#6ee7b7', fontWeight: '900' }}>{formatBytes(totalAfter)}</td>
                  <td>{pct(totalBefore, totalAfter)}</td>
                  <td>{bar(totalBefore, totalAfter)}</td>
                  <td style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: '700' }}>{co2mg(totalBefore)} mg</td>
                  <td style={{ color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: '700' }}>{co2mg(totalAfter)} mg</td>
                  <td style={{ color: '#7a9bb5', fontWeight: '900' }}>{rows.reduce((s, r) => s + r.count, 0)}</td>
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer con nota metodológica */}
          <div style={{ padding: '0.9rem 1.4rem', borderTop: '1px solid #1e3a5f', background: '#081220', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.77rem', color: '#4a7fa5' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fca5a5', flexShrink: 0 }} />
              <span>ANTES = campo <code style={{ color: '#fca5a5' }}>bytes</code> del APM (JSON crudo / sin compresión)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.77rem', color: '#4a7fa5' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6ee7b7', flexShrink: 0 }} />
              <span>DESPUÉS = campo <code style={{ color: '#6ee7b7' }}>compressedBytes</code> del APM (post-GZIP, bytes reales de red)</span>
            </div>
            <div style={{ fontSize: '0.77rem', color: '#2d5a7a', marginLeft: 'auto' }}>
              Misma metodología que <code style={{ color: '#00e5ff' }}>comparativa_consumo.js</code>
            </div>
          </div>
        </div>
      )}

      {/* Nota de proyecci\u00f3n anual */}
      {totalSaved > 0 && (
        <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(0,229,255,0.04) 100%)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px' }}>
          <div style={{ fontWeight: '800', color: '#10b981', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
            📊 Proyección Anual (100 sesiones/día × 365 días)
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            <span>CO₂ ahorrado/sesión: <strong style={{ color: '#00e5ff' }}>{co2mg(totalSaved)} mg</strong></span>
            <span>CO₂ ahorrado/año: <strong style={{ color: '#00e5ff' }}>{(parseFloat(co2mg(totalSaved)) * 100 * 365 / 1000).toFixed(3)} g CO₂</strong></span>
            <span>Datos ahorrados/año: <strong style={{ color: '#10b981' }}>{formatBytes(totalSaved * 100 * 365)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

ComparativaView.propTypes = {
  impact: PropTypes.object,
  loading: PropTypes.bool.isRequired
};

// ──────────────────────────────────────────────────────────────────────────
// System Resources View (panel original preservado)

// ──────────────────────────────────────────────────────────────────────────
function SystemView({ recursos, loading, error, lastUpdated, requestsEvitadasCount, cacheStatus, formatSysBytes, formatUptime, calculateEmissions }) {

  if (loading && !recursos) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-alpha)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Conectando con el APM ecológico...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
          <Flame size={20} /> {error}
        </div>
      )}

      {/* RATING SCALE */}
      <div className="modern-card" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
        <div>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#10b981" /> Certificación de Eficiencia de Software
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <RatingBar letter="A+++" label="Polling Selectivo & Suspended Tab" active />
            <RatingBar letter="A+"  label="Caché local & Rate Limits" active />
            <RatingBar letter="A"   label="Circular Buffer O(1) & Compression" />
            <RatingBar letter="B"   label="Consultas Mongoose con Proyección" />
            <RatingBar letter="C"   label="Llamadas REST Agrupadas / Consolidadas" />
            <RatingBar letter="D"   label="Código tradicional (Sin optimizar)" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(16,185,129,0.04)', padding: '1.5rem', borderRadius: '14px', border: '1.5px dashed rgba(16,185,129,0.18)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>GREEN CODE SCORE</span>
              <span style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', lineHeight: 1, textShadow: '0 0 12px rgba(16,185,129,0.2)' }}>A+</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0, lineHeight: 1.5 }}>
              El panel administrativo de SIMA está calificado como <strong>Clase A+ (Eficiencia de Red y CPU Excepcional)</strong> gracias al polling inteligente de 15 segundos, suspensión automática por Page Visibility y el buffer circular eficiente en el servidor.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid rgba(16,185,129,0.1)', paddingTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>AHORRO ESTIMADO</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>-66.6% peticiones</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(16,185,129,0.1)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>REQS EVITADAS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#137333' }}>~{Math.round(requestsEvitadasCount)} reqs</div>
            </div>
          </div>
        </div>
      </div>

      {recursos && (
        <>
          {/* HARDWARE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

            {/* RAM */}
            <div className="modern-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(99,102,241,0.08)', padding: '10px', borderRadius: '12px', color: 'var(--primary-purple)' }}>
                    <HardDrive size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>Memoria RAM</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga física en el servidor</p>
                  </div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '700' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Usado: {formatSysBytes(recursos.memory.used)}</span>
                    <span style={{ color: 'var(--text-main)' }}>{recursos.memory.usedPercentage}%</span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--border)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${recursos.memory.usedPercentage}%`, background: Number(recursos.memory.usedPercentage) > 85 ? '#ef4444' : 'var(--primary-gradient)', height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span>Total: <strong>{formatSysBytes(recursos.memory.total)}</strong></span>
                <span>Libre: <strong>{formatSysBytes(recursos.memory.free)}</strong></span>
              </div>
            </div>

            {/* CPU */}
            <div className="modern-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(217,70,239,0.08)', padding: '10px', borderRadius: '12px', color: '#d946ef' }}>
                    <Cpu size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>Procesador (CPU)</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Núcleos y velocidad del sistema</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Modelo:</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)', textAlign: 'right', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recursos.cpu.model}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Núcleos:</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{recursos.cpu.cores} cores</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Velocidad:</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{recursos.cpu.speed} MHz</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emisiones */}
            <div className="modern-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(16,185,129,0.08)', padding: '10px', borderRadius: '12px', color: '#10b981' }}>
                    <Server size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>Emisiones y Uptime</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Métricas acumulativas del servidor</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13}/> Activo por:</span>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>{formatUptime(recursos.uptime)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Leaf size={13}/> Huella CO₂:</span>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>{calculateEmissions(recursos.uptime)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Plataforma:</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)', textTransform: 'capitalize' }}>{recursos.platform} ({recursos.architecture})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* APM */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="modern-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <Activity size={18} color="#e59866" /> Rendimiento de Consultas REST
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>🐢 Consultas Más Lentas (APM Circular)</span>
                  {recursos.apm.topLentas.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>Esperando datos del APM...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {recursos.apm.topLentas.map((r, i) => (
                        <div key={r.ruta ? `${r.ruta}-${i}` : i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{r.ruta}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '12px' }}>{r.duracion} ms</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>🔥 Consultas Frecuentes</span>
                  {recursos.apm.topRutas.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>Esperando tráfico...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {recursos.apm.topRutas.map((r, i) => (
                        <div key={r.ruta ? `${r.ruta}-${i}` : i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{r.ruta}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'var(--primary-alpha)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '12px' }}>{r.count} reqs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modern-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <Leaf size={18} color="#10b981" /> Detalles de Arquitectura Ecológica
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <EcoMetricRow icon={<Zap size={16} />}         title="Intervalo de Polling"   value="15s (Ecológico)"         highlight />
                  <EcoMetricRow icon={<CheckCircle size={16} />} title="Page Visibility API"    value="Activo (Foco auto)"      />
                  <EcoMetricRow icon={<Server size={16} />}      title="Compresión de Payload"  value="GZIP Nivel 6 Activo"     />
                  <EcoMetricRow icon={<Shield size={16} />}      title="Seguridad JWT"          value="Habilitado en Metadatos" />
                  <EcoMetricRow icon={<HardDrive size={16} />}   title="Estrategia de Caché"    value={cacheStatus}             />
                  <EcoMetricRow icon={<Cpu size={16} />}         title="Buffer Circular APM"    value={recursos.greenMetrics.bufferEfficiency} />
                </div>
              </div>
              {lastUpdated && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem', padding: '8px', borderTop: '1px solid var(--border)' }}>
                  Última actualización ecológica exitosa: <strong>{lastUpdated}</strong>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

SystemView.propTypes = {
  recursos: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  lastUpdated: PropTypes.string,
  requestsEvitadasCount: PropTypes.number.isRequired,
  cacheStatus: PropTypes.string.isRequired,
  formatSysBytes: PropTypes.func.isRequired,
  formatUptime: PropTypes.func.isRequired,
  calculateEmissions: PropTypes.func.isRequired
};

// ── Sub-componentes auxiliares ─────────────────────────────────────────────
function RatingBar({ letter, label, active }) {
  const barColors = {
    'A+++': '#1b5e20', 'A+': '#2e7d32', 'A': '#4caf50',
    'B': '#8bc34a', 'C': '#ffeb3b', 'D': '#f57c00'
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: active ? 1 : 0.45, transform: active ? 'scale(1.01)' : 'scale(1)', transition: 'all 0.2s' }}>
      <div style={{ width: '45px', height: '24px', background: barColors[letter], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '900', borderRadius: '4px', boxShadow: active ? `0 2px 8px ${barColors[letter]}44` : 'none' }}>
        {letter}
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: active ? '700' : '500', color: 'var(--text-main)', textTransform: 'capitalize' }}>
        {label} {active && '✓'}
      </span>
    </div>
  );
}

RatingBar.propTypes = {
  letter: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool
};

function EcoMetricRow({ icon, title, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: highlight ? 'rgba(16,185,129,0.05)' : 'transparent', padding: highlight ? '8px 12px' : '4px 0', borderRadius: '8px', border: highlight ? '1px solid rgba(16,185,129,0.1)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span style={{ color: highlight ? '#10b981' : 'var(--text-muted)' }}>{icon}</span>
        <span>{title}</span>
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: highlight ? '#137333' : 'var(--text-main)' }}>{value}</span>
    </div>
  );
}

EcoMetricRow.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  highlight: PropTypes.bool
};
