import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, GraduationCap, Edit2, Trash2 } from 'lucide-react';

function EstudiantesManager() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', password: '', carrera: '', cicloActual: 1 });
  const [editId, setEditId] = useState(null);

  useEffect(() => { 
    fetchEstudiantes(); 
    axios.get('http://localhost:5000/api/admin/carreras').then(res => setCarreras(res.data));
  }, []);

  const fetchEstudiantes = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/estudiantes');
    setEstudiantes(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/admin/estudiantes/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/admin/estudiantes', form);
      }
      setForm({ nombre: '', apellidos: '', email: '', password: '', carrera: '', cicloActual: 1 });
      fetchEstudiantes();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const handleEdit = (e) => {
    setForm({ 
      nombre: e.nombre, 
      apellidos: e.apellidos, 
      email: e.email, 
      password: '', // empty to not change
      carrera: e.carrera?._id, 
      cicloActual: e.cicloActual 
    });
    setEditId(e._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este estudiante?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/estudiantes/${id}`);
      fetchEstudiantes();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <GraduationCap size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Gestión de Alumnos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registra estudiantes y asígnalos a su carrera y ciclo inicial.</p>
        </div>
      </div>

      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>{editId ? 'Editar Alumno' : 'Crear Nuevo Alumno'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div><label style={labelStyle}>Nombre</label><input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} required /></div>
          <div><label style={labelStyle}>Apellidos</label><input placeholder="Apellidos" value={form.apellidos} onChange={e=>setForm({...form, apellidos: e.target.value})} required /></div>
          <div><label style={labelStyle}>Correo Electrónico</label><input type="email" placeholder="ejemplo@alumno.edu" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required /></div>
          <div><label style={labelStyle}>{editId ? 'Nueva Clave (Opcional)' : 'Contraseña Temporal'}</label><input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required={!editId} /></div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Carrera</label>
            <select value={form.carrera} onChange={e=>setForm({...form, carrera: e.target.value})} required>
              <option value="">Seleccione Carrera</option>
              {carreras.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Ciclo Actual</label><input type="number" placeholder="Ej. 1" value={form.cicloActual} onChange={e=>setForm({...form, cicloActual: e.target.value})} required min="1" max="10"/></div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={btnStyle}><Plus size={18}/> {editId ? 'Guardar' : 'Matricular'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nombre: '', apellidos: '', email: '', password: '', carrera: '', cicloActual: 1 }); }} style={{...btnStyle, background: 'var(--text-muted)'}}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead><tr><th>Nombre Completo</th><th>Email</th><th>Carrera</th><th>Ciclo</th><th>Acciones</th></tr></thead>
          <tbody>
            {estudiantes.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay estudiantes registrados.</td></tr>
            ) : (
              estudiantes.map(e => (
                <tr key={e._id}>
                  <td style={{ fontWeight: '500' }}>{e.nombre} {e.apellidos}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{e.email}</td>
                  <td>{e.carrera?.nombre || 'Sin asignar'}</td>
                  <td><span className="badge badge-purple">Ciclo {e.cicloActual}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(e)} style={actionBtnStyle} title="Editar"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(e._id)} style={{...actionBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={16}/></button>
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

export default EstudiantesManager;
