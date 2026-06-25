import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Layers, Edit2, Trash2, Clock, MapPin, Check } from 'lucide-react';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const EMPTY_FORM = {
  curso: '',
  docente: '',
  codigoSeccion: '',
  dias: [],
  horaInicio: '',
  horaFin: '',
  aula: '',
  cupoMaximo: 30
};

function SeccionesManager() {
  const [secciones, setSecciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSecciones();
    axios.get('/api/admin/cursos').then(res => setCursos(res.data));
    axios.get('/api/admin/docentes').then(res => setDocentes(res.data));
  }, []);

  const fetchSecciones = async () => {
    const res = await axios.get('/api/admin/secciones');
    setSecciones(res.data);
  };

  const formatearHorario = (dias, inicio, fin) => {
    if (!dias || dias.length === 0 || !inicio || !fin) return '';
    let diasStr = '';
    if (dias.length === 1) {
      diasStr = dias[0];
    } else {
      diasStr = dias.slice(0, -1).join(', ') + ' y ' + dias[dias.length - 1];
    }
    return `${diasStr} ${inicio} - ${fin}`;
  };

  const handleDiaToggle = (dia) => {
    setForm(prev => {
      const dias = prev.dias.includes(dia)
        ? prev.dias.filter(d => d !== dia)
        : [...prev.dias, dia];
      // Ordenar los días según el orden de la semana
      const diasOrdenados = DIAS_SEMANA.filter(d => dias.includes(d));
      return { ...prev, dias: diasOrdenados };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.dias.length === 0) {
      setError('Por favor, selecciona al menos un día para el horario.');
      return;
    }
    if (!form.horaInicio || !form.horaFin) {
      setError('Por favor, define la hora de inicio y la hora de fin.');
      return;
    }
    if (form.horaInicio >= form.horaFin) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    try {
      const horarioFormateado = formatearHorario(form.dias, form.horaInicio, form.horaFin);
      const payload = {
        ...form,
        horario: horarioFormateado
      };

      if (editId) {
        await axios.put(`/api/admin/secciones/${editId}`, payload);
        setSuccess('Salón actualizado correctamente.');
        setEditId(null);
      } else {
        await axios.post('/api/admin/secciones', payload);
        setSuccess('Salón aperturado correctamente.');
      }
      setForm(EMPTY_FORM);
      fetchSecciones();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar el salón.');
    }
  };

  const handleEdit = (s) => {
    setForm({
      curso: s.curso?._id || '',
      docente: s.docente?._id || '',
      codigoSeccion: s.codigoSeccion || '',
      dias: s.dias || [],
      horaInicio: s.horaInicio || '',
      horaFin: s.horaFin || '',
      aula: s.aula || '',
      cupoMaximo: s.cupoMaximo || 30
    });
    setEditId(s._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este salón?')) return;
    try {
      await axios.delete(`/api/admin/secciones/${id}`);
      fetchSecciones();
      setSuccess('Salón eliminado correctamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al eliminar');
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const vistaPreviaHorario = formatearHorario(form.dias, form.horaInicio, form.horaFin);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'var(--primary-alpha)', borderRadius: '12px', color: 'var(--primary-purple)' }}>
          <Layers size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Gestión de Salones (Secciones)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Abre nuevos salones asignando docentes, cursos, aulas y horarios con precisión.</p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16}/> {success}
        </div>
      )}

      {/* Formulario */}
      <div className="modern-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
          {editId ? 'Editar Configuración de Salón' : 'Aperturar Nuevo Salón'}
        </h3>
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Curso */}
            <div>
              <label htmlFor="curso-select" style={labelStyle}>Curso / Asignatura *</label>
              <select id="curso-select" value={form.curso} onChange={e => setForm({ ...form, curso: e.target.value })} required>
                <option value="">Seleccione Curso</option>
                {cursos.map(c => (
                  <option key={c._id} value={c._id}>
                    [{c.codigo}] {c.nombre} ({c.carrera?.nombre || 'General'} - Ciclo {c.ciclo})
                  </option>
                ))}
              </select>
            </div>

            {/* Docente */}
            <div>
              <label htmlFor="docente-select" style={labelStyle}>Docente Asignado *</label>
              <select id="docente-select" value={form.docente} onChange={e => setForm({ ...form, docente: e.target.value })} required>
                <option value="">Seleccione Docente</option>
                {docentes.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.nombre} {d.apellidos} ({d.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Código de Sección */}
            <div>
              <label htmlFor="codigo-seccion" style={labelStyle}>Código de Salón * (Ej: Secc A, Secc 101)</label>
              <input id="codigo-seccion" placeholder="Ej. A1" value={form.codigoSeccion} onChange={e => setForm({ ...form, codigoSeccion: e.target.value })} required />
            </div>

            {/* Aula */}
            <div>
              <label htmlFor="aula-input" style={labelStyle}>Aula / Laboratorio / Virtual *</label>
              <input id="aula-input" placeholder="Ej. Pabellón B - Aula 302" value={form.aula} onChange={e => setForm({ ...form, aula: e.target.value })} required />
            </div>

            {/* Cupos */}
            <div>
              <label htmlFor="cupo-max" style={labelStyle}>Cupo Máximo (Mínimo 25) *</label>
              <input id="cupo-max" type="number" min="25" max="60" placeholder="30" value={form.cupoMaximo} onChange={e => setForm({ ...form, cupoMaximo: Number(e.target.value) })} required />
            </div>
          </div>

          {/* Horario Inteligente (Inicio / Fin) */}
          <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--primary-purple)"/> Planificador de Horario
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
              {/* Días */}
              <div>
                <div style={{ ...labelStyle, marginBottom: '0.75rem' }}>Días de clase *</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {DIAS_SEMANA.map(dia => {
                    const seleccionado = form.dias.includes(dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => handleDiaToggle(dia)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: seleccionado ? '1.5px solid var(--primary-purple)' : '1.5px solid #cbd5e1',
                          background: seleccionado ? 'var(--primary-alpha)' : 'white',
                          color: seleccionado ? 'var(--primary-dark)' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horas */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label htmlFor="hora-inicio" style={labelStyle}>Hora de Inicio *</label>
                  <input
                    id="hora-inicio"
                    type="time"
                    value={form.horaInicio}
                    onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                    style={{ width: '130px', padding: '8px 12px', fontSize: '0.9rem' }}
                    required
                  />
                </div>
                <span style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>a</span>
                <div>
                  <label htmlFor="hora-fin" style={labelStyle}>Hora de Fin *</label>
                  <input
                    id="hora-fin"
                    type="time"
                    value={form.horaFin}
                    onChange={e => setForm({ ...form, horaFin: e.target.value })}
                    style={{ width: '130px', padding: '8px 12px', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Vista Previa en Vivo */}
            {vistaPreviaHorario && (
              <div style={{ marginTop: '1.25rem', padding: '10px 15px', background: 'var(--surface)', borderRadius: '8px', borderLeft: '3px solid var(--primary-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vista Previa:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{vistaPreviaHorario}</span>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" style={btnStyle}>
              <Plus size={18}/> {editId ? 'Guardar Cambios' : 'Aperturar Salón'}
            </button>
            {editId && (
              <button type="button" onClick={handleCancel} style={{ ...btnStyle, background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Salones Abiertos */}
      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>Código</th>
              <th>Asignatura</th>
              <th>Docente</th>
              <th>Horario</th>
              <th>Aula</th>
              <th style={{ textAlign: 'center' }}>Matrícula</th>
              <th style={{ width: '90px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {secciones.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No hay salones (secciones) abiertas actualmente.
                </td>
              </tr>
            ) : (
              (() => {
                const itemsPerPage = 15;
                const totalPages = Math.ceil(secciones.length / itemsPerPage);
                const activePage = Math.max(1, Math.min(currentPage, totalPages));
                const indexOfLastItem = activePage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentItems = secciones.slice(indexOfFirstItem, indexOfLastItem);

                return currentItems.map(s => {
                  const matriculadosCount = s.estudiantesMatriculadosCount !== undefined ? s.estudiantesMatriculadosCount : (s.estudiantesMatriculados?.length || 0);
                  const isFull = matriculadosCount >= s.cupoMaximo;
                  return (
                    <tr key={s._id}>
                      <td style={{ paddingLeft: '1.5rem' }}>
                        <span className="badge badge-gray" style={{ fontWeight: '700' }}>{s.codigoSeccion}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.curso?.nombre}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.curso?.codigo}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{s.docente ? `${s.docente.nombre} ${s.docente.apellidos}` : 'No asignado'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} style={{ color: 'var(--primary-purple)' }}/> {s.horario}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} style={{ color: '#ef4444' }}/> {s.aula}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${isFull ? 'badge-gray' : 'badge-green'}`}
                          style={{
                            padding: '4px 10px',
                            color: isFull ? '#ef4444' : '#059669',
                            fontWeight: '700'
                          }}
                        >
                          {matriculadosCount} / {s.cupoMaximo}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => handleEdit(s)} style={actionBtnStyle} title="Editar">
                            <Edit2 size={15}/>
                          </button>
                          <button onClick={() => handleDelete(s._id)} style={{ ...actionBtnStyle, color: '#ef4444' }} title="Eliminar">
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {(() => {
        const itemsPerPage = 15;
        const totalPages = Math.ceil(secciones.length / itemsPerPage);
        const activePage = Math.max(1, Math.min(currentPage, totalPages));
        const indexOfLastItem = activePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        if (totalPages <= 1) return null;

        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando <strong>{indexOfFirstItem + 1}</strong> a <strong>{Math.min(indexOfLastItem, secciones.length)}</strong> de <strong>{secciones.length}</strong> salones
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
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--text-main)',
  color: 'white',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem'
};

const actionBtnStyle = {
  padding: '6px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  borderRadius: '6px'
};

export default SeccionesManager;
