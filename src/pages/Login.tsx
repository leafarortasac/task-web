import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Activity, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import UsuarioForm from '../components/UsuarioForm';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('Formato de e-mail inválido'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.senha);
      navigate(from, { replace: true });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCadastroSuccess = () => {
    setShowCadastroModal(false);
  };

  const handleCadastroCancel = () => {
    setShowCadastroModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Activity className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciador de Tarefas</h1>
          <p className="text-gray-600 mt-2">Faça login para acessar suas tarefas</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="seu@email.com"
                className={`input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('senha')}
                type={showPassword ? 'text' : 'password'}
                id="senha"
                placeholder="Digite sua senha"
                className={`input pl-10 pr-10 ${errors.senha ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary btn-md w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner w-5 h-5 mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="mt-6 mb-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>
        </div>

        {/* Seção de Cadastro */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Não tem uma conta?
          </p>
          <button
            type="button"
            onClick={() => setShowCadastroModal(true)}
            className="btn-secondary btn-md w-full"
            disabled={isLoading}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Cadastre-se
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Sistema Gerenciador de Tarefas
          </p>
        </div>
      </div>

      {/* Modal de Cadastro */}
      <Modal
        isOpen={showCadastroModal}
        onClose={handleCadastroCancel}
        title="Cadastrar Novo Usuário"
        size="md"
      >
        <UsuarioForm
          onSuccess={handleCadastroSuccess}
          onCancel={handleCadastroCancel}
        />
      </Modal>
    </div>
  );
};

export default Login;