import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar o hook
import { Usuario, AuthContextType, LoginResponseDTO } from '../types';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  const login = async (email: string, senha: string) => {
    try {
      setIsLoading(true);
      const response: LoginResponseDTO = await authService.login({ email, senha });
      
      const accessToken = response.accessToken; 
      
      if (accessToken) {
        setToken(accessToken);
        setUser(response.usuario);
        
        localStorage.setItem('token', accessToken); 
        localStorage.setItem('user', JSON.stringify(response.usuario));
        
        toast.success('Login realizado com sucesso!');
        
        navigate('/dashboard'); 
      } else {
        toast.error('Token não recebido do servidor');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const value: AuthContextType = {
    token,
    user,
    login,
    logout,
    refreshToken: async () => {},
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};