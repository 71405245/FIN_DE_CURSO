import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Layers, Edit2, Trash2 } from 'lucide-react';

function SeccionesManager() {
  const [secciones, setSecciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [form, setForm] = useState({ curso: '', docente: '', codigoSeccion: '', horario: '', aula: '', cupoMaximo: 30 });
  const [editId, setEditId] = useState(null);

  useEffect(() => { 
    fetchSecciones(); 
    axios.get('http://localhost:5000/api/admin/cursos').then(res => setCursos(res.data));
    axios.get('http://localhost:5000/api/admin/docentes').then(res => setDocentes(res.data));
  }, []);

  const fetchSecciones = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/secciones');
    setSecciones(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/admin/secciones/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/admin/secciones', form);
      }
      setForm({ curso: '', docente: '', codigoSeccion: '', horario: '', aula: '', cupoMaximo: 30 });
      fetchSecciones();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const handleEdit = (s) => {
    setForm({ 
      curso: s.curso?._id, 
      docente: s.docente?._id, 
      codigoSeccion: s.codigoSeccion, 
      horario: s.horario, 
      aula: s.aula, 
      cupoMaximo: s.cupoMaximo 
    });
    setEditId(s._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este salón?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/secciones/${id}`);
      fetchSecciones();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <Layers size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Gestión de Salones (Secciones)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Abre salones asignando un curso, docente, aula y cupo.</p>
        </div>
      </div>

      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>{editId ? 'Editar Salón' : 'Abrir Nuevo Salón'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Curso / Asignatura</label>
            <select value={form.curso} onChange={e=>setForm({...form, curso: e.target.value})} required>
              <option value="">Seleccione Curso</option>
              {cursos.map(c => <option key={c._id} value={c._id}>{c.nombre} (Ciclo {c.ciclo})</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Docente Asignado</label>
            <select value={form.docente} onChange={e=>setForm({...form, docente: e.target.value})} required>
              <option value="">Seleccione Docente</option>
              {docentes.map(d => <option key={d._id} value={d._id}>{d.nombre} {d.apellidos}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Código (Ej. A1)</label><input placeholder="Código" value={form.codigoSeccion} onChange={e=>setForm({...form, codigoSeccion: e.target.value})} required /></div>
          <div><label style={labelStyle}>Horario</label><input placeholder="Ej. L-M 10am" value={form.horario} onChange={e=>setForm({...form, horario: e.target.value})} required /></div>
          <div><label style={labelStyle}>Aula</label><input placeholder="Ej. Lab 3" value={form.aula} onChange={e=>setForm({...form, aula: e.target.value})} required /></div>
          <div><label style={labelStyle}>Cupos Mín 25</label><input type="number" placeholder="30" value={form.cupoMaximo} onChange={e=>setForm({...form, cupoMaximo: e.target.value})} min="25" required /></div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={btnStyle}><Plus size={18}/> {editId ? 'Guardar' : 'Aperturar'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ curso: '', docente: '', codigoSeccion: '', horario: '', aula: '', cupoMaximo: 30 }); }} style={{...btnStyle, background: 'var(--text-muted)'}}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead><tr><th>Código</th><th>Curso</th><th>Docente</th><th>Horario / Aula</th><th>Matrícula</th><th>Acciones</th></tr></thead>
          <tbody>
            {secciones.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay salones abiertos.</td></tr>
            ) : (
              secciones.map(s => {
                const isFull = s.estudiantesMatriculados?.length >= s.cupoMaximo;
                return (
                  <tr key={s._id}>
                    <td><span className="badge badge-gray">{s.codigoSeccion}</span></td>
                    <td style={{ fontWeight: '500' }}>{s.curso?.nombre}</td>
                    <td>{s.docente?.nombre} {s.docente?.apellidos}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.horario}<br/>{s.aula}</td>
                    <td>
                      <span className={`badge ${isFull ? 'badge-gray' : 'badge-green'}`} style={{ color: isFull ? 'red' : '' }}>
                        {s.estudiantesMatriculados?.length || 0} / {s.cupoMaximo}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(s)} style={actionBtnStyle} title="Editar"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(s._id)} style={{...actionBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

export default SeccionesManager;
