import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Edit2, Trash2 } from 'lucide-react';

function DocentesManager() {
  const [docentes, setDocentes] = useState([]);
  const [carrerasList, setCarrerasList] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', password: '', turnoDisponibilidad: 'Completo', carrerasEnsenadas: [] });
  const [editId, setEditId] = useState(null);

  // ── Filtros de búsqueda ──────────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { 
    fetchDocentes(); 
    axios.get('/api/admin/carreras').then(res => setCarrerasList(res.data));
  }, []);
  
  const fetchDocentes = async () => {
    const res = await axios.get('/api/admin/docentes');
    setDocentes(res.data);
  };

  const handleCarreraToggle = (carreraId) => {
    setForm(prev => {
      const isSelected = prev.carrerasEnsenadas.includes(carreraId);
      if (isSelected) {
        return { ...prev, carrerasEnsenadas: prev.carrerasEnsenadas.filter(id => id !== carreraId) };
      } else {
        return { ...prev, carrerasEnsenadas: [...prev.carrerasEnsenadas, carreraId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/admin/docentes/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('/api/admin/docentes', form);
      }
      setForm({ nombre: '', apellidos: '', email: '', password: '', turnoDisponibilidad: 'Completo', carrerasEnsenadas: [] });
      fetchDocentes();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const handleEdit = (d) => {
    setForm({ 
      nombre: d.nombre, 
      apellidos: d.apellidos, 
      email: d.email, 
      password: '', // Leave empty to not update unless typed
      turnoDisponibilidad: d.turnoDisponibilidad || 'Completo',
      carrerasEnsenadas: d.carrerasEnsenadas?.map(c => c._id) || []
    });
    setEditId(d._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este docente?')) return;
    try {
      await axios.delete(`/api/admin/docentes/${id}`);
      fetchDocentes();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  // ── Lógica de filtrado en memoria ────────────────────────────────────────────
  const docentesFiltrados = docentes.filter(d => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto = texto === '' || 
      d.nombre.toLowerCase().includes(texto) || 
      d.apellidos.toLowerCase().includes(texto) ||
      `${d.nombre} ${d.apellidos}`.toLowerCase().includes(texto);

    const coincideCarrera = filtroCarrera === '' ||
      d.carrerasEnsenadas?.some(c => c._id === filtroCarrera);

    return coincideTexto && coincideCarrera;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <Users size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Gestión de Docentes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registra a los profesores y asígnales sus carreras correspondientes.</p>
        </div>
      </div>

      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>{editId ? 'Editar Docente' : 'Crear Nuevo Docente'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div><label htmlFor="doc-nombre" style={labelStyle}>Nombre</label><input id="doc-nombre" placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} required /></div>
          <div><label htmlFor="doc-apellidos" style={labelStyle}>Apellidos</label><input id="doc-apellidos" placeholder="Apellidos" value={form.apellidos} onChange={e=>setForm({...form, apellidos: e.target.value})} required /></div>
          <div><label htmlFor="doc-email" style={labelStyle}>Correo Electrónico</label><input id="doc-email" type="email" placeholder="ejemplo@profesor.edu" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required /></div>
          <div><label htmlFor="doc-password" style={labelStyle}>{editId ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal'}</label><input id="doc-password" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required={!editId} /></div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <label htmlFor="doc-turno" style={labelStyle}>Turno de Disponibilidad</label>
            <select id="doc-turno" value={form.turnoDisponibilidad} onChange={e=>setForm({...form, turnoDisponibilidad: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', maxWidth: '300px' }}>

              <option value="Completo">Tiempo Completo</option>
              <option value="Mañana">Solo Mañanas (08:00 - 13:00)</option>
              <option value="Tarde">Solo Tardes (13:00 - 18:00)</option>
              <option value="Noche">Solo Noches (18:00 - 22:00)</option>
            </select>
          </div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <label style={labelStyle}>Carreras Asignadas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              {carrerasList.map(c => (
                <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: 'var(--bg-color)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.carrerasEnsenadas.includes(c._id)} onChange={() => handleCarreraToggle(c._id)} />
                  {c.nombre}
                </label>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={btnStyle}><Plus size={18}/> {editId ? 'Guardar Cambios' : 'Registrar Docente'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nombre: '', apellidos: '', email: '', password: '', turnoDisponibilidad: 'Completo', carrerasEnsenadas: [] }); }} style={{...btnStyle, background: 'var(--text-muted)'}}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* ── Barra de Filtros ─────────────────────────────────────────────────── */}
      <div className="modern-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔍 Filtrar Docentes
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--primary-purple)', fontWeight: '600' }}>
            {docentesFiltrados.length} de {docentes.length} docentes
          </span>
          {(busqueda || filtroCarrera) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroCarrera(''); setCurrentPage(1); }}
              style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}
            >
              Limpiar filtros ✕
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
          <input
            id="filtro-docente-busqueda"
            type="text"
            placeholder="Buscar por nombre o apellidos..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          <select
            id="filtro-docente-carrera"
            value={filtroCarrera}
            onChange={e => { setFiltroCarrera(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: '220px', height: '46px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="">— Todas las carreras —</option>
            {carrerasList.map(c => (
              <option key={c._id} value={c._id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tabla de Resultados ──────────────────────────────────────────────── */}
      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead><tr><th>Docente</th><th>Email</th><th>Disponibilidad</th><th>Carreras Asignadas</th><th>Acciones</th></tr></thead>
          <tbody>
            {docentesFiltrados.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {docentes.length === 0 ? 'No hay docentes registrados.' : 'No se encontraron docentes con ese criterio de búsqueda.'}
              </td></tr>
            ) : (
              (() => {
                const itemsPerPage = 15;
                const totalPages = Math.ceil(docentesFiltrados.length / itemsPerPage);
                const activePage = Math.max(1, Math.min(currentPage, totalPages));
                const indexOfLastItem = activePage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentItems = docentesFiltrados.slice(indexOfFirstItem, indexOfLastItem);

                return currentItems.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: '500' }}>{d.nombre} {d.apellidos}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.email}</td>
                    <td>
                      <span className="badge" style={{ background: d.turnoDisponibilidad === 'Completo' ? '#10b98122' : '#6366f122', color: d.turnoDisponibilidad === 'Completo' ? '#10b981' : '#6366f1', fontSize: '0.75rem', padding: '4px 8px' }}>
                        {d.turnoDisponibilidad || 'Completo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {d.carrerasEnsenadas?.map(c => <span key={c._id} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{c.nombre}</span>)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(d)} style={actionBtnStyle} title="Editar"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(d._id)} style={{...actionBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ));
              })()
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {(() => {
        const itemsPerPage = 15;
        const totalPages = Math.ceil(docentesFiltrados.length / itemsPerPage);
        const activePage = Math.max(1, Math.min(currentPage, totalPages));
        const indexOfLastItem = activePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        if (totalPages <= 1) return null;

        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando <strong>{indexOfFirstItem + 1}</strong> a <strong>{Math.min(indexOfLastItem, docentesFiltrados.length)}</strong> de <strong>{docentesFiltrados.length}</strong> docentes
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-color)',
                  color: activePage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.15s'
                }}
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - activePage) <= 1)
                .map((p, index, array) => {
                  const showEllipsis = index > 0 && p - array[index - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        style={{
                          minWidth: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: p === activePage ? 'none' : '1px solid var(--border)',
                          background: p === activePage ? 'var(--primary-purple)' : 'var(--bg-color)',
                          color: p === activePage ? 'white' : 'var(--text-main)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          transition: 'all 0.15s'
                        }}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-color)',
                  color: activePage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: activePage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.15s'
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnStyle = { padding: '12px 20px', height: '46px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--text-main)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
const actionBtnStyle = { padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };

export default DocentesManager;
