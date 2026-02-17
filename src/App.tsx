import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from "./pages/Tasks";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600 font-medium">Autenticando...</span>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Rota de Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Rotas Protegidas */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Redirecionamento padrão para Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Rota de Tarefas (Substitui Pacientes) */}
                <Route path="/tarefas" element={<Tasks />} />

                {/* Perfil (Placeholder mantido para futura implementação) */}
                <Route 
                  path="/perfil" 
                  element={
                    <div className="card p-8 text-center bg-white shadow-sm rounded-xl">
                      <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
                      <p className="text-gray-600 mt-2">Dados da conta e preferências.</p>
                      <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg inline-block">
                        Em desenvolvimento
                      </div>
                    </div>
                  } 
                />

                {/* Rota 404 */}
                <Route 
                  path="*" 
                  element={
                    <div className="card p-12 text-center bg-white shadow-sm rounded-xl">
                      <h2 className="text-3xl font-bold text-red-600">404</h2>
                      <h2 className="text-xl font-bold text-gray-900 mt-2">Página não encontrada</h2>
                      <p className="text-gray-600 mt-2">A página que você procura não existe ou foi movida.</p>
                      <button 
                        onClick={() => window.location.href = '/'}
                        className="mt-6 btn-primary px-6 py-2"
                      >
                        Voltar ao Início
                      </button>
                    </div>
                  } 
                />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;