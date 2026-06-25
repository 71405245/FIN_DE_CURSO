import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import './App.css';

// [OPTIMIZACIÓN 4] Lazy Loading — cada dashboard se descarga solo cuando el usuario
// accede a esa ruta, reduciendo el bundle inicial y el consumo de ancho de banda.
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));
const EstudianteDashboard = lazy(() => import('./pages/EstudianteDashboard'));
const DocenteDashboard   = lazy(() => import('./pages/DocenteDashboard'));

// Spinner ligero de carga (sin librería externa)
const LoadingFallback = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#0f172a', flexDirection: 'column', gap: '1rem'
  }}>
    <div style={{
      width: 48, height: 48, border: '4px solid #6366f1',
      borderTopColor: 'transparent', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ color: '#94a3b8', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem' }}>
      Cargando módulo…
    </span>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/admin"      element={<AdminDashboard />} />
          <Route path="/estudiante" element={<EstudianteDashboard />} />
          <Route path="/docente"    element={<DocenteDashboard />} />
          {/* Ruta base redirige a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
