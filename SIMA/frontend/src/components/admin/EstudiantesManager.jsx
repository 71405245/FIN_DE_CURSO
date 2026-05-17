import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, GraduationCap, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

const EMPTY_FORM = { nombre: '', apellidos: '', email: '', password: '', carrera: '', cicloActual: 1 };

function EstudiantesManager() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/admin/estudiantes/${editId}`, form);
        setSuccess('Estudiante actualizado correctamente.');
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/admin/estudiantes', form);
        setSuccess('Estudiante registrado correctamente.');
      }
      setForm(EMPTY_FORM);
      fetchEstudiantes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar el estudiante.');
    }
  };

  const handleEdit = (e) => {
    setForm({ 
      nombre: e.nombre, 
      apellidos: e.apellidos, 
      email: e.email, 
      password: '', // Vacío para no cambiar
      carrera: e.carrera?._id || '', 
      cicloActual: e.cicloActual || 1 
    });
    setEditId(e._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este estudiante?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/estudiantes/${id}`);
      fetchEstudiantes();
      setSuccess('Estudiante eliminado correctamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <GraduationCap size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            Gestión de Alumnos
            <span style={{ fontSize: '0.8rem', background: 'var(--primary-alpha)', color: 'var(--primary-purple)', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
              {estudiantes.length.toLocaleString()} Alumnos
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>Registra estudiantes de forma individual y asígnalos a su carrera y ciclo académico.</p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16}/> {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16}/> {success}
        </div>
      )}

      {/* Registro Individual */}
      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: '700' }}>
          {editId ? 'Editar Alumno' : 'Registrar Nuevo Estudiante'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} required />
          </div>
          <div>
            <label style={labelStyle}>Apellidos *</label>
            <input placeholder="Apellidos" value={form.apellidos} onChange={e=>setForm({...form, apellidos: e.target.value})} required />
          </div>
          <div>
            <label style={labelStyle}>Correo Electrónico *</label>
            <input type="email" placeholder="ejemplo@alumno.edu" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label style={labelStyle}>{editId ? 'Nueva Clave (Opcional)' : 'Contraseña Temporal *'}</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required={!editId} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Carrera del Alumno *</label>
            <select value={form.carrera} onChange={e=>setForm({...form, carrera: e.target.value})} required>
              <option value="">Seleccione Carrera</option>
              {carreras.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ciclo Actual *</label>
            <input type="number" placeholder="Ej. 1" value={form.cicloActual} onChange={e=>setForm({...form, cicloActual: Number(e.target.value)})} required min="1" max="10"/>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={btnStyle}><Plus size={18}/> {editId ? 'Guardar' : 'Matricular'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }} style={{...btnStyle, background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)'}}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Lista de Alumnos */}
      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>Nombre Completo</th>
              <th>Email</th>
              <th>Carrera</th>
              <th style={{ textAlign: 'center' }}>Ciclo</th>
              <th style={{ width: '90px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>No hay estudiantes registrados actualmente.</td></tr>
            ) : (
              estudiantes.map(e => (
                <tr key={e._id}>
                  <td style={{ paddingLeft: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{e.nombre} {e.apellidos}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{e.email}</td>
                  <td style={{ fontWeight: '500' }}>{e.carrera?.nombre || <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-purple" style={{ fontWeight: '700' }}>Ciclo {e.cicloActual}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => handleEdit(e)} style={actionBtnStyle} title="Editar"><Edit2 size={15}/></button>
                      <button onClick={() => handleDelete(e._id)} style={{...actionBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={15}/></button>
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
  display: 'block', 
  fontSize: '0.78rem', 
  fontWeight: '600', 
  color: 'var(--text-muted)', 
  marginBottom: '0.4rem', 
  textTransform: 'uppercase', 
  letterSpacing: '0.05em' 
};

const btnStyle = { 
  padding: '11px 20px', 
  height: '46px', 
  borderRadius: 'var(--radius-sm)', 
  border: 'none', 
  background: 'var(--text-main)', 
  color: 'white', 
  fontWeight: '600', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '0.5rem',
  fontSize: '0.9rem'
};

const actionBtnStyle = { 
  padding: '6px', 
  background: 'transparent', 
  border: 'none', 
  cursor: 'pointer', 
  color: 'var(--text-muted)' 
};

export default EstudiantesManager;
