import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';

// Componente de Rota Protegida Real
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
       <div className="w-8 h-8 border-2 border-accent-violet border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return user ? <>{children}</> : <Navigate to="/auth" />;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-accent-violet/30">
        <Routes>
          {/* Rota Pública: Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rota de Autenticação */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Rota Privada: Dashboard (A Forja) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback para 404 ou redirecionamento */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
