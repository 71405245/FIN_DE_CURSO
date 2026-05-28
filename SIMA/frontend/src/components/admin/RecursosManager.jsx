import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Cpu, HardDrive, Clock, Server, RefreshCw } from 'lucide-react';

function RecursosManager() {
  const [recursos, setRecursos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecursos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/recursos', {
        headers: { 'x-auth-token': token }
      });
      setRecursos(res.data);
      setError(null);
    } catch (err) {
      setError('Error al obtener datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecursos();
    const interval = setInterval(() => {
      fetchRecursos();
    }, 5000); // Refrescar cada 5 segundos
    
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  if (loading && !recursos) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Cargando métricas del sistema...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity color="#3b82f6" /> Consumo de Recursos
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>Métricas y estado del servidor en tiempo real</p>
        </div>
        <button 
          onClick={fetchRecursos}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}

      {recursos && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Tarjeta de Memoria RAM */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}>
                <HardDrive size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Memoria RAM</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Uso actual de memoria</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                <span style={{ color: '#475569' }}>Usado: {formatBytes(recursos.memory.used)}</span>
                <span style={{ color: '#0f172a' }}>{recursos.memory.usedPercentage}%</span>
              </div>
              <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${recursos.memory.usedPercentage}%`, background: Number(recursos.memory.usedPercentage) > 85 ? '#ef4444' : '#3b82f6', height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <span>Total: <strong>{formatBytes(recursos.memory.total)}</strong></span>
              <span>Libre: <strong>{formatBytes(recursos.memory.free)}</strong></span>
            </div>
          </div>

          {/* Tarjeta de Procesador (CPU) */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fdf4ff', padding: '10px', borderRadius: '12px', color: '#d946ef' }}>
                <Cpu size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Procesador (CPU)</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Información del procesador central</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Modelo:</span>
                <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.85rem', textAlign: 'right', maxWidth: '65%' }}>{recursos.cpu.model}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Núcleos Lógicos:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{recursos.cpu.cores}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Velocidad Base:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{recursos.cpu.speed} MHz</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Servidor y SO */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '12px', color: '#10b981' }}>
                <Server size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Sistema Operativo</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Datos de la plataforma y uptime</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14}/> Uptime:</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>{formatUptime(recursos.uptime)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Plataforma:</span>
                <span style={{ fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' }}>{recursos.platform}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Arquitectura:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{recursos.architecture}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── APM METRICS (Consumo de API) ── */}
      {recursos?.apm && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#f59e0b" /> Rendimiento de API y Consultas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Top Rutas Más Frecuentes */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>🔥 Consultas Más Frecuentes</h4>
              {recursos.apm.topRutas.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No hay suficientes datos registrados aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recursos.apm.topRutas.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{r.ruta}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px' }}>{r.count} reqs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Consultas Más Lentas */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>🐢 Consultas Más Lentas</h4>
              {recursos.apm.topLentas.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No hay suficientes datos registrados aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recursos.apm.topLentas.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{r.ruta}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px' }}>{r.duracion} ms</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default RecursosManager;
