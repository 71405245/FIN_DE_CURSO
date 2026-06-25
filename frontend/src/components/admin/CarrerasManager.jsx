import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Building, Edit2, Trash2, BookOpen } from 'lucide-react';

function CarrerasManager() {
  const [carreras, setCarreras] = useState([]);
  const [cursos,   setCursos]   = useState([]);
  const [form, setForm]         = useState({ nombre: '', descripcion: '' });
  const [editId, setEditId]     = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchCarreras();
    axios.get('/api/admin/cursos').then(res => setCursos(res.data));
  }, []);

  const fetchCarreras = async () => {
    const res = await axios.get('/api/admin/carreras');
    setCarreras(res.data);
  };

  const cursosDeCarrera = (carreraId) =>
    cursos.filter(c => c.carrera?._id === carreraId || c.carrera === carreraId).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await axios.put(`/api/admin/carreras/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('/api/admin/carreras', form);
      }
      setForm({ nombre: '', descripcion: '' });
      fetchCarreras();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar la carrera.');
    }
  };

  const handleEdit = (c) => {
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setEditId(c._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta carrera?')) return;
    try {
      await axios.delete(`/api/admin/carreras/${id}`);
      fetchCarreras();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ nombre: '', descripcion: '' });
    setError('');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <Building size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Carreras Académicas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {carreras.length} programas registrados · {cursos.length} cursos en total
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {editId ? <><Edit2 size={18}/> Editar Carrera</> : <><Plus size={18}/> Nueva Carrera</>}
        </h3>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
            padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}
          style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="carrera-nombre" style={labelStyle}>Nombre *</label>
            <input id="carrera-nombre" placeholder="Ej. Ingeniería de Sistemas" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="carrera-desc" style={labelStyle}>Descripción</label>
            <input id="carrera-desc" placeholder="Breve descripción del programa" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={btnStyle}>
              <Plus size={18}/> {editId ? 'Guardar' : 'Agregar'}
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

      {/* Tabla */}
      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Programa de Estudio</th>
              <th>Descripción</th>
              <th style={{ textAlign: 'center' }}>Cursos</th>
              <th style={{ width: '90px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carreras.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No hay carreras registradas.
                </td>
              </tr>
            ) : (
              carreras.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: '600' }}>{c.nombre}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {c.descripcion || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sin descripción</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'var(--primary-alpha)', color: 'var(--primary-purple)',
                      borderRadius: '20px', padding: '3px 12px', fontSize: '0.82rem', fontWeight: '700' }}>
                      <BookOpen size={12}/>
                      {cursosDeCarrera(c._id)}
                    </span>
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
              ))
            )}
          </tbody>
        </table>
      </div>
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
  fontSize: '0.9rem', whiteSpace: 'nowrap',
};
const actionBtnStyle = {
  padding: '6px', background: 'transparent', border: 'none',
  cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '6px',
};

export default CarrerasManager;
