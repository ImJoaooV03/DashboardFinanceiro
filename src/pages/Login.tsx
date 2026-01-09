import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: false
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      setErrorMsg(error.message === 'Invalid login credentials' 
        ? 'Email ou senha incorretos.' 
        : 'Ocorreu um erro ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Bem-vindo de volta" 
      subtitle="Digite suas credenciais para acessar sua conta."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
                })}
                type="email"
                className={clsx(
                  "block w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2",
                  errors.email 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                )}
                placeholder="seu@email.com"
              />
            </div>
            {errors.email && <span className="mt-1 text-xs text-red-500">{errors.email.message}</span>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Senha</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                {...register('password', { required: 'Senha é obrigatória' })}
                type="password"
                className={clsx(
                  "block w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2",
                  errors.password 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                )}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <span className="mt-1 text-xs text-red-500">{errors.password.message}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              {...register('remember')}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
              Lembrar-me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Esqueceu a senha?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight size={18} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-slate-50 px-2 text-slate-500">Novo por aqui?</span>
          </div>
        </div>

        <div className="text-center">
          <Link to="/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Criar uma conta gratuita
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
