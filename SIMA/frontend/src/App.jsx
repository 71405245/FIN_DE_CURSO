import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EstudianteDashboard from './pages/EstudianteDashboard';
import DocenteDashboard from './pages/DocenteDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/estudiante" element={<EstudianteDashboard />} />
        <Route path="/docente" element={<DocenteDashboard />} />
        {/* Ruta base redirige a login temporalmente */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
