import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import DashboardLayout from './components/Layout/DashboardLayout';
import Home from './pages/Dashboard/Home';
import Login from './pages/Login';
import Familias from './pages/Familias/Familias';
import Inventario from './pages/Inventario/Inventario';
import Entregas from './pages/Entregas/Entregas';
import Reportes from './pages/Reportes/Reportes';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Home />} />
              <Route path="familias" element={<Familias />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="entregas" element={<Entregas />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="auditoria" element={<Reportes />} /> {/* Redirige al mismo comp en este prototipo */}
            </Route>
            {/* Página 404 */}
            <Route path="/404" element={<NotFound />} />
            {/* Default fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
