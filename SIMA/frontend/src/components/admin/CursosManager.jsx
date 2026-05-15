import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, BookOpen, Edit2, Trash2 } from 'lucide-react';

function CursosManager() {
  const [cursos, setCursos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [form, setForm] = useState({ codigo: '', nombre: '', creditos: '', carrera: '', ciclo: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => { 
    fetchCursos(); 
    axios.get('http://localhost:5000/api/admin/carreras').then(res => setCarreras(res.data));
  }, []);
  
  const fetchCursos = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/cursos');
    setCursos(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/admin/cursos/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/admin/cursos', form);
      }
      setForm({ codigo: '', nombre: '', creditos: '', carrera: '', ciclo: '' });
      fetchCursos();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const handleEdit = (c) => {
    setForm({ codigo: c.codigo, nombre: c.nombre, creditos: c.creditos, carrera: c.carrera?._id, ciclo: c.ciclo });
    setEditId(c._id);
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <BookOpen size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Plan de Estudios (Cursos)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Agrega asignaturas y define su posición en la malla curricular.</p>
        </div>
      </div>

      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>{editId ? 'Editar Curso' : 'Crear Nuevo Curso'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div><label style={labelStyle}>Código</label><input placeholder="Ej. SIS101" value={form.codigo} onChange={e=>setForm({...form, codigo: e.target.value})} required /></div>
          <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Nombre del Curso</label><input placeholder="Ej. Programación I" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} required /></div>
          <div><label style={labelStyle}>Créditos</label><input type="number" placeholder="Ej. 4" value={form.creditos} onChange={e=>setForm({...form, creditos: e.target.value})} required /></div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Carrera Perteneciente</label>
            <select value={form.carrera} onChange={e=>setForm({...form, carrera: e.target.value})} required>
              <option value="">Seleccione Carrera</option>
              {carreras.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Ciclo / Semestre</label><input type="number" placeholder="Ej. 1" value={form.ciclo} onChange={e=>setForm({...form, ciclo: e.target.value})} required /></div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={btnStyle}><Plus size={18}/> {editId ? 'Guardar' : 'Agregar'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ codigo: '', nombre: '', creditos: '', carrera: '', ciclo: '' }); }} style={{...btnStyle, background: 'var(--text-muted)'}}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead><tr><th>Código</th><th>Nombre</th><th>Créditos</th><th>Carrera</th><th>Ciclo</th><th>Acciones</th></tr></thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay cursos registrados.</td></tr>
            ) : (
              cursos.map(c => (
                <tr key={c._id}>
                  <td><span className="badge badge-gray">{c.codigo}</span></td>
                  <td style={{ fontWeight: '500' }}>{c.nombre}</td>
                  <td>{c.creditos}</td>
                  <td>{c.carrera?.nombre}</td>
                  <td><span className="badge badge-purple">Ciclo {c.ciclo}</span></td>
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

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnStyle = { padding: '12px 20px', height: '46px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--text-main)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
const actionBtnStyle = { padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };

export default CursosManager;
