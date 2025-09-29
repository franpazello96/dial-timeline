'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Erro no registro. Tente novamente.');
    } finally {
      setIsLoading(false);  
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-900">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-52 max-w-7xl px-4 w-full">
        <div className="text-center lg:text-left">
          <h1 className="text-white text-3xl md:text-4xl font-bold">
            Criar Conta
          </h1>
          <p className="text-gray-400 mt-2">
            Junte-se à nossa comunidade
          </p>
        </div>
        
        <div className="flex flex-col w-full lg:max-w-2xl gap-4">
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-600 text-white rounded-lg">
                {error}
              </div>
            )}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="username">Nome</label>
                <input 
                  type="text"
                  id="name"
                  name="name"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
                <input 
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="password">Senha</label>
                <input 
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite sua senha (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white p-2 rounded-lg font-bold 
                hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Criando conta...' : 'Cadastrar-se'}
            </button>
          </form>
          
          <div className="text-center text-gray-400">
            Já possui uma conta?{' '}
            <Link href="/login" className="text-green-500 hover:underline cursor-pointer">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
