import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, BookOpen, Edit2, Trash2, Search, Filter, ChevronDown, GitBranch, Tag } from 'lucide-react';

const EMPTY_FORM = {
  codigo: '', nombre: '', creditos: '', carrera: '',
  ciclo: '', prerrequisitos: '', area: '', tipo: '',
};

const TIPO_OPTIONS = ['Obligatorio', 'Electivo', 'Libre'];

function CursosManager() {
  const [cursos, setCursos]         = useState([]);
  const [carreras, setCarreras]     = useState([]);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editId, setEditId]         = useState(null);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroCiclo, setFiltroCiclo]    = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCursos();
    axios.get('http://localhost:5000/api/admin/carreras').then(res => setCarreras(res.data));
  }, []);

  const fetchCursos = async () => {
    setLoading(true);
    const res = await axios.get('http://localhost:5000/api/admin/cursos');
    setCursos(res.data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Convertir prerrequisitos de string "MAT101, CS101" a array
      const payload = {
        ...form,
        creditos: Number(form.creditos),
        ciclo: Number(form.ciclo),
        prerrequisitos: form.prerrequisitos
          ? form.prerrequisitos.split(/[,/]/).map(p => p.trim()).filter(Boolean)
          : [],
      };

      if (editId) {
        await axios.put(`http://localhost:5000/api/admin/cursos/${editId}`, payload);
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/admin/cursos', payload);
      }
      setForm(EMPTY_FORM);
      fetchCursos();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar el curso.');
    }
  };

  const handleEdit = (c) => {
    setForm({
      codigo:        c.codigo,
      nombre:        c.nombre,
      creditos:      c.creditos,
      carrera:       c.carrera?._id || '',
      ciclo:         c.ciclo,
      prerrequisitos: Array.isArray(c.prerrequisitos) ? c.prerrequisitos.join(', ') : '',
      area:          c.area  || '',
      tipo:          c.tipo  || '',
    });
    setEditId(c._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/cursos/${id}`);
      fetchCursos();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  // Filtros cliente
  const ciclosDisponibles = [...new Set(cursos.map(c => c.ciclo))].sort((a, b) => a - b);

  const cursosFiltrados = cursos.filter(c => {
    const txt = busqueda.toLowerCase();
    const coincideTexto = !txt ||
      c.nombre.toLowerCase().includes(txt) ||
      c.codigo.toLowerCase().includes(txt) ||
      (c.area || '').toLowerCase().includes(txt);
    const coincideCarrera = !filtroCarrera || c.carrera?._id === filtroCarrera;
    const coincideCiclo   = !filtroCiclo   || String(c.ciclo) === filtroCiclo;
    return coincideTexto && coincideCarrera && coincideCiclo;
  });

  // Badge color por tipo
  const tipoBadge = (tipo) => {
    if (!tipo) return 'badge-gray';
    if (tipo === 'Obligatorio') return 'badge-purple';
    if (tipo === 'Electivo')    return 'badge-blue';
    return 'badge-gray';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <BookOpen size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Malla Curricular</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {cursos.length} cursos registrados en {carreras.length} carreras
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {editId ? <><Edit2 size={18}/> Editar Curso</> : <><Plus size={18}/> Nuevo Curso</>}
        </h3>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
            padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Fila 1: Código | Nombre del Curso */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Código *</label>
              <input placeholder="Ej. SIS101" value={form.codigo}
                onChange={e => setForm({ ...form, codigo: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Nombre de la Asignatura *</label>
              <input placeholder="Ej. Programación I" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
          </div>

          {/* Fila 2: Créditos | Ciclo | Carrera | Tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr 180px', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Créditos *</label>
              <input type="number" min="0" max="12" placeholder="4" value={form.creditos}
                onChange={e => setForm({ ...form, creditos: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Ciclo *</label>
              <input type="number" min="1" max="14" placeholder="1" value={form.ciclo}
                onChange={e => setForm({ ...form, ciclo: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Carrera *</label>
              <select value={form.carrera} onChange={e => setForm({ ...form, carrera: e.target.value })} required>
                <option value="">Seleccione una carrera</option>
                {carreras.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="">— Sin tipo —</option>
                {TIPO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Fila 3: Área | Prerrequisitos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Área Académica</label>
              <input placeholder="Ej. Formación Especializada" value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Prerrequisitos (códigos separados por coma)</label>
              <input placeholder="Ej. SIS101, MAT102" value={form.prerrequisitos}
                onChange={e => setForm({ ...form, prerrequisitos: e.target.value })} />
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" style={btnStyle}>
              {editId ? <><Edit2 size={16}/> Guardar Cambios</> : <><Plus size={16}/> Agregar Curso</>}
            </button>
            {editId && (
              <button type="button" onClick={handleCancel}
                style={{ ...btnStyle, background: 'var(--bg-card)', color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filtros */}
      <div className="modern-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Buscar por código, nombre o área..."
              value={busqueda} onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '36px', width: '100%' }} />
          </div>
          <select value={filtroCarrera} onChange={e => { setFiltroCarrera(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: '200px' }}>
            <option value="">Todas las carreras</option>
            {carreras.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </select>
          <select value={filtroCiclo} onChange={e => { setFiltroCiclo(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: '130px' }}>
            <option value="">Todos los ciclos</option>
            {ciclosDisponibles.map(n => <option key={n} value={n}>Ciclo {n}</option>)}
          </select>
        </div>
        {(busqueda || filtroCarrera || filtroCiclo) && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mostrando <strong>{cursosFiltrados.length}</strong> de {cursos.length} cursos
          </p>
        )}
      </div>

      {/* Tabla */}
      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Asignatura</th>
              <th style={{ textAlign: 'center' }}>Cred.</th>
              <th style={{ textAlign: 'center' }}>Ciclo</th>
              <th>Carrera</th>
              <th>Área</th>
              <th>Tipo</th>
              <th>Prerrequisitos</th>
              <th style={{ width: '90px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : cursosFiltrados.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {cursos.length === 0 ? 'No hay cursos registrados.' : 'No se encontraron resultados.'}
              </td></tr>
            ) : (
              (() => {
                const itemsPerPage = 20;
                const totalPages = Math.ceil(cursosFiltrados.length / itemsPerPage);
                const activePage = Math.max(1, Math.min(currentPage, totalPages));
                const indexOfLastItem = activePage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentItems = cursosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

                return currentItems.map(c => (
                  <tr key={c._id}>
                    <td><span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>{c.codigo}</span></td>
                    <td style={{ fontWeight: '500', maxWidth: '220px' }}>{c.nombre}</td>
                    <td style={{ textAlign: 'center' }}>{c.creditos}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-purple">C{c.ciclo}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '160px' }}>
                      {c.carrera?.nombre || '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.area || '—'}</td>
                    <td>
                      {c.tipo
                        ? <span className={`badge ${tipoBadge(c.tipo)}`}>{c.tipo}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>}
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      {c.prerrequisitos && c.prerrequisitos.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {c.prerrequisitos.map(p => (
                            <span key={p} style={{
                              fontSize: '0.72rem', background: 'var(--primary-alpha)',
                              color: 'var(--primary-purple)', borderRadius: '4px',
                              padding: '2px 6px', fontFamily: 'monospace', fontWeight: '600',
                            }}>{p}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Ninguno</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => handleEdit(c)} style={actionBtnStyle} title="Editar">
                          <Edit2 size={15}/>
                        </button>
                        <button onClick={() => handleDelete(c._id)}
                          style={{ ...actionBtnStyle, color: '#ef4444' }} title="Eliminar">
                          <Trash2 size={15}/>
                        </button>
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
        const itemsPerPage = 20;
        const totalPages = Math.ceil(cursosFiltrados.length / itemsPerPage);
        const activePage = Math.max(1, Math.min(currentPage, totalPages));
        const indexOfLastItem = activePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        if (totalPages <= 1) return null;

        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando <strong>{indexOfFirstItem + 1}</strong> a <strong>{Math.min(indexOfLastItem, cursosFiltrados.length)}</strong> de <strong>{cursosFiltrados.length}</strong> cursos
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

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: '600',
  color: 'var(--text-muted)', marginBottom: '0.4rem',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const btnStyle = {
  padding: '11px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
  background: 'var(--text-main)', color: 'white', fontWeight: '600',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
  fontSize: '0.9rem',
};
const actionBtnStyle = {
  padding: '6px', background: 'transparent', border: 'none',
  cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '6px',
  transition: 'background 0.15s',
};

export default CursosManager;
