import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, BookOpen, Users, Layers, GraduationCap, Building, LayoutDashboard, ChevronRight, BarChart2 } from 'lucide-react';
import CarrerasManager from '../components/admin/CarrerasManager';
import CursosManager from '../components/admin/CursosManager';
import EstudiantesManager from '../components/admin/EstudiantesManager';
import DocentesManager from '../components/admin/DocentesManager';
import SeccionesManager from '../components/admin/SeccionesManager';
import PlanificacionManager from '../components/admin/PlanificacionManager';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('carreras');
  const [isHovered, setIsHovered] = useState(false);
  const [stats, setStats] = useState({ carreras: 0, cursos: 0, alumnos: 0, docentes: 0, secciones: 0 });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') {
      navigate('/login');
      return;
    }
    // Cargar estadísticas en tiempo real
    axios.get('http://localhost:5000/api/admin/carreras').then(res => setStats(prev => ({ ...prev, carreras: res.data.length }))).catch(() => {});
    axios.get('http://localhost:5000/api/admin/cursos').then(res => setStats(prev => ({ ...prev, cursos: res.data.length }))).catch(() => {});
    axios.get('http://localhost:5000/api/admin/estudiantes').then(res => setStats(prev => ({ ...prev, alumnos: res.data.length }))).catch(() => {});
    axios.get('http://localhost:5000/api/admin/docentes').then(res => setStats(prev => ({ ...prev, docentes: res.data.length }))).catch(() => {});
    axios.get('http://localhost:5000/api/admin/secciones').then(res => setStats(prev => ({ ...prev, secciones: res.data.length }))).catch(() => {});
  }, [navigate, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      
      {/* Sidebar Expanding Premium */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          width: isHovered ? '260px' : '80px', 
          background: 'var(--surface)', 
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          height: '100vh',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ 
          padding: '2rem 0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          paddingLeft: '1.25rem',
          borderBottom: '1px solid var(--border)',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ minWidth: '40px', height: '40px', background: 'var(--primary-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            <LayoutDashboard size={20} />
          </div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '800', margin: 0, opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}>
            SIMA<span style={{ color: 'var(--primary-purple)' }}>.</span>
          </h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1.5rem 0', flex: 1 }}>
          <TabButton active={activeTab === 'carreras'} onClick={() => setActiveTab('carreras')} icon={<Building size={20}/>} text="Gestión de Carreras" isHovered={isHovered} badge={stats.carreras} />
          <TabButton active={activeTab === 'cursos'} onClick={() => setActiveTab('cursos')} icon={<BookOpen size={20}/>} text="Plan de Estudios" isHovered={isHovered} badge={stats.cursos} />
          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 1.5rem' }} />
          <TabButton active={activeTab === 'alumnos'} onClick={() => setActiveTab('alumnos')} icon={<GraduationCap size={20}/>} text="Alumnos" isHovered={isHovered} badge={stats.alumnos} />
          <TabButton active={activeTab === 'docentes'} onClick={() => setActiveTab('docentes')} icon={<Users size={20}/>} text="Personal Docente" isHovered={isHovered} badge={stats.docentes} />
          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 1.5rem' }} />
          <TabButton active={activeTab === 'secciones'} onClick={() => setActiveTab('secciones')} icon={<Layers size={20}/>} text="Salones y Horarios" isHovered={isHovered} badge={stats.secciones} />
          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 1.5rem' }} />
          <TabButton active={activeTab === 'planificacion'} onClick={() => setActiveTab('planificacion')} icon={<BarChart2 size={20}/>} text="Centro de Planificación" isHovered={isHovered} />
        </nav>

        <div style={{ padding: '1.5rem 0', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{ ...tabStyleBase, color: '#ef4444', width: '100%', paddingLeft: '1.75rem', whiteSpace: 'nowrap' }}>
            <div style={{ minWidth: '24px' }}><LogOut size={20} /></div>
            <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginLeft: isHovered ? '260px' : '80px', 
        transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '2rem 3rem'
      }}>
        {/* Header Superior */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'var(--surface)', padding: '1rem 2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Panel de Control</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Bienvenido, {user?.nombre}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
               {user?.nombre?.charAt(0)}
             </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
          {activeTab === 'carreras' && <CarrerasManager />}
          {activeTab === 'cursos' && <CursosManager />}
          {activeTab === 'alumnos' && <EstudiantesManager />}
          {activeTab === 'docentes' && <DocentesManager />}
          {activeTab === 'secciones' && <SeccionesManager />}
          {activeTab === 'planificacion' && <PlanificacionManager />}
        </div>
      </main>
    </div>
  );
}

// Sidebar Button Component
const TabButton = ({ active, onClick, icon, text, isHovered, badge }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...tabStyleBase,
        background: active ? 'var(--primary-alpha)' : (hovered ? 'rgba(0,0,0,0.02)' : 'transparent'),
        color: active ? 'var(--primary-dark)' : 'var(--text-muted)',
        borderRight: active ? '4px solid var(--primary-purple)' : '4px solid transparent',
        fontWeight: active ? '700' : '500',
        paddingLeft: '1.75rem',
        whiteSpace: 'nowrap'
      }}
    >
      <div style={{ minWidth: '24px', display: 'flex', color: active ? 'var(--primary-purple)' : 'inherit' }}>
        {icon}
      </div>
      <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, paddingRight: '1rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {text}
          {badge !== undefined && badge !== null && badge > 0 && (
            <span style={{ 
              background: active ? 'var(--primary-purple)' : 'var(--primary-alpha)', 
              color: active ? 'white' : 'var(--primary-purple)', 
              fontSize: '0.72rem', 
              padding: '2px 7px', 
              borderRadius: '20px', 
              fontWeight: '800',
              marginLeft: '4px',
              transition: 'all 0.2s ease'
            }}>
              {badge.toLocaleString()}
            </span>
          )}
        </span>
        {active && <ChevronRight size={16} />}
      </span>
    </button>
  );
};

const tabStyleBase = {
  display: 'flex', alignItems: 'center', gap: '1rem',
  padding: '14px 0', border: 'none',
  cursor: 'pointer', textAlign: 'left',
  transition: 'all 0.2s ease',
  fontSize: '1rem',
  background: 'transparent'
};

export default AdminDashboard;
