import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Building, Edit2, Trash2 } from 'lucide-react';

function CarrerasManager() {
  const [carreras, setCarreras] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchCarreras(); }, []);
  const fetchCarreras = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/carreras');
    setCarreras(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/admin/carreras/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/admin/carreras', form);
      }
      setForm({ nombre: '', descripcion: '' });
      fetchCarreras();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const handleEdit = (c) => {
    setForm({ nombre: c.nombre, descripcion: c.descripcion });
    setEditId(c._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta carrera?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/carreras/${id}`);
      fetchCarreras();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <Building size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Carreras Académicas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestiona los programas de estudio ofrecidos.</p>
        </div>
      </div>

      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>{editId ? 'Editar Carrera' : 'Crear Nueva Carrera'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'start' }}>
          <input placeholder="Nombre de la Carrera (Ej. Sistemas)" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} required />
          <input placeholder="Descripción breve" value={form.descripcion} onChange={e=>setForm({...form, descripcion: e.target.value})} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={btnStyle}><Plus size={18}/> {editId ? 'Guardar' : 'Agregar'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nombre: '', descripcion: '' }); }} style={{...btnStyle, background: 'var(--text-muted)'}}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead><tr><th>Nombre del Programa</th><th>Descripción</th><th style={{ width: '100px' }}>Acciones</th></tr></thead>
          <tbody>
            {carreras.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay carreras registradas.</td></tr>
            ) : (
              carreras.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: '500' }}>{c.nombre}</td>
                  <td>{c.descripcion || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(c)} style={actionBtnStyle} title="Editar"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(c._id)} style={{...actionBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={16}/></button>
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

const btnStyle = { padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--text-main)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const actionBtnStyle = { padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };

export default CarrerasManager;
