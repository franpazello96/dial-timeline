'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setServerError('');
    setErrors({});
    
    const validation = loginSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Partial<LoginFormData> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof LoginFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      console.error('Erro de login capturado na página:', error);

      let errorMessage = 'Erro ao fazer login';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-900">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-52 max-w-7xl px-4 w-full">
        <div className="text-center lg:text-left">
          <h1 className="text-white text-3xl md:text-4xl font-bold">
            TimeLink
          </h1>
          <p className="text-gray-400 mt-2">Faça login para continuar</p>
        </div>
        <div className="flex flex-col w-full lg:max-w-2xl gap-4">
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            {serverError && (
              <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg text-sm relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <strong>Erro: </strong>{serverError}
                  </div>
                  <button
                    type="button"
                    onClick={() => setServerError('')}
                    className="text-red-500 hover:text-red-700 ml-4"
                    title="Fechar mensagem de erro"
                    aria-label="Fechar mensagem de erro"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="email">
                Email
              </label>
              <input 
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                  errors.email ? 'ring-2 ring-red-500' : 'focus:ring-green-500'
                }`}
                placeholder="Digite seu email"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="text-red-400 text-sm mt-1 block">{errors.email}</span>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2" htmlFor="password">
                Senha
              </label>
              <input 
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                  errors.password ? 'ring-2 ring-red-500' : 'focus:ring-green-500'
                }`}
                placeholder="Digite sua senha"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="text-red-400 text-sm mt-1 block">{errors.password}</span>
              )}
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white p-2 rounded-lg font-bold hover:bg-green-600 transition-colors cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="text-center text-gray-400">
            Não possui uma conta?{' '}
            <Link href="/register" className="text-green-500 hover:underline">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

