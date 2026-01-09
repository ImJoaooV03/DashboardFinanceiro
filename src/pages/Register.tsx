import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
          }
        }
      });

      if (error) throw error;
      
      // Auto login or redirect
      navigate('/');
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Crie sua conta" 
      subtitle="Comece a controlar suas finanças hoje mesmo."
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome Completo</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                {...register('name', { required: 'Nome é obrigatório', minLength: { value: 3, message: 'Mínimo de 3 caracteres' } })}
                type="text"
                className={clsx(
                  "block w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2",
                  errors.name 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                )}
                placeholder="Seu nome"
              />
            </div>
            {errors.name && <span className="mt-1 text-xs text-red-500">{errors.name.message}</span>}
          </div>

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
                {...register('password', { 
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Mínimo de 6 caracteres' }
                })}
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirmar Senha</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                {...register('confirmPassword', { 
                  required: 'Confirmação é obrigatória',
                  validate: (val) => {
                    if (watch('password') != val) {
                      return "As senhas não coincidem";
                    }
                  }
                })}
                type="password"
                className={clsx(
                  "block w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2",
                  errors.confirmPassword 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                )}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <span className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</span>}
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
              Criar Conta
              <ArrowRight size={18} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Faça login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
