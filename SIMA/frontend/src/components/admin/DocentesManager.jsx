import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Edit2, Trash2 } from 'lucide-react';

function DocentesManager() {
  const [docentes, setDocentes] = useState([]);
  const [carrerasList, setCarrerasList] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', password: '', carrerasEnsenadas: [] });
  const [editId, setEditId] = useState(null);

  useEffect(() => { 
    fetchDocentes(); 
    axios.get('http://localhost:5000/api/admin/carreras').then(res => setCarrerasList(res.data));
  }, []);
  
  const fetchDocentes = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/docentes');
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
        await axios.put(`http://localhost:5000/api/admin/docentes/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/admin/docentes', form);
      }
      setForm({ nombre: '', apellidos: '', email: '', password: '', carrerasEnsenadas: [] });
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
      carrerasEnsenadas: d.carrerasEnsenadas?.map(c => c._id) || []
    });
    setEditId(d._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este docente?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/docentes/${id}`);
      fetchDocentes();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

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
          <div><label style={labelStyle}>Nombre</label><input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} required /></div>
          <div><label style={labelStyle}>Apellidos</label><input placeholder="Apellidos" value={form.apellidos} onChange={e=>setForm({...form, apellidos: e.target.value})} required /></div>
          <div><label style={labelStyle}>Correo Electrónico</label><input type="email" placeholder="ejemplo@profesor.edu" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required /></div>
          <div><label style={labelStyle}>{editId ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal'}</label><input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required={!editId} /></div>
          
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
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nombre: '', apellidos: '', email: '', password: '', carrerasEnsenadas: [] }); }} style={{...btnStyle, background: 'var(--text-muted)'}}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead><tr><th>Docente</th><th>Email</th><th>Carreras Asignadas</th><th>Acciones</th></tr></thead>
          <tbody>
            {docentes.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay docentes registrados.</td></tr>
            ) : (
              docentes.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: '500' }}>{d.nombre} {d.apellidos}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{d.email}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnStyle = { padding: '12px 20px', height: '46px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--text-main)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
const actionBtnStyle = { padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };

export default DocentesManager;
